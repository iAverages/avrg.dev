import { ReactNode } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import Navigation from "@/components/navigation";

type AppProps = {
    children: ReactNode;
};

const App = ({ children }: AppProps) => {
    return (
        <>
            <Navigation />
            <main className={"px-8"}>{children}</main>
            <ReactQueryDevtools position={"bottom-right"} />
        </>
    );
};

export default App;
