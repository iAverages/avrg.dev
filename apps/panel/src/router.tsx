import { Fragment, ReactNode, Suspense, lazy } from "react";
// import Loading from "./components/Loading";
import { Route } from "wouter";

const Loading = () => <div>Loading...</div>;

const PRESERVED = import.meta.globEager("./pages/(_app|404).tsx");
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

    console.log(preserved);

    return (
        <App>
            <Suspense fallback={<Loading />}>
                {routes.map(({ path, component: ChildComponent = Fragment }) => (
                    <Route key={path} path={path} component={() => <ChildComponent />} />
                ))}

                <Route path="*" component={() => <NotFound />} />
            </Suspense>
        </App>
    );
};

export default Router;
