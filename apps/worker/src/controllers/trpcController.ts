import { appRouter, createTRPCContext } from "@avrg.dev/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import jwt from "@tsndr/cloudflare-worker-jwt";
import { IRequest } from "itty-router";

import { Env } from "..";

type IRequestWithCookies = IRequest & {
    cookies: Record<string, string>;
};

const getJwt = (request: IRequest) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader.substring(0, 6) !== "Bearer") {
        return null;
    }
    return authHeader.substring(6).trim();
};

const respond = (request: IRequest, body: Record<string, string> | null, init: ResponseInit = {}) => {
    return new Response(JSON.stringify(body), {
        ...init,
        headers: {
            ...init.headers,
            "Access-Control-Allow-Origin": request.headers.get("origin") ?? "*",
            "Access-Control-Allow-Headers": request.headers.get("access-control-request-headers") ?? "*",
            "Access-Control-Allow-Credentials": "true",
        },
    });
};

export default async (request: IRequestWithCookies, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") {
        return respond(request, null);
    }

    if (env.NODE_ENV !== "development") {
        const jwtToken = getJwt(request);
        if (!jwtToken || !(await jwt.verify(jwtToken, env.API_TOKEN))) {
            return respond(
                request,
                { message: "Invalid Authorization header", jwt: jwtToken },
                {
                    status: 401,
                }
            );
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
