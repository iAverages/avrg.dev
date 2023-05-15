import { useState } from "react";

import { TBody, THead, Table, Td, Tr } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { api } from "@/utils/api";

const Shortener = () => {
    const ctx = api.useContext();
    const { data } = api.url.list.useQuery();
    const { mutateAsync: deleteURL } = api.url.delete.useMutation({
        onMutate: async ({ key }) => {
            await ctx.url.list.cancel();
            const data = ctx.url.list.getData() ?? {};
            const oldData = { ...data };
            if (key in data) {
                delete data[key];
            }
            ctx.url.list.setData(undefined, data);
            return { oldData };
        },
        onError: (_, __, context) => {
            ctx.url.list.setData(undefined, context?.oldData ?? {});
        },
    });
    const { mutateAsync: createURL, isLoading } = api.url.create.useMutation({
        onMutate: async () => {
            await ctx.url.list.cancel();
            const oldData = ctx.url.list.getData();
            ctx.url.list.setData(undefined, () => ({ ...oldData, [slug]: url }));
            return { oldData };
        },
        onError: (_, __, context) => {
            ctx.url.list.setData(undefined, context?.oldData ?? {});
        },
    });

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [slug, setSlug] = useState("");
    const [url, setURL] = useState("");

    const deleteUrl = async (key: string) => {
        await deleteURL({ key });
    };

    const create = async () => {
        await createURL({ slug, url });
        setSlug("");
        setURL("");
        setShowCreateModal(false);
    };

    return (
        <>
            <Dialog open={showCreateModal}>
                <Button variant={"default"} onClick={() => setShowCreateModal(true)}>
                    Create
                </Button>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Create a short url</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Label htmlFor="slug" className="text-right">
                                            Slug <span className={"text-slate-500"}>*</span>
                                        </Label>
                                    </TooltipTrigger>
                                    <TooltipContent side={"left"}>
                                        <p>Leave blank to generate a random nanoid</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Input
                                id="slug"
                                placeholder="hello"
                                className="col-span-3"
                                onChange={(e) => setSlug(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Label htmlFor="url" className="text-right">
                                            URL <span className={"text-red-500"}>*</span>
                                        </Label>
                                    </TooltipTrigger>
                                    <TooltipContent side={"left"}>
                                        <p>Required</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <Input
                                id="url"
                                placeholder="https://danielraybone.com"
                                className="col-span-3"
                                onChange={(e) => setURL(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={create} disabled={isLoading}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Table className={"table-fixed block"}>
                <THead>
                    <Tr>
                        <Td>Slug</Td>
                        <Td className={"w-1 whitespace-break-spaces"}>URL</Td>
                        <Td className={"w-1 md:w-64 lg:w-96"}>Actions</Td>
                    </Tr>
                </THead>
                <TBody>
                    {Object.entries(data ?? {}).map(([slug, url]) => {
                        // The KV list function returns null for deleted keys for a short period of time
                        if (!url) {
                            return null;
                        }

                        return (
                            <Tr key={slug}>
                                <Td>{slug}</Td>
                                <Td>
                                    <div className={"overflow-hidden max-w-[54rem]"}>{url}</div>
                                </Td>
                                <Td>
                                    <div className={"flex gap-2"}>
                                        <Button variant={"destructive"} onClick={() => deleteUrl(slug)}>
                                            Delete
                                        </Button>
                                    </div>
                                </Td>
                            </Tr>
                        );
                    })}
                </TBody>
            </Table>
        </>
    );
};

export default Shortener;
