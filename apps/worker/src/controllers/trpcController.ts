import { appRouter, createTRPCContext } from "@avrg.dev/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { IRequest } from "itty-router";

import { Env } from "..";

const getJwt = (request: IRequest) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader.substring(0, 6) !== "Bearer") {
        return null;
    }
    return authHeader.substring(6).trim();
};

export default async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
                "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers") ?? "*",
            },
        });
    }

    const jwtToken = getJwt(request);

    if (env.NODE_ENV !== "development") {
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
