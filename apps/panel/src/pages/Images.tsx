import { For, Suspense, createEffect } from "solid-js";
import Layout from "~/components/layout";
import { api } from "~/utils/trpc";

const Item = () => {};
const Images = () => {
    const images = api.image.list.useInfiniteQuery(
        () => ({
            limit: 10,
            path: "nsfw/wamen/",
        }),
        // @ts-ignore
        () => ({ getNextPageParam: (lastPage) => lastPage.nextFileName })
    );

    console.log(images.data);

    return (
        <Layout>
            <div>
                <Suspense fallback={"Loading..."}>
                    <For each={images.data?.pages}>
                        {(page) => <For each={page.files}>{(file) => <div>{file.name}</div>}</For>}
                    </For>
                </Suspense>
            </div>
        </Layout>
    );
};

export default Images;
