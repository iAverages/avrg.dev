import { BackblazeB2 } from "cloudflare-b2/src";
import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { proxy } from "hono/proxy";
import { formatHeaders, retry } from "./utils";

const app = new Hono<{ Bindings: CloudflareBindings }>();

let b2: BackblazeB2 | null = null;

app.get("/:url", async (c) => {
	const url = c.req.param("url");
	const cache = caches.default;
	let response = await cache.match(c.req.raw);
	if (!response) {
		const controller = new AbortController();

		const race = await Promise.race([
			retry(
				20,
				500,
				async () => {
					const res = await proxy(
						`${c.env.B2_URL}/${c.env.B2_BUCKET}/${c.env.PATH_PREFIX}/${url}`,
					);
					if (res.status !== 200) {
						if (res.status === 404) throw new Error("404");
						console.error("fetching image failed with non 404", {
							status: res.status,
							text: await res.text(),
						});
						throw new Error("fetching image failed with non 404");
					}

					return res;
				},
				controller.signal,
			),
			// ensure we spend no longer than 9.5s retrying to fetch the image
			new Promise<false>((res) =>
				setTimeout(() => {
					controller.abort("timed out");
					res(false);
				}, 9500),
			),
		]);

		if (!race) return c.body("no image found", { status: 404 });
		response = race;

		if (!response || response.status === 404) {
			return c.body("no image found", { status: 404 });
		}

		response = new Response(response.body, {
			...response,
			headers: formatHeaders(response.headers, 86400),
		});
		c.executionCtx.waitUntil(cache.put(c.req.raw, response.clone()));
	}
	return response;
});

app.get("/", (c) => c.redirect("https://danielraybone.com"));

app
	// need to access context for env variables
	.use("*", async (c, next) =>
		basicAuth({ username: c.env.AUTH_USER, password: c.env.AUTH_PASS })(
			c,
			next,
		),
	)
	.post("/api/upload", async (c) => {
		if (!b2) {
			// i do not think i can get env without accessing env that is
			// passed into the function, this is just a slight work around
			b2 = new BackblazeB2({
				applicationKeyId: c.env.B2_KEY_ID,
				applicationKey: c.env.B2_KEY,
			});
			await b2.authorizeAccount();
		}
		await b2.getUploadUrl(c.env.B2_BUCKET_ID);
		const formData = await c.req.formData();
		const file = formData.get("file");
		if (!file || typeof file === "string") {
			return c.json({ message: "no file uploaded" }, { status: 400 });
		}

		// i do this here instead of waiting for the upload to complete
		// so i get the link faster and can post it places sooner
		c.executionCtx.waitUntil(
			b2.uploadFile(file, `${c.env.PATH_PREFIX}/${file.name}`).catch((e) => {
				console.error("upload failed:", e);
			}),
		);

		const url = new URL(c.req.url);
		const domain = url.hostname;
		const proto = url.protocol;
		return c.json({ link: `${proto}//${domain}/${file.name}` });
	});

export default app;
