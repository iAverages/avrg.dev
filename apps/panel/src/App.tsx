import type { Component } from "solid-js";

import styles from "./App.module.css";
import logo from "./logo.svg";
import { trpc } from "./utils/trpc";

const App: Component = () => {
    const res = trpc.image.all.useQuery();

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                <img src={logo} class={styles.logo} alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    class={styles.link}
                    href="https://github.com/solidjs/solid"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn Solid
                </a>
                <h1 class="text-3xl font-bold underline text-red-600">Hello world!</h1>
                <p>{res.data}</p>
            </header>
        </div>
    );
};

export default App;
