import { useState } from "react";

import Navigation from "@/components/navigation";

function App() {
    const [count, setCount] = useState(0);

    return (
        <>
            <h1>Vite + </h1>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
                {/* {data?.pages.map((page) => {
                    return (
                        <div className={"grid grid-cols-4"}>
                            {page.files.map((file) => {
                                let comp = <>Unknown content type - {file.fileName}</>;
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

                                return <div className={""}>{comp}</div>;
                            })}
                        </div>
                    );
                })} */}
            </div>
            <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
        </>
    );
}

export default App;
