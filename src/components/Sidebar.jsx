import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export default function Sidebar({ loading, sidebarOpen, setSidebarOpen, nearestStationObservations }) {
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 768px)").matches
    );

    const tideWaterFiltered = nearestStationObservations?.tidewater?.observations.filter(item => {
        const observedDate = new Date(item.timestamp);
        return observedDate.getMinutes() === 0 || observedDate.getMinutes() === 30; // Keep only observations at the top of the hour or half past the hour
    });

    const tideWaterSeries = (Array.isArray(tideWaterFiltered) ? tideWaterFiltered : [])
        .filter((item) => Number.isFinite(Number(item?.tideHeight)) && item?.timestamp)
        .map((item) => ({
            timestamp: item.timestamp,
            tideHeight: Number(item.tideHeight),
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-24)

    const hasTidewaterChartData = tideWaterSeries.length >= 2

    const buildTideChartPath = (series, width, height, padding) => {
        if (!Array.isArray(series) || series.length < 2) {
            return ''
        }

        const values = series.map((point) => point.tideHeight)
        const minValue = Math.min(...values)
        const maxValue = Math.max(...values)
        const valueRange = maxValue - minValue || 1
        const innerWidth = width - padding.left - padding.right
        const innerHeight = height - padding.top - padding.bottom

        return series
            .map((point, index) => {
                const x = padding.left + (index / (series.length - 1)) * innerWidth
                const y = padding.top + (1 - (point.tideHeight - minValue) / valueRange) * innerHeight
                return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
            })
            .join(' ')
    }

    const tideChartWidth = 320
    const tideChartHeight = 140
    const tideChartPadding = { top: 14, right: 12, bottom: 28, left: 40 }
    const tideChartPath = buildTideChartPath(tideWaterSeries, tideChartWidth, tideChartHeight, tideChartPadding)

    const tideHeights = tideWaterSeries.map((point) => point.tideHeight)
    const tideMin = tideHeights.length ? Math.min(...tideHeights) : undefined
    const tideMax = tideHeights.length ? Math.max(...tideHeights) : undefined
    const tideLatest = tideWaterSeries[tideWaterSeries.length - 1]

    const tideInnerWidth = tideChartWidth - tideChartPadding.left - tideChartPadding.right
    const tideInnerHeight = tideChartHeight - tideChartPadding.top - tideChartPadding.bottom
    const tideValueRange = typeof tideMin === 'number' && typeof tideMax === 'number' ? (tideMax - tideMin || 1) : 1

    const getTideY = (value) => {
        if (typeof tideMin !== 'number') {
            return tideChartPadding.top
        }

        return tideChartPadding.top + (1 - (value - tideMin) / tideValueRange) * tideInnerHeight
    }

    const getTideX = (index) => {
        if (tideWaterSeries.length <= 1) {
            return tideChartPadding.left
        }

        return tideChartPadding.left + (index / (tideWaterSeries.length - 1)) * tideInnerWidth
    }

    const yTickCount = 5
    const tideYTicks = hasTidewaterChartData && typeof tideMin === 'number' && typeof tideMax === 'number'
        ? Array.from({ length: yTickCount }, (_, tickIndex) => {
            const ratio = tickIndex / (yTickCount - 1)
            const value = tideMax - ratio * (tideMax - tideMin)

            return {
                value,
                y: getTideY(value),
            }
        })
        : []

    const xTickCount = Math.min(5, tideWaterSeries.length)
    const tideXTicks = hasTidewaterChartData
        ? Array.from({ length: xTickCount }, (_, tickIndex) => {
            const ratio = xTickCount === 1 ? 0 : tickIndex / (xTickCount - 1)
            const dataIndex = Math.round(ratio * (tideWaterSeries.length - 1))
            const point = tideWaterSeries[dataIndex]

            return {
                x: getTideX(dataIndex),
                label: point ? DateTime.fromISO(point.timestamp).toFormat('HH:mm') : '',
                key: `${dataIndex}-${point?.timestamp || 'missing'}`,
            }
        }).filter((tick, index, arr) => index === 0 || tick.key !== arr[index - 1].key)
        : []


    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handler = e => setMatches(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    if (!sidebarOpen) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                zIndex: 401,
                left: 15,
                bottom: 15,
                width: matches ? '360px' : 'calc(100vw - 30px)',
                maxHeight: matches ? 'calc(100vh - 30%)' : 'calc(100vh - 30%)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {loading ? (
                <div className="box has-background-dark has-text-light p-5" style={{ border: '1px solid #30363d', borderRadius: '16px' }}>
                    <div className="mb-4">
                        <p className="heading has-text-grey-light mb-1">Ravprognose</p>
                        <p className="title is-5 has-text-grey-lighter">Henter data...</p>
                    </div>
                    <progress className="progress is-small is-warning" max="100">15%</progress>
                    <p className="has-text-centered has-text-grey is-size-7">Forbinder til vejr udbyder...</p>
                </div>
            ) : (
                <div
                    className="box has-background-dark has-text-light p-5"
                    style={{
                        border: '1px solid #30363d',
                        borderRadius: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflowY: 'auto',
                        maxHeight: '100%',
                        minHeight: 0
                    }}
                >
                    {/* Top Header */}
                    <div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
                        <p className="heading has-text-grey-light mb-2">Nærmeste station</p>
                        <button className="delete" aria-label="close" onClick={() => setSidebarOpen(false)}></button>
                    </div>
                    {
                        nearestStationObservations && nearestStationObservations?.met?.windDir?.length > 0 && nearestStationObservations?.met?.windSpeed?.length > 0 ? (
                            <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #363636' }}>
                                <p className="is-size-7 has-text-grey-light mb-1">Nærmeste vejrstation</p>
                                <p className="is-size-6 has-text-white mb-2">{nearestStationObservations?.metStation?.stationName}</p>
                                <p className="is-size-7 has-text-grey-light mb-1">Seneste observation</p>
                                <p className="is-size-6 has-text-white mb-2">{DateTime.fromISO(nearestStationObservations?.met?.windDir[0]?.observed).toLocaleString(DateTime.DATETIME_MED)}</p>
                                <p className="is-size-7 has-text-grey-light mb-1">Vindretning</p>
                                <p className="is-size-6 has-text-white">{nearestStationObservations?.met?.windDir[0]?.windDirection}° <span
                                    className="icon is-medium has-text-info mr-3"
                                    style={{
                                        display: 'inline-block',
                                        transform: `rotate(${nearestStationObservations?.met?.windDir[0]?.windDirection}deg)`,
                                        transformOrigin: 'center center',
                                        transition: 'transform 0.5s ease'
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                    </svg>
                                </span></p>
                                <p className="is-size-7 has-text-grey-light mb-1">Vindhastighed</p>
                                <p className="is-size-6 has-text-white">{nearestStationObservations?.met?.windSpeed[0]?.windSpeed} m/s</p>
                            </div>
                        ) : (
                            <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #363636' }}>
                                <p className="is-size-7 has-text-grey-light mb-1">Ingen observationer tilgængelige</p>
                            </div>
                        )}

                    {nearestStationObservations?.tidewater ? (
                        <div className="mb-1 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #363636' }}>
                            <p className="is-size-7 has-text-grey-light mb-1">Nærmeste tidevandsstation</p>
                            <p className="is-size-6 has-text-white mb-2">{nearestStationObservations?.tidewaterStation?.stationName || 'Ukendt station'}</p>

                            {hasTidewaterChartData ? (
                                <>
                                    <p className="is-size-7 has-text-grey-light mb-2">
                                        Seneste {tideWaterSeries.length} målinger ({DateTime.fromISO(tideWaterSeries[0].timestamp).toLocaleString(DateTime.DATETIME_SHORT)} - {DateTime.fromISO(tideLatest.timestamp).toLocaleString(DateTime.DATETIME_SHORT)})
                                    </p>
                                    <svg
                                        viewBox={`0 0 ${tideChartWidth} ${tideChartHeight}`}
                                        style={{ width: '100%', height: '150px', display: 'block' }}
                                        role="img"
                                        aria-label="Tidevand udvikling over tid"
                                    >
                                        <defs>
                                            <linearGradient id="tideLineGradient" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#60a5fa" />
                                                <stop offset="100%" stopColor="#22d3ee" />
                                            </linearGradient>
                                        </defs>

                                        <line x1={tideChartPadding.left} y1={tideChartPadding.top} x2={tideChartPadding.left} y2={tideChartHeight - tideChartPadding.bottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
                                        <line x1={tideChartPadding.left} y1={tideChartHeight - tideChartPadding.bottom} x2={tideChartWidth - tideChartPadding.right} y2={tideChartHeight - tideChartPadding.bottom} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />

                                        {tideYTicks.map((tick, index) => (
                                            <g key={`y-${index}`}>
                                                <line
                                                    x1={tideChartPadding.left}
                                                    y1={tick.y}
                                                    x2={tideChartWidth - tideChartPadding.right}
                                                    y2={tick.y}
                                                    stroke="rgba(255,255,255,0.12)"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={6}
                                                    y={tick.y + 3}
                                                    fontSize="9"
                                                    fill="rgba(255,255,255,0.8)"
                                                >
                                                    {tick.value.toFixed(2)}cm
                                                </text>
                                            </g>
                                        ))}

                                        <path d={tideChartPath} fill="none" stroke="url(#tideLineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                                        {tideXTicks.map((tick) => (
                                            <g key={`x-${tick.key}`}>
                                                <line
                                                    x1={tick.x}
                                                    y1={tideChartHeight - tideChartPadding.bottom}
                                                    x2={tick.x}
                                                    y2={tideChartHeight - tideChartPadding.bottom + 4}
                                                    stroke="rgba(255,255,255,0.5)"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x={tick.x}
                                                    y={tideChartHeight - 8}
                                                    textAnchor="middle"
                                                    fontSize="9"
                                                    fill="rgba(255,255,255,0.7)"
                                                >
                                                    {tick.label}
                                                </text>
                                            </g>
                                        ))}
                                    </svg>

                                    <div className="is-size-7 has-text-grey-light" style={{ marginTop: '4px' }}>
                                        Seneste niveau: <span className="has-text-white">{tideLatest.tideHeight.toFixed(2)} cm</span>
                                    </div>
                                </>
                            ) : (
                                <p className="is-size-7 has-text-grey-light">Ikke nok tidevandsdata til at vise kurven endnu.</p>
                            )}
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}