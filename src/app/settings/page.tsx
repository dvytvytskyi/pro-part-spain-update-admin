"use client";

import React, { useState } from "react";
import LocationsManager from "@/components/settings/locations/LocationsManager";
import AmenitiesManager from "@/components/settings/amenities/AmenitiesManager";
import { Breadcrumb } from "@/components/ui/breadcrumb/Breadcrumb";

type SettingsTab = "Facilities" | "Locations";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>("Locations");

    return (
        <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-title-md2 font-bold text-gray-dark dark:text-white">
                    Settings
                </h2>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                {/* Top Level Tabs */}
                <div className="mb-8 flex gap-8 border-b border-gray-200 dark:border-gray-800">
                    {(["Facilities", "Locations"] as SettingsTab[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative pb-4 text-base font-medium transition-colors ${activeTab === tab
                                    ? "text-brand-500 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-brand-500"
                                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                }`}
                        >
                            {tab === "Facilities" ? "Amenities" : tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="min-h-[400px]">
                    {activeTab === "Facilities" && <AmenitiesManager />}
                    {activeTab === "Locations" && <LocationsManager />}
                </div>
            </div>
        </div>
    );
}
