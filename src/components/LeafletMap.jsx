import { MapContainer, TileLayer, useMapEvent, Marker, Popup, GeoJSON } from "react-leaflet";
import { findNearestCoastline, findNearestMetStation, findNearestTideStation } from "../functions";
import React, { useRef, useState, useEffect } from "react";
import { Icon } from 'leaflet'
import L from "leaflet";
import "leaflet.heat";
import HeatLayer from "./HeatLayer";
import MapGuideControl from "./MapGuideControl";
import dk from "../resources/geojson/test1.json"
import logo from "../resources/images/marker-rav.png"
import MapHeader from "./MapHeader"
import Slider from "./Slider";
const minZoom = 1, maxZoom = 14;
const OBSERVATIONS_BASE_URL = "https://dswx6vubccbkr.cloudfront.net/raw";
const MAP_LAYER_STORAGE_KEY = "amberFinder.mapLayer"
const WIND_INTENSITY_THRESHOLD = 55


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

const getStationIcon = (source, selected) => {
    const icon = source === 'tidewater' ? tidewaterStationIcon : metStationIcon;
    if (selected) {
        // Make a copy of the source icon and modify its properties for the selected state
        const selectedIcon = L.divIcon({
            className: icon.options.className + ' station-marker-icon--selected',
            html: icon.options.html.replace(/background: linear-gradient\([^)]+\)/, 'background: linear-gradient(180deg, rgba(250,204,21,0.98), rgba(217,119,6,0.98))'),
            iconSize: [64, 64],
            iconAnchor: icon.options.iconAnchor,
            popupAnchor: icon.options.popupAnchor,
        });
        return selectedIcon;
    } else {
        return icon;
    }
}

function MovingMarker({ clickedPosition, setClickedPosition, setNearestPoint, setNearestNextPoint, suppressNextClickToken }) {
    let clickTimeout = null;  // Declare a variable to hold the timeout
    const shouldIgnoreNextClickRef = useRef(false)
    const markerRef = useRef(null)

    useEffect(() => {
        if (suppressNextClickToken > 0) {
            shouldIgnoreNextClickRef.current = true
        }
    }, [suppressNextClickToken])

    useMapEvent('click', (e) => {
        if (shouldIgnoreNextClickRef.current) {
            shouldIgnoreNextClickRef.current = false
            return
        }

        if (clickTimeout) {
            clearTimeout(clickTimeout);  // If it's a double-click, clear the timeout
        }
        clickTimeout = setTimeout(() => {
            const { nearestPoint, nearestNextPoint } = findNearestCoastline(e.latlng);
            setClickedPosition(e.latlng);
            setNearestPoint(nearestPoint);
            setNearestNextPoint(nearestNextPoint);
        }, 300);
    })
    // This function prevents setting position, when double clicking
    useMapEvent('dblclick', () => {
        if (clickTimeout) {
            clearTimeout(clickTimeout);  // Cancel the pending click event if it's a double-click
        }
    });

    // If the user pans/zooms before a click occurs, don't keep suppressing a future click.
    useMapEvent('movestart', () => {
        shouldIgnoreNextClickRef.current = false
        if (clickTimeout) {
            clearTimeout(clickTimeout)
        }
    })

    // Animation for the marker when it is placed on the map. This is a subtle bounce effect to draw attention to the new marker.
    useEffect(() => {
        if (!clickedPosition) {
            return
        }

        const prefersReducedMotion = typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches

        if (prefersReducedMotion) {
            return
        }

        const frameId = window.requestAnimationFrame(() => {
            const markerElement = markerRef.current?.getElement?.()
            const markerGraphic = markerElement?.querySelector?.('img, svg') || markerElement

            if (!markerGraphic || typeof markerGraphic.animate !== 'function') {
                return
            }

            markerGraphic.animate(
                [
                    { opacity: 0.25, translate: '0 -8px', offset: 0 },
                    { opacity: 1, translate: '0 2px', offset: 0.62 },
                    { opacity: 1, translate: '0 -1px', offset: 0.82 },
                    { opacity: 1, translate: '0 0', offset: 1 }
                ],
                {
                    duration: 500,
                    easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    fill: 'none'
                }
            )
        })

        return () => {
            window.cancelAnimationFrame(frameId)
        }
    }, [clickedPosition])

    if (!clickedPosition) {
        return null
    }

    return (
        <Marker ref={markerRef} position={clickedPosition} icon={new Icon({
            iconUrl: logo,
            iconSize: [32 * 2, 40 * 2], // size of the icon
            iconAnchor: [16 * 2, 36 * 2], // point of the icon which will correspond to marker's location
        })} />
    )
}

export default function LeafletMap({
    nearestPoint, nearestNextPoint,
    setNearestPoint, setNearestNextPoint,
    debug, stations = [], onNearestStationObservationsChange, sidebarResetToken = 0,
    sidebarSuppressNextMapClickToken = 0,
    forecast
}) {
    const [clickedPosition, setClickedPosition] = useState(undefined)
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
    const [pointsByWindow, setPointsByWindow] = useState({})
    const [activeWindowIndex, setActiveWindowIndex] = useState(0)

    useEffect(() => {
        // console.log(pointsAlongGeoJson(dk, .25));
        window.localStorage.setItem(MAP_LAYER_STORAGE_KEY, isSatellite ? "satellite" : "standard")
    }, [isSatellite])

    useEffect(() => {
        if (sidebarResetToken <= 0) {
            return
        }

        setClickedPosition(undefined)
        setNearestPoint(undefined)
        setNearestNextPoint(undefined)
        setNearestMetStation(undefined)
        setNearestTideStation(undefined)
        onNearestStationObservationsChange?.({
            met: undefined,
            tidewater: undefined,
            metStation: undefined,
            tidewaterStation: undefined,
        })
    }, [sidebarResetToken, setNearestPoint, setNearestNextPoint, onNearestStationObservationsChange])

    useEffect(() => {
        const mapRawPointsToHeatPoints = (data = []) => {
            const mappedPoints = []
            for (const point of data) {
                const intensity = Number(point?.[0]) * 100
                if (Number.isFinite(intensity) && intensity > WIND_INTENSITY_THRESHOLD) {
                    mappedPoints.push({
                        intensity,
                        stationId: point[1],
                        lat: point[3],
                        lng: point[2],
                    })
                }
            }
            return mappedPoints
        }
        if (forecast) {
            const windowPoints = {};
            for (let i = 0; i < forecast.length; i++) {
                const mappedPoints = mapRawPointsToHeatPoints(forecast[i]);
                windowPoints[i] = mappedPoints;
            }
            setPointsByWindow(windowPoints);
        }

    }, [forecast]);

    // Hack to scroll down a bit on mobile devices, so that the map is a bit hidden behind the header.
    useEffect(() => {
        window.scrollTo(0, 110);
    }, []);

    useEffect(() => {
        setPoints(pointsByWindow[activeWindowIndex] || []);
    }, [activeWindowIndex, pointsByWindow])

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
        <div
            style={{
                position: "relative",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100dvh",
            }}
        >
            <MapHeader />
            <button
                type="button"
                className="glass p-2 m-1"
                onClick={() => setIsSatellite((prev) => !prev)}
                style={{
                    position: "absolute",
                    top: 122,
                    right: 56,
                    zIndex: 1001,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,

                }}
                title="Skift kortlag"
            >
                {isSatellite ? "🗺️" : "🛰️"}
            </button>
            <Slider
                min={0}
                max={forecast ? forecast.length - 1 : 0}
                value={activeWindowIndex}
                onChange={(value) => setActiveWindowIndex(value)}
            />
            <MapGuideControl />
            <MapContainer attributionControl={false} style={{ height: "130dvh", width: "100%" }} center={[56.0, 11.0]} zoom={7}>
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
                    suppressNextClickToken={sidebarSuppressNextMapClickToken}
                />
                <HeatLayer minZoom={minZoom} maxZoom={maxZoom} points={points} />
                {
                    debug && nearestPoint ?
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
                                            icon={isNearestMet || isNearestTide ? getStationIcon(station.source, true) : getStationIcon(station.source, false)}
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