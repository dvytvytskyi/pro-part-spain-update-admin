"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";

interface GenericListManagerProps {
    placeholder: string;
    items: { id: number | string; name: string }[];
    onAdd: (name: string) => void;
    onDelete: (id: number | string) => void;
}

export default function GenericListManager({
    placeholder,
    items,
    onAdd,
    onDelete,
}: GenericListManagerProps) {
    const [inputValue, setInputValue] = useState("");

    const handleAdd = () => {
        if (inputValue.trim()) {
            onAdd(inputValue.trim());
            setInputValue("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleAdd();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <div className="relative w-full max-w-xs">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3.5 text-sm text-gray-800 focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:text-white dark:focus:border-brand-500"
                    />
                </div>
                <Button onClick={handleAdd} className="bg-brand-500 hover:bg-brand-600 text-white">
                    Add
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                        <span className="font-medium text-gray-800 dark:text-white">
                            {item.name}
                        </span>
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
