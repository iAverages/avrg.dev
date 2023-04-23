import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/globals.css";
import Trpc from "./Trpc.tsx";
import Router from "./router.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <Trpc>
            <Router />
        </Trpc>
    </React.StrictMode>
);
