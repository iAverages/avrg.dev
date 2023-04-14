import { AppRouter } from "@avrg.dev/trpc";
import { QueryClient } from "@tanstack/solid-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCSolid } from "solid-trpc";
import superjson from "superjson";

const getBaseUrl = () => {
    return import.meta.env.API_WORKER_URL || "http://localhost:8787";
};

export const api = createTRPCSolid<AppRouter>();

export const client = api.createClient({
    transformer: superjson,
    links: [
        loggerLink({
            enabled: () => true,
        }),
        httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
        }),
    ],
});

export const queryClient = new QueryClient();
