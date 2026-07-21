import { MapContainer, TileLayer, useMapEvent, Marker, Rectangle, GeoJSON, Popup } from "react-leaflet";
import { findNearestCoastline, findNearestMetStation, findNearestTideStation } from "../functions";
import React, { useState } from "react";
import { Icon } from 'leaflet'
import L from "leaflet";
import "leaflet.heat";
import HeatLayer from "./HeatLayer";
import dk from "../resources/geojson/denmark-coastal-line.json"
import municipalities from "../resources/geojson/municipalities.json"
import points from "../one-off/coast-points-enriched-quarter.json"
import logo from "../resources/images/marker.svg"

const minZoom = 7, maxZoom = 14;


const tidewaterStationIcon = L.divIcon({
    className: 'station-marker-icon station-marker-icon--tidewater',
    html: `
        <div style="
            width: 28px;
            height: 28px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(14,165,233,0.98), rgba(3,105,161,0.98));
            border: 2px solid rgba(255,255,255,0.96);
            box-shadow: 0 6px 16px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            line-height: 1;
        ">T</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
});

const metStationIcon = L.divIcon({
    className: 'station-marker-icon station-marker-icon--met',
    html: `
        <div style="
            width: 28px;
            height: 28px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(244,114,182,0.98), rgba(190,24,93,0.98));
            border: 2px solid rgba(255,255,255,0.96);
            box-shadow: 0 6px 16px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            line-height: 1;
        ">M</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
});

const getStationIcon = (source) => {
    if (source === 'tidewater') {
        return tidewaterStationIcon;
    }

    if (source === 'met') {
        return metStationIcon;
    }

    return null;
};



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
            iconSize: [64 * 1.5, 64 * 1.5], // size of the icon
            iconAnchor: [32, 64], // point of the icon which will correspond to marker's location
            popupAnchor: [0, -64] // point from which the popup should open relative to the iconAnchor
        })} />
    )
}

const selectedStationIcon = L.divIcon({
    className: 'station-marker-icon station-marker-icon--selected',
    html: `
        <div style="
            width: 36px;
            height: 36px;
            border-radius: 999px;
            background: linear-gradient(180deg, rgba(250,204,21,0.98), rgba(217,119,6,0.98));
            border: 2px solid rgba(255,255,255,0.98);
            box-shadow: 0 8px 18px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 14px;
            line-height: 1;
            font-weight: 700;
        ">★</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
});


export default function LeafletMap({ nearestPoint, nearestNextPoint, setNearestPoint, setNearestNextPoint, bbox, debug, stations = [] }) {
    const [clickedPosition, setClickedPosition] = useState(undefined)
    const [splitLine, setSplitLine] = useState(undefined)
    const [splitLine2, setSplitLine2] = useState(undefined)
    const [nearestMetStation, setNearestMetStation] = useState(undefined)
    const [nearestTideStation, setNearestTideStation] = useState(undefined)
    const [debugWindDirection, setDebugWindDirection] = useState("270")
    const [isSatellite, setIsSatellite] = useState(true)

    const parsedDebugWindDirection = Number(debugWindDirection)
    const hasValidWindDirection = Number.isFinite(parsedDebugWindDirection)

    const calculateIsOnshore = (coastlineAzimuth, windDirection) => {
        const normalizeDegrees = (degrees) => {
            const normalized = degrees % 360
            return normalized < 0 ? normalized + 360 : normalized
        }

        const angularDifference = (a, b) => {
            const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b))
            return diff > 180 ? 360 - diff : diff
        }

        const onshoreCenter = normalizeDegrees(coastlineAzimuth - 90)
        return angularDifference(windDirection, onshoreCenter) <= 60
    }

    const mapLayerUrl = isSatellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setIsSatellite((prev) => !prev)}
                style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1000,
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(0, 0, 0, 0.7)",
                    color: "#fff",
                    padding: "8px 10px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                }}
                title="Skift kortlag"
            >
                {isSatellite ? "Standard 🗺️" : "Satellit 🛰️"}
            </button>

            {debug ? (
                <div
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 1000,
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "#fff",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.2)",
                        minWidth: 180,
                    }}
                >
                    <div style={{ fontSize: 12, marginBottom: 6 }}>Debug wind direction</div>
                    <input
                        type="number"
                        min="0"
                        max="360"
                        value={debugWindDirection}
                        onChange={(e) => setDebugWindDirection(e.target.value)}
                        placeholder="0-360"
                        style={{ width: "100%", padding: "4px 6px" }}
                    />
                    <div
                        style={{
                            marginTop: 8,
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                border: "1px solid rgba(255,255,255,0.35)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <span
                                style={{
                                    display: "inline-flex",
                                    transform: `rotate(${hasValidWindDirection ? parsedDebugWindDirection : 0}deg)`,
                                    transformOrigin: "center center",
                                    transition: "transform 0.15s linear",
                                    lineHeight: 1,
                                }}
                                title="Wind direction arrow"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 20, height: 20 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                </svg>
                            </span>
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.9 }}>
                            {hasValidWindDirection ? `${parsedDebugWindDirection}deg` : "N/A"}
                        </div>
                    </div>
                </div>
            ) : null}

            <MapContainer style={{ height: "100vh", width: "100%" }} center={[56.0, 11.0]} zoom={8}>
                <TileLayer url={mapLayerUrl} attributionControl={false} maxZoom={maxZoom} minZoom={minZoom} />
                <MovingMarker
                    clickedPosition={clickedPosition}
                    setClickedPosition={(latlng) => {
                        setClickedPosition(latlng)
                        const closestMetStation = findNearestMetStation(latlng, stations)
                        const closestTideStation = findNearestTideStation(latlng, stations)         
                        setNearestMetStation(closestMetStation)
                        setNearestTideStation(closestTideStation)
                    }}
                    nearestPoint={nearestPoint}
                    setNearestPoint={setNearestPoint}
                    setNearestNextPoint={setNearestNextPoint}
                    setSplitLine={setSplitLine}
                    setSplitLine2={setSplitLine2}
                />
                {debug ?
                    <>
                        <HeatLayer minZoom={minZoom} maxZoom={maxZoom} />
                        <Marker opacity={.5} position={nearestPoint} />
                        <Marker opacity={1} position={nearestNextPoint} />
                        <GeoJSON data={dk} style={{ color: 'black' }} />
                        <GeoJSON data={municipalities} />
                        <GeoJSON data={splitLine} style={{ color: 'red' }} />
                        <GeoJSON data={splitLine2} style={{ color: 'green' }} />
                        {/* <GeoJSON data={pointsAlongGeoJson(dk, .4)} style={{ color: 'blue' }} /> */}
                        <GeoJSON
                            key={`debug-points-${debugWindDirection}`}
                            data={{
                                type: "FeatureCollection",
                                features: points.map(point => ({
                                    type: "Feature",
                                    properties: {
                                        id: point.id,
                                        latitude: point.latitude,
                                        longitude: point.longitude,
                                        azimuth: point.azimuth,
                                        municipality: point.municipalityId?.Name,
                                    },
                                    geometry: {
                                        type: "Point",
                                        coordinates: [point.longitude, point.latitude]
                                    }
                                }))
                            }}
                            pointToLayer={(_, latlng) => L.circleMarker(latlng, {
                                radius: 4,
                                color: "#ff5500",
                                weight: 1,
                                fillOpacity: 0.9,
                                interactive: true,
                                pane: "markerPane",
                            })}
                            onEachFeature={(feature, layer) => {
                                const props = feature?.properties || {};
                                const windStatus = hasValidWindDirection
                                    ? (calculateIsOnshore(Number(props.azimuth), parsedDebugWindDirection) ? "Onshore" : "Offshore")
                                    : "N/A";
                                const tooltip = [
                                    `ID: ${props.id ?? "N/A"}`,
                                    `Lat: ${Number(props.latitude).toFixed(5)}`,
                                    `Lng: ${Number(props.longitude).toFixed(5)}`,
                                    `Azimuth: ${Number(props.azimuth).toFixed(2)}`,
                                    `Azimuth dir: <span style="display:inline-block;transform:rotate(${Number(props.azimuth).toFixed(2)}deg);transform-origin:center;">&#8593;</span>`,
                                    `Municipality: ${props.municipality ?? "N/A"}`,
                                    `Wind direction: ${hasValidWindDirection ? parsedDebugWindDirection : "N/A"}`,
                                    `Wind relation: ${windStatus}`,
                                ].join("<br />");
                                layer.bindTooltip(tooltip, {
                                    sticky: true,
                                    direction: "top",
                                    opacity: 0.95,
                                });
                                layer.on({
                                    mouseover: () => layer.openTooltip(),
                                    mouseout: () => layer.closeTooltip(),
                                });
                            }}
                        />

                        <Rectangle bounds={[[bbox[1], bbox[0]], [bbox[3], bbox[2]]]} pathOptions={{ color: 'white' }} />
                        {stations
                            .filter((station) => Number.isFinite(Number(station?.latitude)) && Number.isFinite(Number(station?.longitude)))
                            .map((station) => {
                                const isNearestMet = nearestMetStation?.stationName === station.stationName
                                const isNearestTide = nearestTideStation?.stationName === station.stationName

                                return (
                                    <Marker
                                        key={station.pk}
                                        position={[Number(station.latitude), Number(station.longitude)]}
                                        icon={isNearestMet || isNearestTide ? selectedStationIcon : getStationIcon(station.source)}
                                    >
                                        <Popup>
                                            <div style={{ minWidth: 160 }}>
                                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{station.stationName}</div>
                                                <div style={{ fontSize: 12, opacity: 0.8 }}>{station.source} station</div>
                                                <div style={{ fontSize: 12, marginTop: 4 }}>ID: {station.stationId}</div>
                                                {isNearestMet ? (
                                                    <div style={{ fontSize: 12, marginTop: 4 }}>
                                                        Nearest met: {nearestMetStation.distanceKm.toFixed(2)} km
                                                    </div>
                                                ) : null}
                                                {isNearestTide ? (
                                                    <div style={{ fontSize: 12, marginTop: 4 }}>
                                                        Nearest tidewater: {nearestTideStation.distanceKm.toFixed(2)} km
                                                    </div>
                                                ) : null}
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            })}
                    </>
                    : null}

            </MapContainer>
        </div>
    )
}