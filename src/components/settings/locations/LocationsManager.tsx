"use client";

import React, { useState, useEffect } from "react";
import GenericListManager from "./GenericListManager";
import RelationalListManager from "./RelationalListManager";

type LocationTab = "Countries" | "Cities" | "Areas";

export default function LocationsManager() {
    const [activeTab, setActiveTab] = useState<LocationTab>("Countries");
    const [isLoading, setIsLoading] = useState(true);

    const [countries, setCountries] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [areas, setAreas] = useState<any[]>([]);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings/locations');
            const data = await res.json();
            if (data && !data.error) {
                setCountries(data.countries || []);
                setCities(data.cities || []);
                setAreas(data.areas || []);
            }
        } catch (error) {
            console.error("Failed to fetch locations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCountry = async (name: string) => {
        const newCountry = { id: Date.now(), name };
        try {
            const res = await fetch('/api/settings/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'countries', data: newCountry }),
            });
            const data = await res.json();
            if (!data.error) {
                setCountries(data.countries);
            }
        } catch (error) {
            console.error("Failed to add country:", error);
        }
    };

    const handleAddCity = async (names: string[], countryId: number | string) => {
        const newCities = names.map((name, index) => ({
            id: Date.now() + index,
            name,
            countryId: Number(countryId)
        }));
        try {
            const res = await fetch('/api/settings/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'cities', data: newCities }),
            });
            const data = await res.json();
            if (!data.error) {
                setCities(data.cities);
            }
        } catch (error) {
            console.error("Failed to add cities:", error);
        }
    };

    const handleAddArea = async (names: string[], cityId: number | string) => {
        const newAreas = names.map((name, index) => ({
            id: Date.now() + index,
            name,
            cityId: Number(cityId)
        }));
        try {
            const res = await fetch('/api/settings/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'areas', data: newAreas }),
            });
            const data = await res.json();
            if (!data.error) {
                setAreas(data.areas);
            }
        } catch (error) {
            console.error("Failed to add areas:", error);
        }
    };

    const handleDelete = async (id: number | string, type: LocationTab) => {
        const apiType = type.toLowerCase() as 'countries' | 'cities' | 'areas';
        try {
            const res = await fetch(`/api/settings/locations?id=${id}&type=${apiType}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.error) {
                if (type === "Countries") setCountries(data.countries);
                if (type === "Cities") setCities(data.cities);
                if (type === "Areas") setAreas(data.areas);
            }
        } catch (error) {
            console.error("Failed to delete item:", error);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-gray-500">Loading locations...</div>;
    }

    return (
        <div>
            {/* Sub Tabs */}
            <div className="mb-6 flex gap-6 border-b border-gray-200 dark:border-gray-800">
                {(["Countries", "Cities", "Areas"] as LocationTab[]).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 text-sm font-medium transition-colors ${activeTab === tab
                            ? "border-b-2 border-brand-500 text-brand-500"
                            : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === "Countries" && (
                    <GenericListManager
                        placeholder="Country name"
                        items={countries}
                        onAdd={handleAddCountry}
                        onDelete={(id) => handleDelete(id, "Countries")}
                    />
                )}
                {activeTab === "Cities" && (
                    <RelationalListManager
                        parentLabel="Select Country"
                        placeholder="City names"
                        parents={countries}
                        items={cities.map((c) => ({ ...c, parentId: c.countryId }))}
                        onAdd={handleAddCity}
                        onDelete={(id) => handleDelete(id, "Cities")}
                    />
                )}
                {activeTab === "Areas" && (
                    <RelationalListManager
                        parentLabel="Select City"
                        placeholder="Area names"
                        parents={cities}
                        items={areas.map((a) => ({ ...a, parentId: a.cityId }))}
                        onAdd={handleAddArea}
                        onDelete={(id) => handleDelete(id, "Areas")}
                    />
                )}
            </div>
        </div>
    );
}
