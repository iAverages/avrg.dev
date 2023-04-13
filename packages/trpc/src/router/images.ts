import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const imageRouter = createTRPCRouter({
    all: publicProcedure.query(({ ctx }) => {
        return "hello dan";
    }),
    delete: publicProcedure.input(z.string()).mutation(({ ctx, input }) => {
        return "hello dan";
    }),
});
