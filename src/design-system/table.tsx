import React from "react";
import { cn } from "@/utils/cn";

export const Table = React.forwardRef<
  HTMLTableElement,
  React.TableHTMLAttributes<HTMLTableElement>
>(function Table({ className, children, ...props }, ref) {
  return (
    <table ref={ref} className={cn("w-full border-collapse text-sm", className)} {...props}>
      {children}
    </table>
  );
});

export const THead = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function THead({ className, children, ...props }, ref) {
  return (
    <thead ref={ref} className={cn("border-b-2 border-gray-200", className)} {...props}>
      {children}
    </thead>
  );
});

export const TBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(function TBody({ className, children, ...props }, ref) {
  return <tbody ref={ref} className={cn(className)} {...props}>{children}</tbody>;
});

export const TR = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(function TR({ className, children, ...props }, ref) {
  return (
    <tr ref={ref} className={cn("border-b border-gray-100 last:border-0", className)} {...props}>
      {children}
    </tr>
  );
});

export const TH = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(function TH({ className, children, ...props }, ref) {
  return (
    <th ref={ref} className={cn("py-2 px-4 text-left font-semibold text-gray-700", className)} {...props}>
      {children}
    </th>
  );
});

export const TD = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(function TD({ className, children, ...props }, ref) {
  return (
    <td ref={ref} className={cn("py-2 px-4 text-gray-600", className)} {...props}>
      {children}
    </td>
  );
});
