import { BackblazeB2 } from "cloudflare-b2/src";
import { Env } from "..";

let b2: BackblazeB2 | null = null;

export default async (request: Request, env: Env, ctx: ExecutionContext) => {
    const auth = request.headers.get("Authorization");
    if (auth !== env.API_TOKEN) {
        return new Response(JSON.stringify({ message: "Invalid API Token" }), { status: 401 });
    }

    if (!b2) {
        // I do not thing I can get env without accessing env that is
        // passed into the function, this is just a slight work around
        b2 = new BackblazeB2({
            applicationKeyId: env.B2_KEY_ID,
            applicationKey: env.B2_KEY,
        });
    }

    await b2.authorizeAccount();
    await b2.getUploadUrl(env.B2_BUCKET_ID);
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
        return new Response(JSON.stringify({ message: "No file uploaded" }), { status: 400 });
    }

    // I do this here instead of waiting for the upload to complete
    // so I get the link faster and can post it places sooner
    ctx.waitUntil(
        b2.uploadFile(file, `${env.PATH_PREFIX}/${file.name}`).catch((e) => {
            console.log(e);
        })
    );

    const url = new URL(request.url);
    const domain = url.hostname;
    const proto = url.protocol;
    return new Response(JSON.stringify({ link: `${proto}//${domain}/${file.name}` }));
};
