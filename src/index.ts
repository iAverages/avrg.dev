import { Router } from "itty-router";
import imageController from "./controllers/imageController";
import uploadController from "./controllers/uploadController";

export interface Env {
    B2URL: string;
    B2BUCKET: string;
    PATH_PREFIX: string;
    REDIRECT_URL: string;
    API_TOKEN: string;
}

export const router = Router();

router.post("/api/upload", uploadController);
router.get("/*", imageController);

export default {
    fetch: (...args: [any]) =>
        router.handle(...args).catch((err) => {
            console.log(err);
            return new Response(JSON.stringify({ message: "An error has occured" }), { status: 500 });
        }),
};
