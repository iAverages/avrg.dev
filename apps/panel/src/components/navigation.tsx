import { ReactNode } from "react";
import { Link, useLocation } from "wouter";

const TabItem = ({ children, href }: { href: string; children: ReactNode }) => {
    const [location] = useLocation();
    console.log(location, href);
    return (
        <div
            className={
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            }
            data-state={location === href ? "active" : "inactive"}
        >
            <Link href={href}>{children}</Link>
        </div>
    );
};

const Navigation = () => {
    return (
        <div className="overflow-hidden rounded-[0.5rem] bg-background">
            <nav className="border-b">
                <div className="flex h-16 items-center px-4 md:px-8">
                    <Link href="/">avrg.dev</Link>
                    <span className="mx-2 text-lg font-bold text-muted-foreground">/</span>

                    {/* <MainNav className="mx-6" /> */}
                    <div className="ml-auto flex items-center space-x-4">
                        {/* <Search /> */}
                        {/* <UserNav /> */}
                    </div>
                </div>
            </nav>
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex flex-col justify-between space-y-2 md:flex-row md:items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                </div>
                <div
                    className={
                        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
                    }
                >
                    <TabItem href={"/"}>Overview</TabItem>
                    <TabItem href={"/images"}>Images</TabItem>
                    <TabItem href={"/shortener"}>Shortener</TabItem>
                </div>
            </main>
        </div>
    );
};

export default Navigation;
