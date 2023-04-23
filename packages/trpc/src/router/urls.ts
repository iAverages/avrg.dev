import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const urlRouter = createTRPCRouter({
    all: publicProcedure.query(async ({ ctx }) => {
        const url = await ctx.env.URLS.list<string>({ limit: 100 });
        console.log(url);
        return [...url.keys] as { name: string }[];
    }),
});
