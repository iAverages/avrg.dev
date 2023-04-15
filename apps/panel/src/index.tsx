/* @refresh reload */
import { render } from "solid-js/web";

import "flowbite";
import "~/index.css";
import Router from "~/Router";
import { api, client, queryClient } from "~/utils/trpc";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
    throw new Error(
        "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
    );
}

render(
    () => (
        <api.Provider client={client} queryClient={queryClient}>
            <Router />
        </api.Provider>
    ),
    root!
);
