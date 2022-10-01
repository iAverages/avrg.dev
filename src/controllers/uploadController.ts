import { BackblazeB2 } from "cloudflare-b2/src";
import { Env } from "..";

const b2 = new BackblazeB2({
    applicationKeyId: "0020d4a4136a0090000000017",
    applicationKey: "K002VdNyOBmudXBYBDSWk3ycqeJwHjI",
});

export default async (request: Request, env: Env, ctx: ExecutionContext) => {
    const auth = request.headers.get("Authorization");
    if (auth !== env.API_TOKEN) {
        return new Response(JSON.stringify({ message: "Invalid API Token" }), { status: 401 });
    }

    await b2.authorizeAccount();
    await b2.getUploadUrl("d0bdc44a649193267ae00019");
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
