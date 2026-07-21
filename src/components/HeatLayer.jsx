import { useEffect, useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import { pointsAlongGeoJson } from "../functions.js";
import dk from "../resources/geojson/denmark-coastal-line.json";
import "leaflet.heat";

export default function HeatLayer({ minZoom, maxZoom }) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());
    const [points, setPoints] = useState([]);
    useMapEvent('zoomend', () => setZoom(map.getZoom()));

    useEffect(() => {
        const cpoints = pointsAlongGeoJson(dk, 1);
        if (!cpoints || cpoints.features.length === 0) {
            return;
        }
        const points = cpoints.features.map(point => {
            // Generate random number between 0-1, skewed towards lower values
            const randomOffset = Math.pow(Math.random(), 128);
            return {
                lat: point.geometry.coordinates[1],
                lng: point.geometry.coordinates[0],
                intensity: randomOffset,
            };
        });
        setPoints(points);
    }, []);


    useEffect(() => {
        const midPoints = points
            .filter(point => point.intensity >= 0.33 && point.intensity < 0.66)
            .map(point => [point.lat, point.lng, 0.75]);
        const highPoints = points
            .filter(point => point.intensity >= 0.66)
            .map(point => [point.lat, point.lng, 1.0]);

        // Set the radius based on the zoom level, with a minimum of 25 and a maximum of 50
        const minRadius = 40, maxRadius = 70;
        const radius = Math.round(minRadius + ((zoom - minZoom) / (maxZoom - minZoom)) * (maxRadius - minRadius));
        const minOpacity = 0.3;
        const layer = L.layerGroup([
            L.heatLayer(midPoints, {
                radius,
                blur: 28,
                // maxZoom: 12,
                gradient: { 0.4: 'rgba(250, 204, 21, 0.25)', 1.0: 'rgba(234, 179, 8, 1)' },
                minOpacity,
            }),
            L.heatLayer(highPoints, {
                radius,
                blur: 28,
                // maxZoom: 12,
                gradient: { 0.4: 'rgba(248, 113, 113, 0.35)', 1.0: 'rgba(220, 38, 38, 1)' },
                minOpacity,
            }),
        ]);
        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, zoom, points]);

    return null;
}