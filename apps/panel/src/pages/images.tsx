import { useState } from "react";

import { Card } from "@/components/ui/card";
import { api } from "@/utils/api";

const buildPrefix = (prefix: string, idx: number) => {
    return prefix.split("/").slice(0, -2).join("/") + "/";
};

const Images = () => {
    const [prefix, setPrefix] = useState("");
    const { data } = api.image.list.useInfiniteQuery(
        { path: prefix ?? "", limit: 10 },
        {
            getNextPageParam: (lastPage) => lastPage.nextFileName,
        }
    );

    return (
        <>
            {/* <div>{prefix}</div> */}
            {/* <div>{prefix.split("/").slice(0, -2).join("/") + "/"}</div> */}
            {/* <div>
                {prefix.split("/").map((part, idx) => {
                    const previousParts = prefix.split("/").slice(0, -2);
                    const oldPrefix = previousParts.join("/") + (previousParts.length > 0 ? "/" : "");
                    console.log("oldPrefix", oldPrefix);
                    return (
                        <span key={part} onClick={() => setPrefix(oldPrefix)}>
                            {part} /
                        </span>
                    );
                })}
            </div> */}
            {data?.pages.map((page) => {
                return (
                    <div key={page.nextFileName} className={"grid grid-cols-4"}>
                        {page.files.map((file, idx) => {
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

                            return (
                                <div key={file.fileId} className={""}>
                                    {comp}
                                </div>
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
};

export default Images;
