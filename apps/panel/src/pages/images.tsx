import { useState } from "react";

import { Loader } from "@/components/loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/utils/api";

const getPath = (prefix: string, part: string) => {
    const parts = prefix.split("/").filter((part) => part !== "");
    const path = parts.slice(0, parts.indexOf(part) - 1).join("/");
    return path;
};

const Images = () => {
    const [prefix, setPrefix] = useState("");
    const { data, fetchNextPage, hasNextPage } = api.image.list.useInfiniteQuery(
        { path: prefix ?? "", limit: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextFileName,
        },
    );

    return (
        <>
            {/* Incomplete */}
            <div>
                {prefix
                    .split("/")
                    .filter((part) => part !== "")
                    .map((part, idx) => (
                        <>
                            <span
                                onClick={() => {
                                    if (idx === prefix.split("/").filter((part) => part !== "").length - 1) return;
                                    setPrefix(getPath(prefix, part));
                                }}
                            >
                                {part} <span className={"text-muted-foreground"}>/</span>{" "}
                            </span>
                        </>
                    ))}
            </div>

            {!data && <Loader />}

            {data?.pages.map((page) => {
                return (
                    <div
                        key={page.nextFileName}
                        className={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2"}
                    >
                        {page.files.map((file) => {
                            // Ignore backblaze empty files
                            if (file.fileName === ".bzEmpty") return null;

                            let comp = <>Unknown content type - {file.fileName}</>;
                            if (file.action === "folder") {
                                return (
                                    <Card
                                        key={file.uploadTimestamp + file.fileName}
                                        className={"p-12"}
                                        onClick={() => setPrefix(file.fileName)}
                                    >
                                        {file.fileName}
                                    </Card>
                                );
                            }

                            if (file.contentType?.startsWith("image")) {
                                comp = <img src={`https://cdn.danielraybone.com/${file.fileName}`} />;
                            }

                            if (file.contentType?.startsWith("video")) {
                                comp = (
                                    <video controls>
                                        <source src={`https://cdn.danielraybone.com/${file.fileName}`} />
                                    </video>
                                );
                            }

                            return <div key={file.fileId}>{comp}</div>;
                        })}
                    </div>
                );
            })}
            {hasNextPage && <Button onClick={() => fetchNextPage()}>Load More</Button>}
        </>
    );
};

export default Images;
