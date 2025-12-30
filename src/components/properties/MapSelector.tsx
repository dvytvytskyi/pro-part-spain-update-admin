"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import "leaflet/dist/leaflet.css";

interface MapSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (lat: number, lng: number) => void;
    initialLat?: number;
    initialLng?: number;
}

// Map component that will be loaded dynamically
const DynamicMap = dynamic(
    () => import("./LeafletMap"),
    {
        ssr: false,
        loading: () => (
            <div className="h-[500px] w-full bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Loading map...</span>
            </div>
        )
    }
);

export default function MapSelector({
    isOpen,
    onClose,
    onSelect,
    initialLat = 36.5098, // Marbella latitude
    initialLng = -4.8826, // Marbella longitude
}: MapSelectorProps) {
    const [position, setPosition] = useState<[number, number]>([initialLat, initialLng]);

    useEffect(() => {
        if (isOpen) {
            setPosition([initialLat, initialLng]);
        }
    }, [isOpen, initialLat, initialLng]);

    const handleConfirm = () => {
        onSelect(position[0], position[1]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="!bg-gray-800 dark:!bg-gray-900 max-w-4xl p-6">
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white">
                    Select Location on Map
                </h3>

                <p className="text-sm text-gray-400">
                    Click anywhere on the map to place a marker
                </p>

                {/* Interactive Map */}
                <div className="h-[500px] w-full rounded-lg overflow-hidden">
                    <DynamicMap position={position} setPosition={setPosition} />
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                        Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" size="sm" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleConfirm}>
                            Confirm Location
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
