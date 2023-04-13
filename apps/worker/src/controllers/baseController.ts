import { IRequest } from "itty-router";
import { Env } from "..";
import imageController from "./imageController";
import shortenerController from "./shortenerController";

const controllerSteps = [imageController, shortenerController];

export default async (request: IRequest, env: Env, ctx: ExecutionContext) => {
    for (const controller of controllerSteps) {
        const response = await controller(request, env, ctx);
        if (!response) continue;
        return response;
    }

    return env.REDIRECT_URL
        ? Response.redirect(env.REDIRECT_URL, 301)
        : new Response(JSON.stringify({ message: "404 Not found" }), { status: 404 });
};
