import { ListFileNamesResponse } from "cloudflare-b2/src/interface";
import { z } from "zod";

import { b2Procedure, createTRPCRouter } from "../trpc";

let isAuthed = false;

export const imageRouter = createTRPCRouter({
    list: b2Procedure
        .input(
            z.object({
                limit: z.number().optional(),
                cursor: z.string().optional(),
                path: z.string().default(""),
            })
        )
        .query(async ({ ctx, input }) => {
            // temp solution to not auth every request
            if (!isAuthed) {
                await ctx.b2.authorizeAccount();
                isAuthed = true;
            }

            const data = await ctx.b2.listFileNames({
                bucketId: ctx.env.B2_BUCKET_ID,
                prefix: input.path,
                maxFileCount: input.limit,
                delimiter: "/",
                ...(input.cursor ? { startFileName: input.cursor } : {}),
            });
            return data as ListFileNamesResponse;
        }),
});
