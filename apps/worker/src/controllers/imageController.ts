import { IRequest } from "itty-router";

import { Env } from "..";
import { formatHeaders } from "../helpers/headers";

const retry = <T>(tries: number, wait: number, fn: () => Promise<Response>): Promise<Response> => {
    return new Promise((resolve, reject) => {
        fn()
            .then(resolve)
            .catch((error: Error) => {
                if (tries === 1) {
                    reject(error);
                    return;
                }
                setTimeout(() => {
                    retry(tries - 1, wait, fn).then(resolve, reject);
                }, wait);
            });
    });
};

export default async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    const url = new URL(request.url);
    const cache = caches.default;
    let response = await cache.match(request as any as Request);
    if (!response) {
        response = await retry(10, 500, async () => {
            const res = await fetch(`${env.B2URL}/file/${env.B2BUCKET}/${env.PATH_PREFIX}${url.pathname}`);
            if (res.status === 404) {
                throw new Error("404");
            }
            return res;
        });

        if (!response || response.status === 404) {
            throw new Error("404");
        }

        response = new Response(response.body, { ...response, headers: formatHeaders(response.headers, 86400) });
        ctx.waitUntil(cache.put(request as any as Request, response.clone()));
    }

    return response;
};
