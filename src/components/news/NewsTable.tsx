"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Switch from "../ui/switch/Switch";

export interface NewsArticle {
    id: string;
    title: string;
    text: string;
    image_url: string;
    published: boolean;
    created_at: string;
}

interface NewsTableProps {
    articles: NewsArticle[];
    onTogglePublish: (id: string, published: boolean) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export default function NewsTable({ articles, onTogglePublish, onEdit, onDelete }: NewsTableProps) {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const truncateText = (text: string, maxLength: number = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                            >
                                News
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                            >
                                Text
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                            >
                                Status
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-start text-sm dark:text-gray-400"
                            >
                                Created At
                            </TableCell>
                            <TableCell
                                isHeader
                                className="px-5 py-3 font-medium text-gray-500 text-center text-sm dark:text-gray-400"
                            >
                                Actions
                            </TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {articles.map((article) => (
                            <TableRow
                                key={article.id}
                                className="hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer"
                                onClick={() => onEdit(article.id)}
                            >
                                {/* News Column */}
                                <TableCell className="px-5 py-4 sm:px-6 text-start">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                            {article.image_url ? (
                                                <Image
                                                    src={article.image_url}
                                                    alt={article.title}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-500">
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                        <div className="max-w-xs">
                                            <h5 className="font-bold text-gray-800 text-sm dark:text-white line-clamp-2">
                                                {article.title}
                                            </h5>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Text Preview */}
                                <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400 max-w-md">
                                    <p className="line-clamp-2">{truncateText(article.text)}</p>
                                </TableCell>

                                {/* Status Toggle */}
                                <TableCell className="px-5 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Switch
                                            checked={article.published}
                                            onChange={(checked) => onTogglePublish(article.id, checked)}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {article.published ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Created At */}
                                <TableCell className="px-5 py-4 text-gray-500 text-start text-sm dark:text-gray-400">
                                    {formatDate(article.created_at)}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="px-5 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(article.id);
                                            }}
                                            className="text-brand-500 hover:text-brand-600"
                                            title="Edit"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M14.1667 2.49993C14.3856 2.28106 14.6454 2.10744 14.9314 1.98899C15.2173 1.87054 15.5238 1.80957 15.8334 1.80957C16.1429 1.80957 16.4494 1.87054 16.7353 1.98899C17.0213 2.10744 17.2811 2.28106 17.5 2.49993C17.7189 2.7188 17.8925 2.97863 18.011 3.2646C18.1294 3.55057 18.1904 3.85706 18.1904 4.16659C18.1904 4.47612 18.1294 4.78262 18.011 5.06859C17.8925 5.35455 17.7189 5.61439 17.5 5.83326L6.25002 17.0833L1.66669 18.3333L2.91669 13.7499L14.1667 2.49993Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(article.id);
                                            }}
                                            className="text-red-500 hover:text-red-600"
                                            title="Delete"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M2.5 5H4.16667H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M6.66669 5.00008V3.33341C6.66669 2.89139 6.84228 2.46746 7.15484 2.1549C7.4674 1.84234 7.89133 1.66675 8.33335 1.66675H11.6667C12.1087 1.66675 12.5327 1.84234 12.8452 2.1549C13.1578 2.46746 13.3334 2.89139 13.3334 3.33341V5.00008M15.8334 5.00008V16.6667C15.8334 17.1088 15.6578 17.5327 15.3452 17.8453C15.0327 18.1578 14.6087 18.3334 14.1667 18.3334H5.83335C5.39133 18.3334 4.9674 18.1578 4.65484 17.8453C4.34228 17.5327 4.16669 17.1088 4.16669 16.6667V5.00008H15.8334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
