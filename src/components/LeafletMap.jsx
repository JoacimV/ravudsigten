import { MapContainer, TileLayer, useMapEvent, Marker, Rectangle, GeoJSON } from "react-leaflet";
import { findNearestCoastline } from "../functions";
import React, { useState } from "react";
import { Icon } from 'leaflet'
import dk from "../resources/geojson/denmark-coastal-line.json"
import municipalities from "../resources/geojson/municipalities.json"
import logo from "../resources/images/marker-original.png"


/* eslint-disable react/prop-types */
function MovingMarker({ clickedPosition, setClickedPosition, setNearestPoint, setNearestNextPoint, setSplitLine, setSplitLine2 }) {
    let clickTimeout = null;  // Declare a variable to hold the timeout

    useMapEvent('click', (e) => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);  // If it's a double-click, clear the timeout
        }
        clickTimeout = setTimeout(() => {
            const { nearestPoint, nearestNextPoint, split } = findNearestCoastline(e.latlng);
            setClickedPosition(e.latlng);
            setNearestPoint(nearestPoint);
            setNearestNextPoint(nearestNextPoint);
            setSplitLine(split.features[0]);
            setSplitLine2(split.features[1]);
            // map.setView({ lat: nearestPoint.lat, lng: nearestPoint.lng }, 10, { animate: true, duration: 1 })
        }, 300);
    })
    // This function prevents setting position, when double clicking
    useMapEvent('dblclick', () => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);  // Cancel the pending click event if it's a double-click
        }
    });
    if (!clickedPosition) {
        return null
    }

    return (
        <Marker position={clickedPosition} icon={new Icon({
            iconUrl: logo,
            iconSize: [64, 64], // size of the icon
            iconAnchor: [32, 64], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -64] // point from which the popup should open relative to the iconAnchor
        })} />
    )
}


export default function LeafletMap({ nearestPoint, nearestNextPoint, setNearestPoint, setNearestNextPoint, bbox, debug }) {
    const [clickedPosition, setClickedPosition] = useState(undefined)
    const [splitLine, setSplitLine] = useState(undefined)
    const [splitLine2, setSplitLine2] = useState(undefined)

    return (
        <MapContainer style={{ height: "100vh", width: "100%" }} center={[56.0, 11.0]} zoom={7} maxZoom={18} minZoom={7}        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attributionControl={false} />
            <MovingMarker clickedPosition={clickedPosition} setClickedPosition={setClickedPosition} nearestPoint={nearestPoint} setNearestPoint={setNearestPoint} setNearestNextPoint={setNearestNextPoint} setSplitLine={setSplitLine} setSplitLine2={setSplitLine2} />
            {debug ?
                <>
                    <Marker opacity={.5} position={nearestPoint} />
                    <Marker opacity={1} position={nearestNextPoint} />
                    <GeoJSON data={dk} style={{ color: 'black' }} />
                    <GeoJSON data={municipalities} />
                    <GeoJSON data={splitLine} style={{ color: 'red' }} />
                    <GeoJSON data={splitLine2} style={{ color: 'green' }} />
                    <Rectangle bounds={[[bbox[1], bbox[0]], [bbox[3], bbox[2]]]} pathOptions={{ color: 'white' }} />
                </>
                : null}
        </MapContainer>
    )
}