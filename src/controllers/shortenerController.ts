import { Env } from "..";
import { z } from "zod";
import { nanoid } from "nanoid";

export default async (request: Request, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url);
    const key = url.pathname.split("/")[1];
    if (!key) return null;

    const keyRedirect = await env.URLS.get(key);
    if (!keyRedirect) return null;

    return Response.redirect(keyRedirect);
};

const createShortURLSchema = z.object({
    key: z.string().optional(),
    url: z.string(),
});

type CreateShortURL = z.infer<typeof createShortURLSchema>;

export const create = async (request: Request, env: Env, ctx: ExecutionContext) => {
    try {
        const content = await request.json<Partial<CreateShortURL>>();
        let { key, url } = createShortURLSchema.parse(content);

        // This will throw if the includes URL is invalid
        new URL(url);

        if (!key) {
            key = nanoid(6);
        }

        ctx.waitUntil(env.URLS.put(key, url));

        return new Response(JSON.stringify({ key, url }));
    } catch (e) {
        console.log(e);
        return new Response(JSON.stringify({ message: "Include a valid URL to shorten" }), { status: 400 });
    }
};
