import { IRequest } from "itty-router";
import { nanoid } from "nanoid";
import { z } from "zod";

import { Env } from "..";

export default async (request: IRequest, env: Env, ctx: ExecutionContext) => {
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

export const create = async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    try {
        const content = await request.json();
        let { key, url } = createShortURLSchema.parse(content);

        // This will throw if the includes URL is invalid
        const parsedURL = new URL(url);
        if (!parsedURL.protocol.startsWith("http")) {
            throw new Error();
        }

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
