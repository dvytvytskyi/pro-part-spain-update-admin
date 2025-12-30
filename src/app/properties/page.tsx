"use client";

import React, { useState, useEffect, useCallback } from "react";
import PropertiesTable from "@/components/properties/PropertiesTable";
import Button from "@/components/ui/button/Button";
import InputField from "@/components/form/input/InputField";
import Pagination from "@/components/ui/pagination/Pagination";
import Link from "next/link";

type PropertyType = "Off-Plan" | "Secondary" | "Rent";

export default function PropertiesPage() {
    const [activeTab, setActiveTab] = useState<PropertyType>("Off-Plan");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [projects, setProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 20;

    const fetchProjects = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                type: activeTab,
                search: searchQuery,
                page: String(currentPage),
                limit: String(itemsPerPage)
            });

            const res = await fetch(`/api/properties?${params.toString()}`);
            const result = await res.json();

            if (result && !result.error) {
                setProjects(result.data || []);
                setTotalPages(result.totalPages || 1);
                setTotalItems(result.totalItems || 0);
            }
        } catch (err) {
            console.error("Failed to fetch projects:", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeTab, searchQuery, currentPage]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Handle search change with a slight reset
    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setCurrentPage(1); // Reset to first page when searching
    };

    // Handle tab change
    const handleTabChange = (tab: PropertyType) => {
        setActiveTab(tab);
        setCurrentPage(1); // Reset to first page when changing tab
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this property?")) return;

        try {
            const res = await fetch(`/api/properties/${id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                // Remove locally to update UI instantly
                setProjects(prev => prev.filter(p => p.id !== id));
                setTotalItems(prev => prev - 1);
            } else if (res.status === 404) {
                // Already deleted
                alert("Property was already deleted or not found.");
                setProjects(prev => prev.filter(p => p.id !== id));
                setTotalItems(prev => prev - 1);
            } else {
                alert("Failed to delete property");
            }
        } catch (error) {
            console.error("Error deleting property:", error);
            alert("Error deleting property");
        }
    };

    return (
        <div>
            {/* Header Row */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-gray-dark dark:text-white">
                    Properties ({totalItems})
                </h2>
                <div className="flex gap-3">
                    <Link href="/properties/add">
                        <Button size="sm">
                            + Add Property
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters Row */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Segmented Control */}
                <div className="inline-flex rounded-lg border border-stroke bg-white p-1 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    {(["Off-Plan", "Secondary", "Rent"] as PropertyType[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-brand-500 text-white shadow-sm"
                                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                }`}
                        >
                            {tab === "Off-Plan" ? "New Building" : tab}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:max-w-xs">
                    <InputField
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill="currentColor" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill="currentColor" />
                        </svg>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex h-100 items-center justify-center rounded-xl border border-gray-200 bg-white p-10 dark:border-white/[0.05] dark:bg-white/[0.03]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
                        <p className="text-gray-500">Loading properties...</p>
                    </div>
                </div>
            ) : (
                <>
                    <PropertiesTable projects={projects} onDelete={handleDelete} />

                    {totalPages > 1 && (
                        <div className="mt-6">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}

                    {projects.length === 0 && !isLoading && (
                        <div className="text-center py-20 text-gray-500">
                            No properties found matching your criteria.
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
