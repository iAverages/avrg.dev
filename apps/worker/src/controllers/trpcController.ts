import { appRouter, createTRPCContext } from "@avrg.dev/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { IRequest } from "itty-router";

import { Env } from "..";

export default async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") {
        return new Response(null, {
            headers: {
                "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
                "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers") ?? "*",
            },
        });
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
