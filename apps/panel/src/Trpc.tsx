import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { api } from "./utils/api";

type TrpcProviderProps = {
    children: React.ReactNode;
};

const getBaseUrl = () => {
    return import.meta.env.API_WORKER_URL || "http://localhost:8787";
};

const Trpc = ({ children }: TrpcProviderProps) => {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        api.createClient({
            transformer: superjson,
            links: [
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                }),
            ],
        })
    );
    return (
        <api.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </api.Provider>
    );
};

export default Trpc;
