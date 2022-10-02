import { Env } from "..";
import { formatHeaders } from "../helpers/headers";

export default async (request: Request, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url);
    const cache = caches.default;
    let response = await cache.match(request);
    if (!response) {
        response = await fetch(`${env.B2URL}/file/${env.B2BUCKET}/${env.PATH_PREFIX}${url.pathname}`);
        if (env.REDIRECT_URL && response.status === 404) {
            return Response.redirect(env.REDIRECT_URL, 301);
        }
        response = new Response(response.body, { ...response, headers: formatHeaders(response.headers, 86400) });
        ctx.waitUntil(cache.put(request, response.clone()));
    }

    return response;
};
