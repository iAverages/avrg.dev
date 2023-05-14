/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1)
 * 2. You want to create a new middleware or type of procedure (see Part 3)
 *
 * tl;dr - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end
 */
import { initTRPC } from "@trpc/server";
import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { BackblazeB2 } from "cloudflare-b2/src";
import superjson from "superjson";
import { ZodError } from "zod";

// TODO: Move this to own package and import on worker and trpc?
export interface Env {
    B2URL: string;
    B2BUCKET: string;
    B2_KEY_ID: string;
    B2_KEY: string;
    B2_BUCKET_ID: string;
    PATH_PREFIX: string;
    REDIRECT_URL: string;
    API_TOKEN: string;
    URLS: KVNamespace;
}

export const createTRPCContext = async (opts: FetchCreateContextFnOptions, env: Env) => {
    return { ...opts, env };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
            },
        };
    },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

let b2: BackblazeB2 | null = null;

const b2Context = t.middleware(({ ctx, next }) => {
    if (!b2) {
        // I do not think I can get env without accessing env that is
        // passed into the function, this is just a slight work around
        b2 = new BackblazeB2({
            applicationKeyId: ctx.env.B2_KEY_ID,
            applicationKey: ctx.env.B2_KEY,
        });
        b2.authorizeAccount();
    }

    return next({
        ctx: {
            b2,
        },
    });
});

export const b2Procedure = t.procedure.use(b2Context);
