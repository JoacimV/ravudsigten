import { useEffect, useState } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function HeatLayer({ minZoom, maxZoom, points }) {
    const map = useMap();
    const [zoom, setZoom] = useState(map.getZoom());
    useMapEvent('zoomend', () => setZoom(map.getZoom()));



    useEffect(() => {
        //Remove points with intensity lower than 60
        const filteredPoints = points.filter(point => point.intensity >= 60);
        const layer = L.heatLayer(filteredPoints.map(point => [point.lat, point.lng, point.intensity]), {
            radius: 12,
            blur: 15,
            minZoom,
            maxZoom,
            gradient: {
                // 0.2: '#fee08b',
                // 0.5: '#f0bc88',
                0.8: '#e68567',
                1.0: '#4e16cf'
            },
            minOpacity: 0.25,
        })

        layer.addTo(map);

        return () => {
            map.removeLayer(layer);
        };
    }, [map, zoom, points]);
}