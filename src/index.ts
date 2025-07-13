import { Hono } from "hono";
import { formatHeaders, retry } from "./utils";

const app = new Hono<{ Bindings: CloudflareBindings }>();

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
					const res = await fetch(
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

export default app;
