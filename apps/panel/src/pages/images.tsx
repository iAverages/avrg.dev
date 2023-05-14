import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/utils/api";

const Images = () => {
    const [prefix, setPrefix] = useState("");
    const { data, fetchNextPage, hasNextPage } = api.image.list.useInfiniteQuery(
        { path: prefix ?? "", limit: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextFileName,
        }
    );

    return (
        <>
            {data?.pages.map((page) => {
                return (
                    <div key={page.nextFileName} className={"grid grid-cols-4"}>
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
