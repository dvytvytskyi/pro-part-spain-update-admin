"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LeafletMapProps {
    position: [number, number];
    setPosition: (pos: [number, number]) => void;
}

export default function LeafletMap({ position, setPosition }: LeafletMapProps) {
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize map
        if (!mapRef.current) {
            mapRef.current = L.map(containerRef.current).setView(position, 12);

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(mapRef.current);

            // Add initial marker
            markerRef.current = L.marker(position).addTo(mapRef.current);

            // Handle map clicks
            mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
                const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
                setPosition(newPos);

                // Update marker position
                if (markerRef.current) {
                    markerRef.current.setLatLng(e.latlng);
                }
            });
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update marker when position changes externally
    useEffect(() => {
        if (markerRef.current && mapRef.current) {
            markerRef.current.setLatLng(position);
            mapRef.current.setView(position);
        }
    }, [position]);

    return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
