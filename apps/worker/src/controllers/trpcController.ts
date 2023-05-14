import { appRouter, createTRPCContext } from "@avrg.dev/trpc";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { IRequest } from "itty-router";
import * as jose from "jose";

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

let JWKS: (
    protectedHeader?: jose.JWSHeaderParameters | undefined,
    token?: jose.FlattenedJWSInput | undefined
) => Promise<jose.KeyLike>;

const verifyJwt = async (jwtToken: string, env: Env) => {
    if (env.NODE_ENV === "development") {
        return true;
    }

    if (!JWKS) {
        JWKS = jose.createRemoteJWKSet(
            new URL(`https://${env.CF_ACCESS_TEAM}.cloudflareaccess.com/cdn-cgi/access/certs`)
        );
    }

    try {
        await jose.jwtVerify(jwtToken, JWKS);
        return true;
    } catch (e) {
        return false;
    }
};

export default async (request: IRequestWithCookies, env: Env, ctx: ExecutionContext) => {
    if (request.method === "OPTIONS") {
        return respond(request, null);
    }

    const jwtToken = getJwt(request);
    if (!jwtToken || !(await verifyJwt(jwtToken, env))) {
        return respond(
            request,
            { message: "Invalid Authorization header" },
            {
                status: 401,
            }
        );
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
