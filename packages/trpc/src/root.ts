import { imageRouter } from "./router/images";
import { urlRouter } from "./router/urls";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
    image: imageRouter,
    url: urlRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
