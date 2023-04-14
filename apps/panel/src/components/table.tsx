import { Table, flexRender } from "@tanstack/solid-table";
import { For } from "solid-js";

type TableProps = {
    table: Table<any>;
};

const AutoTable = (props: TableProps) => {
    return (
        <table>
            <thead>
                <For each={props.table.getHeaderGroups()}>
                    {(headerGroup) => (
                        <tr>
                            <For each={headerGroup.headers}>
                                {(header) => (
                                    <th>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                )}
                            </For>
                        </tr>
                    )}
                </For>
            </thead>
            <tbody>
                <For each={props.table.getRowModel().rows}>
                    {(row) => {
                        console.log("row", row.getAllCells());
                        console.log("row", row.getAllCells()[0].column.columnDef.cell);
                        return (
                            <tr>
                                <For each={row.getAllCells()}>
                                    {(cell) => <td>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>}
                                </For>
                            </tr>
                        );
                    }}
                </For>
            </tbody>
            <tfoot>
                <For each={props.table.getFooterGroups()}>
                    {(footerGroup) => (
                        <tr>
                            <For each={footerGroup.headers}>
                                {(header) => (
                                    <th>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.footer, header.getContext())}
                                    </th>
                                )}
                            </For>
                        </tr>
                    )}
                </For>
            </tfoot>
        </table>
    );
};

export default AutoTable;
