import { appRouter, createTRPCContext } from "@avrg.dev/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { IRequest } from "itty-router";

import { Env } from "..";

type IRequestWithCookies = IRequest & {
    cookies: Record<string, string>;
};

export default async (request: IRequestWithCookies, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
                "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers") ?? "*",
            },
        });
    }

    if (env.NODE_ENV !== "development") {
        const jwtToken = request.cookies.CF_Authorization;
        if (!jwtToken || (await jwt.verify(jwtToken, env.API_TOKEN)) === false) {
            return new Response(JSON.stringify({ message: "Invalid Authorization header" }), {
                status: 401,
                headers: {
                    "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
                    "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers") ?? "*",
                },
            });
        }
    }

    const response = await fetchRequestHandler({
        router: appRouter,
        endpoint: "/api/trpc",
        req: request as any as Request,
        createContext: (opts) => createTRPCContext(opts, env),
        responseMeta: () => {
            return {
                headers: {
                    "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
                },
            };
        },
    });

    return response;
};
