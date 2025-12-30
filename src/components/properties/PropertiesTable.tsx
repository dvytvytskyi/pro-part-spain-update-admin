"use client";

import React from "react";
import Image from "next/image";
import { Project } from "@/types/project";
import { newBuildingIds } from "@/data/newBuildingIds";
import Badge from "../ui/badge/Badge";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";

interface PropertiesTableProps {
    projects: Project[];
    onDelete?: (id: number) => void;
}

export default function PropertiesTable({ projects, onDelete }: PropertiesTableProps) {
    const router = useRouter();

    const formatPrice = (price: number, currency: string) => {
        return `${currency}${price.toLocaleString()}`;
    };

    const formatSize = (min: number, max?: number) => {
        if (max) return `${min}-${max} sq.m`;
        return `${min} sq.m`;
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Property
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Location
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Price
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Bedrooms
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Size
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Status
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400">
                                Completion
                            </TableCell>
                            <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-end text-sm dark:text-gray-400">
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {projects.map((project) => (
                            <TableRow
                                key={project.id}
                                className="hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
                                onClick={() => router.push(`/properties/${project.id}`)}
                            >
                                {/* Property Column */}
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                            {project.images[0]?.image_url ? (
                                                <Image
                                                    src={project.images[0].image_url}
                                                    alt={project.development_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="font-bold text-gray-800 text-sm dark:text-white">
                                                {project.development_name}
                                            </h5>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                ID: {project.reference_id}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Location */}
                                <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                                    {project.town}
                                </TableCell>

                                {/* Price */}
                                <TableCell className="px-5 py-4 text-start text-sm">
                                    <span className="font-bold text-gray-800 dark:text-white">
                                        From {formatPrice(project.price, project.currency)}
                                    </span>
                                </TableCell>

                                {/* Bedrooms */}
                                <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                                    {project.beds}
                                </TableCell>

                                {/* Size */}
                                <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                                    {formatSize(project.built_area, project.built_area_to)}
                                </TableCell>

                                {/* Status */}
                                <TableCell className="px-5 py-4 text-start">
                                    <Badge
                                        variant="solid"
                                        color={
                                            project.status === "Active"
                                                ? "success"
                                                : project.status === "Reserved"
                                                    ? "warning"
                                                    : (project.property_type === "New Building" || (project.reference_id && newBuildingIds.includes(project.reference_id)))
                                                        ? "info"
                                                        : "dark"
                                        }
                                        size="sm"
                                    >
                                        {(project.property_type === "New Building" || (project.reference_id && newBuildingIds.includes(project.reference_id)))
                                            ? "New Building"
                                            : project.status}
                                    </Badge>
                                </TableCell>

                                {/* Completion Date */}
                                <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                                    {formatDate(project.completion_date)}
                                </TableCell>

                                {/* Action */}
                                <TableCell className="px-5 py-4 text-end">
                                    <div className="flex justify-end relative z-20">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete && onDelete(project.id);
                                            }}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
                                            title="Delete Property"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M3 6h18" />
                                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                                <line x1="10" y1="11" x2="10" y2="17" />
                                                <line x1="14" y1="11" x2="14" y2="17" />
                                            </svg>
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
