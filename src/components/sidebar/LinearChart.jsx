import React from "react";
import { DateTime } from "luxon";

export function LinearChart({ data, station }) {
    console.log(station)
    const tideWaterSeries = (Array.isArray(data) ? data : [])
        .filter((item) => Number.isFinite(Number(item?.tideHeight)) && item?.timestamp)
        .map((item) => ({
            timestamp: item.timestamp,
            tideHeight: Number(item.tideHeight),
        }))
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .slice(-24)

    const hasTidewaterChartData = tideWaterSeries.length >= 2
    console.log('tideWaterSeries', tideWaterSeries)
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

    return (
        <>


            <div className="glass mb-1 p-4">
                <p className="is-size-7 subtitle mb-1">Nærmeste tidevandsstation</p>
                <p className="is-size-6 subtitle mb-2">{station?.stationName || 'Ukendt station'}</p>

                {
                    hasTidewaterChartData ? (
                        <>
                            {/* <p className="is-size-7 has-text-grey-light mb-2">
                                    Seneste {tideWaterSeries.length} målinger ({DateTime.fromISO(tideWaterSeries[0].timestamp).toLocaleString(DateTime.DATETIME_SHORT)} - {DateTime.fromISO(tideLatest.timestamp).toLocaleString(DateTime.DATETIME_SHORT)})
                                </p> */}
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
                                            className="subtitle is-size-7"
                                        // fill="rgba(255,255,255,0.8)"
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
                                            className={"subtitle is-size-7"}
                                        >
                                            {tick.label}
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            <div className="is-size-7 subtitle" style={{ marginTop: '4px' }}>
                                Seneste niveau: <span className="subtitle is-size-7">{tideLatest.tideHeight.toFixed(2)} cm</span>
                            </div>
                        </>
                    ) : (
                        <p className="is-size-7 subtitle">Ikke nok tidevandsdata til at vise kurven endnu.</p>
                    )
                }
            </div >

        </>
    )

}