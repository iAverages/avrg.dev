import { ThrowableRouter, withCookies } from "itty-router-extras";

import baseController from "./controllers/baseController";
import { create as createShortURLController } from "./controllers/shortenerController";
import trpcController from "./controllers/trpcController";
import uploadController from "./controllers/uploadController";

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
    NODE_ENV: string;
    CF_ACCESS_TEAM: string;
}

export const router = ThrowableRouter();

router.post("/api/upload", uploadController);
router.post("/api/short", createShortURLController);
router.all("/api/trpc/*", withCookies, trpcController);
router.get("/*", baseController);

export default {
    fetch: (...args: [any]) =>
        router.handle(...args).catch((err) => {
            console.log(err);
            return new Response(JSON.stringify({ message: "An error has occured" }), { status: 500 });
        }),
};
