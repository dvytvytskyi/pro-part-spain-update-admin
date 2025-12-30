"use client";

import React, { useState, useEffect } from "react";
import GenericListManager from "../locations/GenericListManager";

export default function AmenitiesManager() {
    const [amenities, setAmenities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAmenities();
    }, []);

    const fetchAmenities = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/settings/amenities');
            const data = await res.json();
            if (data && !data.error) {
                setAmenities(data);
            }
        } catch (error) {
            console.error("Failed to fetch amenities:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = async (name: string) => {
        const newAmenity = { id: Date.now(), name };
        try {
            const res = await fetch('/api/settings/amenities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newAmenity),
            });
            const data = await res.json();
            if (!data.error) {
                setAmenities(data);
            }
        } catch (error) {
            console.error("Failed to add amenity:", error);
        }
    };

    const handleDelete = async (id: number | string) => {
        try {
            const res = await fetch(`/api/settings/amenities?id=${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!data.error) {
                setAmenities(data);
            }
        } catch (error) {
            console.error("Failed to delete amenity:", error);
        }
    };

    if (isLoading) {
        return <div className="p-4 text-gray-500">Loading amenities...</div>;
    }

    return (
        <div>
            <div className="mb-6">
                <p className="text-gray-500 text-sm">Manage the list of available amenities for properties.</p>
            </div>
            <GenericListManager
                placeholder="Amenity name"
                items={amenities}
                onAdd={handleAdd}
                onDelete={handleDelete}
            />
        </div>
    );
}
