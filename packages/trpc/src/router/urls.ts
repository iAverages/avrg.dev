import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const urlRouter = createTRPCRouter({
    list: publicProcedure.query(async ({ ctx }) => {
        const url = (await ctx.env.URLS.list<string>({ limit: 100 })) as KVNamespaceListResult<string, string>;
        const data = (
            await Promise.all(url.keys.map(async (key) => ({ [key.name]: await ctx.env.URLS.get(key.name) })))
        ).reduce((acc, cur) => ({ ...acc, ...cur }));

        return data as Record<string, string>;
    }),

    update: publicProcedure.input(z.object({ key: z.string(), value: z.string() })).query(async ({ ctx, input }) => {
        try {
            await ctx.env.URLS.put(input.key, input.value);
            return true;
        } catch (e) {
            console.log(e);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to update URL" });
        }
    }),

    delete: publicProcedure.input(z.object({ key: z.string() })).mutation(async ({ ctx, input }) => {
        try {
            await ctx.env.URLS.delete(input.key);
            return true;
        } catch (e) {
            console.log(e);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete URL" });
        }
    }),

    create: publicProcedure
        .input(z.object({ slug: z.string().optional(), url: z.string() }))
        .mutation(async ({ ctx, input }) => {
            try {
                let slug = input.slug;
                if (!slug) {
                    slug = nanoid(6);
                }
                await ctx.env.URLS.put(slug, input.url);
                return slug;
            } catch (e) {
                console.log(e);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create URL" });
            }
        }),
});
