import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/icons";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // First page
        if (startPage > 1) {
            pages.push(
                <button
                    key={1}
                    onClick={() => onPageChange(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-dark dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                pages.push(
                    <span key="dots-start" className="flex items-end px-1 text-gray-500">
                        ...
                    </span>
                );
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${i === currentPage
                        ? "border-brand-500 bg-brand-500 text-white hover:bg-brand-600"
                        : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-dark dark:text-gray-400 dark:hover:bg-white/[0.03]"
                        }`}
                >
                    {i}
                </button>
            );
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(
                    <span key="dots-end" className="flex items-end px-1 text-gray-500">
                        ...
                    </span>
                );
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => onPageChange(totalPages)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-dark dark:text-gray-400 dark:hover:bg-white/[0.03]"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 py-4">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-dark dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1">{renderPageNumbers()}</div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:bg-gray-dark dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </div>
    );
}
