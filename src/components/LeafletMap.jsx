import { MapContainer, TileLayer, useMapEvent, Marker, Popup, GeoJSON } from "react-leaflet";
import { findNearestCoastline, findNearestMetStation, findNearestTideStation } from "../functions";
import React, { useRef, useState, useEffect } from "react";
import { Icon } from 'leaflet'
import L from "leaflet";
import "leaflet.heat";
import HeatLayer from "./HeatLayer";
import MapGuideControl from "./MapGuideControl";
import dk from "../resources/geojson/test1.json"
import logo from "../resources/images/marker.svg"
import MapHeader from "./MapHeader"
const minZoom = 1, maxZoom = 14;
const OBSERVATIONS_BASE_URL = "https://dswx6vubccbkr.cloudfront.net/raw";
const MAP_LAYER_STORAGE_KEY = "amberFinder.mapLayer"


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

export default function LeafletMap({ nearestPoint, nearestNextPoint, setNearestPoint, setNearestNextPoint, debug, stations = [], onNearestStationObservationsChange }) {
    const [clickedPosition, setClickedPosition] = useState(undefined)
    const [splitLine, setSplitLine] = useState(undefined)
    const [splitLine2, setSplitLine2] = useState(undefined)
    const [nearestMetStation, setNearestMetStation] = useState(undefined)
    const [nearestTideStation, setNearestTideStation] = useState(undefined)
    const [isSatellite, setIsSatellite] = useState(() => {
        if (typeof window === "undefined") {
            return true
        }

        const storedMapLayer = window.localStorage.getItem(MAP_LAYER_STORAGE_KEY)

        if (storedMapLayer === "standard") {
            return false
        }

        return true
    })
    const observationRequestIdRef = useRef(0)
    const [points, setPoints] = useState([]);

    useEffect(() => {
        window.localStorage.setItem(MAP_LAYER_STORAGE_KEY, isSatellite ? "satellite" : "standard")
    }, [isSatellite])

    useEffect(() => {
        const fetchPoints = async () => {

            const response = await fetch("https://dswx6vubccbkr.cloudfront.net/enriched/coast-points-simple.json");
            const data = await response.json();
            const points = [];

            for (const point of data) {
                const intensity = point[0] * 100; // Assuming the first element is the intensity
                if (intensity > 60) {
                    points.push({
                        intensity: intensity,
                        stationId: point[1],
                        lat: point[3],
                        lng: point[2],
                    })
                }
            }
            setPoints(points);
        }
        fetchPoints();
    }, []);

    const mapMetObservation = (feature) => {
        const props = feature?.properties ?? {}
        const value = Number(props.value)
        return {
            timestamp: props.observed,
            observed: props.observed,
            windSpeed: props.parameterId === 'wind_max' && Number.isFinite(value) ? value : undefined,
            windDirection: props.parameterId === 'wind_dir' && Number.isFinite(value) ? value : undefined,
        }
    }

    const mapTideObservation = (feature) => {
        const props = feature?.properties ?? {}
        const value = Number(props.value)

        return {
            timestamp: props.predictionTime,
            observed: props.created,
            tideHeight: Number.isFinite(value) ? value : undefined,
        }
    }

    const fetchNearestStationObservations = async (metStation, tidewaterStation) => {
        const requestId = observationRequestIdRef.current + 1
        observationRequestIdRef.current = requestId

        onNearestStationObservationsChange?.({
            metStation,
            tidewaterStation,
            met: {
                loading: !!metStation,
                error: undefined,
                observations: [],
            },
            tidewater: {
                loading: !!tidewaterStation,
                error: undefined,
                observations: [],
            },
        })

        const fetchState = async (station, source, parameter) => {
            if (!station?.stationId) {
                return {
                    loading: false,
                    error: undefined,
                    observations: [],
                }
            }

            try {
                const response = await fetch(`${OBSERVATIONS_BASE_URL}/${station.stationId}/${parameter ? `report_${parameter}` : 'report'}.json`)

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`)
                }

                const payload = await response.json()
                const features = Array.isArray(payload?.features) ? payload.features : []
                const observations = source === 'met'
                    ? features.map(mapMetObservation)
                    : features.map(mapTideObservation)
                return {
                    loading: false,
                    error: undefined,
                    observations,
                }
            } catch {
                return {
                    loading: false,
                    error: `Kunne ikke hente observationer (${source})`,
                    observations: [],
                }
            }
        }

        const [metWindSpeed, metWindDir, tidewaterState] = await Promise.all([
            fetchState(metStation, 'met', 'wind_max'),
            fetchState(metStation, 'met', 'wind_dir'),
            fetchState(tidewaterStation, 'tidewater'),
        ])
        if (observationRequestIdRef.current !== requestId) {
            return
        }

        const windSpeed = metWindSpeed.observations.filter(obs => {
            const observedDate = new Date(obs.observed);
            return observedDate.getMinutes() === 0;
        })
        const windDir = metWindDir.observations.filter(obs => {
            const observedDate = new Date(obs.observed);
            return observedDate.getMinutes() === 0;
        })
        onNearestStationObservationsChange?.({
            metStation,
            tidewaterStation,
            met: {
                windSpeed: windSpeed.map(obs => ({ observed: obs.observed, windSpeed: obs.windSpeed })),
                windDir: windDir.map(obs => ({ observed: obs.observed, windDirection: obs.windDirection })),
            },
            tidewater: tidewaterState,
        })
    }


    const mapLayerUrl = isSatellite
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"

    return (
        <div style={{ position: "relative" }}>
            <MapHeader />
            <button
                type="button"
                onClick={() => setIsSatellite((prev) => !prev)}
                style={{
                    position: "absolute",
                    bottom: 12,
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
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.22)",

                }}
                title="Skift kortlag"
            >
                {isSatellite ? "🗺️" : "🛰️"}
            </button>
            <MapGuideControl />
            <MapContainer attributionControl={false} style={{ height: "100vh", width: "100%" }} center={[56.0, 11.0]} zoom={8} >
                <TileLayer url={mapLayerUrl} maxZoom={maxZoom} minZoom={minZoom} />
                <MovingMarker
                    clickedPosition={clickedPosition}
                    setClickedPosition={(latlng) => {
                        setClickedPosition(latlng)
                        const closestMetStation = findNearestMetStation(latlng, stations)
                        const closestTideStation = findNearestTideStation(latlng, stations)
                        fetchNearestStationObservations(closestMetStation, closestTideStation)
                        setNearestMetStation(closestMetStation)
                        setNearestTideStation(closestTideStation)
                    }}
                    nearestPoint={nearestPoint}
                    setNearestPoint={setNearestPoint}
                    setNearestNextPoint={setNearestNextPoint}
                    setSplitLine={setSplitLine}
                    setSplitLine2={setSplitLine2}
                />
                <HeatLayer minZoom={minZoom} maxZoom={maxZoom} points={points} />
                {
                    debug ?
                        <>
                            <Marker opacity={.5} position={nearestPoint} >
                                <Popup>
                                    <div style={{ minWidth: 160 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>Nearest coastline point</div>
                                        <div style={{ fontSize: 12, opacity: 0.8 }}>Lat: {nearestPoint.lat}</div>
                                        <div style={{ fontSize: 12, opacity: 0.8 }}>Lng: {nearestPoint.lng}</div>
                                    </div>
                                </Popup>
                            </Marker>
                            <Marker opacity={.5} position={nearestNextPoint} >
                                <Popup>
                                    <div style={{ minWidth: 160 }}>
                                        <div style={{ fontWeight: 700, marginBottom: 4 }}>Nearest next coastline point</div>
                                        <div style={{ fontSize: 12, opacity: 0.8 }}>Lat: {nearestNextPoint.lat}</div>
                                        <div style={{ fontSize: 12, opacity: 0.8 }}>Lng: {nearestNextPoint.lng}</div>
                                    </div>
                                </Popup>
                            </Marker>

                            <Marker opacity={1} position={nearestNextPoint} style={{ color: 'white' }} />
                            <GeoJSON data={dk} style={{ color: 'white' }} />
                            <GeoJSON data={splitLine} style={{ color: 'red' }} />
                            <GeoJSON data={splitLine2} style={{ color: 'green' }} />
                            {/* <GeoJSON data={pointsAlongGeoJson(dk, .25)} style={{ color: 'blue' }} /> */}
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
                                })
                            }
                        </> : null}
            </MapContainer>
        </div >
    )
}