import { useState } from "react";

import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { api } from "./utils/api";

function App() {
    const [count, setCount] = useState(0);

    const { data } = api.image.list.useInfiniteQuery(
        { path: "screenshots/", limit: 100 },
        {
            getNextPageParam: (lastPage) => lastPage.nextFileName,
        }
    );

    return (
        <>
            <div>
                <a href="https://vitejs.dev" target="_blank">
                    <img src={viteLogo} className="logo" alt="Vite logo" />
                </a>
                <a href="https://react.dev" target="_blank">
                    <img src={reactLogo} className="logo react" alt="React logo" />
                </a>
            </div>
            <h1>Vite + </h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
                {data?.pages.map((page) => {
                    return (
                        <div className={"grid grid-cols-10"}>
                            {page.files.map((file) => {
                                let comp = <>Unknown content type - {file.fileName}</>;
                                console.log(file.contentType);
                                if (file.contentType.startsWith("image")) {
                                    comp = <img src={`https://cdn.danielraybone.com/${file.fileName}`} />;
                                }
                                if (file.contentType.startsWith("video")) {
                                    comp = (
                                        <video controls>
                                            <source src={`https://cdn.danielraybone.com/${file.fileName}`} />
                                        </video>
                                    );
                                }

                                return <div className={"w-64"}>{comp}</div>;
                            })}
                        </div>
                    );
                })}
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </>
    );
}

export default App;
