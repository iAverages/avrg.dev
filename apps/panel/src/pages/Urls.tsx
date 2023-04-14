import { ColumnDef, createSolidTable, getCoreRowModel } from "@tanstack/solid-table";
import { For, createEffect, createSignal } from "solid-js";

import Layout from "@/components/layout";
import AutoTable from "@/components/table";
import { api } from "@/utils/trpc";

type Url = {
    name: string;
};

const defaultColumns: ColumnDef<Url>[] = [
    {
        accessorKey: "name",
        header: "Slug",
        cell: (info) => info.getValue(),
    },
];

const Urls = () => {
    const urls = api.url.all.useQuery();

    const table = createSolidTable({
        get data() {
            return urls.data || [];
        },
        columns: defaultColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Layout>
            <div>lmfao</div>
            <AutoTable table={table} />
        </Layout>
    );
};

export default Urls;
