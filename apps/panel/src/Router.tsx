import { Route, Routes, Router as SolidRouter } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("@/pages/Home"));

const Router = () => {
    return (
        <SolidRouter>
            <Routes>
                <Route path="/" component={Home} />
                <Route path="*" component={Home} />
            </Routes>
        </SolidRouter>
    );
};

export default Router;
