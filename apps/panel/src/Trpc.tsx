import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { api } from "./utils/api";

type TrpcProviderProps = {
    children: React.ReactNode;
};

const getBaseUrl = () => {
    return import.meta.env.VITE_API_WORKER_URL || "http://localhost:8787";
};

const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts!.pop()!.split(";").shift();
    return null;
};

const Trpc = ({ children }: TrpcProviderProps) => {
    const [queryClient] = useState(() => new QueryClient());
    const [trpcClient] = useState(() =>
        api.createClient({
            transformer: superjson,
            links: [
                httpBatchLink({
                    url: `${getBaseUrl()}/api/trpc`,
                    fetch(url, options) {
                        return fetch(url, {
                            ...options,
                            headers: {
                                ...(options?.headers ?? {}),
                                Authorization: `Bearer ${getCookie("CF_Authorization")}`,
                            },
                        });
                    },
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
