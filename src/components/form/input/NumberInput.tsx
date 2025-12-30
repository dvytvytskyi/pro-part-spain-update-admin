"use client";

import React, { useState, useEffect } from "react";

interface NumberInputProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    onChange?: (value: string) => void;
    className?: string;
}

export default function NumberInput({
    value,
    defaultValue = "",
    placeholder,
    onChange,
    className = "",
}: NumberInputProps) {
    const [displayValue, setDisplayValue] = useState(
        formatNumber(defaultValue || value || "")
    );

    useEffect(() => {
        if (value !== undefined) {
            setDisplayValue(formatNumber(value));
        }
    }, [value]);

    function formatNumber(num: string): string {
        // Remove all non-digit characters
        const cleaned = num.replace(/\D/g, "");
        if (!cleaned) return "";

        // Add commas
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function unformatNumber(formatted: string): string {
        return formatted.replace(/,/g, "");
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const unformatted = unformatNumber(rawValue);
        const formatted = formatNumber(unformatted);

        setDisplayValue(formatted);

        if (onChange) {
            onChange(unformatted);
        }
    };

    return (
        <input
            type="text"
            value={displayValue}
            placeholder={placeholder}
            onChange={handleChange}
            className={`h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 ${className}`}
        />
    );
}
