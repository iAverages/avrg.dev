import { Fragment, ReactNode, Suspense, lazy } from "react";
import { Route, Switch } from "wouter";

import { Loader } from "@/components/loader";

const PRESERVED = import.meta.glob("./pages/(_app|404).tsx", { eager: true });
const ROUTES = import.meta.glob("./pages/**/[A-Za-z[]*.tsx");

const preserved: Partial<Record<"_app" | "404", React.FC>> = Object.keys(PRESERVED).reduce((pres, file) => {
    const key = file.replace(/\.\/pages\/|\.tsx$/g, "");
    return { ...pres, [key]: (PRESERVED[file] as any).default as React.FC };
}, {});

type LazyComponent = () => Promise<{ default: () => JSX.Element }>;

export const routes = Object.keys(ROUTES).map((route) => {
    const path = route
        .replace(/\.\/pages|index|\.tsx$/g, "")
        .replace(/\[\.{3}.+\]/, "*")
        .replace(/\[(.+)\]/, ":$1");

    return { path, component: lazy(ROUTES[route] as LazyComponent), preload: ROUTES[route] };
});

const Router = () => {
    const App: React.FC<{ children: ReactNode | ReactNode[] }> = preserved?.["_app"] || Fragment;
    const NotFound: React.FC = preserved?.["404"] || Fragment;

    return (
        <App>
            <Suspense fallback={<Loader />}>
                <Switch>
                    {routes.map(({ path, component: ChildComponent = Fragment }) => (
                        <Route key={path} path={path} component={() => <ChildComponent />} />
                    ))}

                    <Route component={() => <NotFound />} />
                </Switch>
            </Suspense>
        </App>
    );
};

export default Router;
