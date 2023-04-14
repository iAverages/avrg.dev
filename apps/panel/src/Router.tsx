import { Route, Routes, Router as SolidRouter } from "@solidjs/router";
import { lazy } from "solid-js";

const Home = lazy(() => import("@/pages/Home"));
const Urls = lazy(() => import("@/pages/Urls"));
const Images = lazy(() => import("@/pages/Images"));

const Router = () => {
    return (
        <SolidRouter>
            <Routes>
                <Route path="/" component={Home} />
                <Route path="/images" component={Images} />
                <Route path="/urls" component={Urls} />
                <Route path="*" component={Home} />
            </Routes>
        </SolidRouter>
    );
};

export default Router;
