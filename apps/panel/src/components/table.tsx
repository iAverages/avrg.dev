import * as React from "react";

import { cn } from "@/lib/utils";

export interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(({ className, children, ...props }, ref) => {
    return (
        <div className={cn(className, "my-6 w-full overflow-y-auto")}>
            <table ref={ref} className="w-full" {...props}>
                {children}
            </table>
        </div>
    );
});

export interface TableHeadProps extends React.TableHTMLAttributes<HTMLTableSectionElement> {}

const THead = React.forwardRef<HTMLTableSectionElement, TableHeadProps>(({ className, children, ...props }, ref) => {
    return (
        <thead ref={ref} {...props}>
            {children}
        </thead>
    );
});

export interface TableBodyProps extends React.TableHTMLAttributes<HTMLTableSectionElement> {}

const TBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(({ className, children, ...props }, ref) => {
    return (
        <tbody ref={ref} {...props}>
            {children}
        </tbody>
    );
});

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

const Tr = React.forwardRef<HTMLTableRowElement, TableRowProps>(({ className, children, ...props }, ref) => {
    return (
        <tr ref={ref} className={cn("m-0 border-t p-0 even:bg-muted", className)} {...props}>
            {children}
        </tr>
    );
});

export interface TableDataProps extends React.HTMLAttributes<HTMLTableCellElement> {}

const Td = React.forwardRef<HTMLTableCellElement, TableDataProps>(({ className, children, ...props }, ref) => {
    return (
        <td
            ref={ref}
            className={cn(
                "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
                className
            )}
            {...props}
        >
            {children}
        </td>
    );
});

export { Table, THead, TBody, Tr, Td };
