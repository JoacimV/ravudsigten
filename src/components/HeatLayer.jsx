import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "./CustomHeat"
// Sørg for at den modificerede kode fra ovenfor er importeret/kørt her

export default function HeatLayer({ minZoom, maxZoom, points = [] }) {
    const map = useMap();

    useEffect(() => {
        const formattedPoints = points.map((p) => [p.lat, p.lng, p.intensity ?? 1]);

        const layer = L.heatLayer(formattedPoints, {
            radius: 12,
            blur: 14,
            minZoom,
            maxZoom,
            gradient: {
                0.8: "#e68567",
                1.0: "#4e16cf",
            },
            minOpacity: 0.25,
        });

        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, points, minZoom, maxZoom]);

    return null;
}