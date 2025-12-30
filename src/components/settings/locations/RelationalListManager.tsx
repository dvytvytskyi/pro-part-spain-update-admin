"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";

interface RelationalListManagerProps {
    parentLabel: string;
    placeholder: string;
    parents: { id: number | string; name: string }[];
    items: { id: number | string; name: string; parentId?: number | string }[];
    onAdd: (names: string[], parentId: number | string) => void;
    onDelete: (id: number | string) => void;
}

export default function RelationalListManager({
    parentLabel,
    placeholder,
    parents,
    items,
    onAdd,
    onDelete,
}: RelationalListManagerProps) {
    const [selectedParent, setSelectedParent] = useState<string | number>(
        parents[0]?.id || ""
    );
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (inputValue.trim() && selectedParent) {
            // Split by new line or comma
            const names = inputValue
                .split(/[\n,]+/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            if (names.length > 0) {
                onAdd(names, selectedParent);
                setInputValue("");
            }
        }
    };

    const getParentName = (parentId?: number | string) => {
        return parents.find((p) => p.id === parentId)?.name || "Unknown";
    };

    // Sort items: selected parent first, then others
    const sortedItems = [...items].sort((a, b) => {
        if (a.parentId === selectedParent && b.parentId !== selectedParent)
            return -1;
        if (a.parentId !== selectedParent && b.parentId === selectedParent)
            return 1;
        return 0;
    });

    return (
        <div className="space-y-6">
            {/* Input Section */}
            <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {parentLabel}
                    </label>
                    <div className="relative">
                        <select
                            value={selectedParent}
                            onChange={(e) => setSelectedParent(Number(e.target.value))}
                            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3.5 pr-10 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500"
                        >
                            {parents.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.name}
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5 7.5L10 12.5L15 7.5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {placeholder} (Add multiple per line or comma separated)
                    </label>
                    <textarea
                        rows={3}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-500"
                        placeholder="e.g. Area 1, Area 2&#10;Area 3"
                    />
                </div>

                <div className="flex justify-end">
                    <Button onClick={handleAdd}>Add Items</Button>
                </div>
            </div>

            {/* List Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sortedItems
                    .filter(
                        (item) => item.parentId === selectedParent || selectedParent === ""
                    )
                    .map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {item.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                    {getParentName(item.parentId)}
                                </span>
                            </div>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                            </button>
                        </div>
                    ))}
            </div>
        </div>
    );
}
