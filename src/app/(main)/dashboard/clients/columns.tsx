"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Client = {
    id: string;
    cedula: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    status: "active" | "blocked" | "defaulted";
    createdAt: string;
};

export const clientColumns: ColumnDef<Client>[] = [
    {
        accessorKey: "cedula",
        header: "Cédula",
    },
    {
        accessorKey: "firstName",
        header: "Nombre",
    },
    {
        accessorKey: "lastName",
        header: "Apellido",
    },
    {
        accessorKey: "phone",
        header: "Teléfono",
    },
    {
        accessorKey: "status",
        header: "Estado",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <div
                    className={`capitalize px-2 py-1 rounded text-xs font-semibold w-fit ${status === "active" ? "bg-green-100 text-green-700" :
                        status === "blocked" ? "bg-red-100 text-red-700" :
                            "bg-yellow-100 text-yellow-700"
                        }`}
                >
                    {status}
                </div>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const client = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(client.id)}
                        >
                            Copiar ID de cliente
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                        <DropdownMenuItem>Editar cliente</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
