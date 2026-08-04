"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialPosition?: [number, number];
}

function LocationMarker({ onLocationSelect, initialPosition }: MapPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        initialPosition ? new L.LatLng(initialPosition[0], initialPosition[1]) : null
    );
    
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={DefaultIcon} />
    );
}

// Helper to center map if initialPosition changes
function ChangeView({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

export default function RescueMap() {
    // This is the parent component that will wrap the actual Leaflet Map
    // to handle dynamic import. See rescue/page.tsx for usage.
    return null; 
}

export { MapContainer, TileLayer, LocationMarker, ChangeView };
