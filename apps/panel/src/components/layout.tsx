import { JSX, children } from "solid-js";

type LayoutProps = {
    children: JSX.Element;
};

const Layout = (props: LayoutProps) => {
    const c = children(() => props.children);

    return (
        <div class="flex flex-col h-screen">
            <header class="flex-shrink-0">
                <h1 class="text-2xl font-bold text-center py-4">Panel</h1>
            </header>
            <main class="flex-1 flex flex-col m-4">{c()}</main>
        </div>
    );
};

export default Layout;
