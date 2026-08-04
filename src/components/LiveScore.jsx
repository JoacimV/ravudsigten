import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from "recharts";
import * as m from "../paraglide/messages.js";
import { getLocale } from "../paraglide/runtime.js";

// Hjælpefunktion til at hente status, farve og råd baseret på score (0 - 1)
function getScoreDetails(score) {
    if (score === null || score === undefined) return null;

    if (score >= 0.8) {
        return {
            label: m.suave_nimble_poodle_sew(),
            badgeClass: "is-success",
            color: "#23d160",
            description: m.flat_formal_crow_inspire(),
            advice: m.equal_funny_felix_fold()
        };
    } else if (score >= 0.6) {
        return {
            label: m.whole_away_falcon_devour(),
            badgeClass: "is-primary",
            color: "#00d1b2",
            description: m.least_mild_haddock_build(),
            advice: m.new_main_worm_stir()
        };
    } else if (score >= 0.4) {
        return {
            label: m.witty_dirty_insect_create(),
            badgeClass: "is-warning",
            color: "#ffe08a",
            description: m.mushy_heavy_grebe_delight(),
            advice: m.broad_alert_ibex_pat()
        };
    } else if (score >= 0.2) {
        return {
            label: m.crazy_fun_jellyfish_reside(),
            badgeClass: "is-orange",
            color: "#ffdd57",
            description: m.shy_raw_wombat_cheer(),
            advice: m.awful_direct_pig_burn()
        };
    } else {
        return {
            label: m.mean_honest_skunk_intend(),
            badgeClass: "is-danger",
            color: "#ff3860",
            description: m.gray_warm_alpaca_borrow(),
            advice: m.lost_mellow_emu_accept()
        };
    }
}

function DirectionTick({ x = 0, y = 0, payload }) {
    const degrees = Number(payload?.value ?? 0);
    const normalized = ((degrees % 360) + 360) % 360;

    return (
        <g transform={`translate(${x}, ${y})`}>
            <text
                x={0}
                y={0}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#4a4a4a"
                fontSize={14}
                transform={`rotate(${normalized - 180}, 0, 0)`}
            >
                ↑
            </text>
        </g>
    );
}

function formatForecastTimestamp(value) {
    const dt = DateTime.fromISO(value, { zone: "Europe/Copenhagen" });
    return dt.toFormat("cccc");
}

function ForecastTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload;
    if (!point) return null;

    const dt = DateTime.fromISO(point.time, { zone: "Europe/Copenhagen" });


    return (
        <div className="box p-3" style={{ border: "1px solid #dbdbdb" }}>
            <p className="has-text-weight-bold mb-2">{formatForecastTimestamp(point.time)}</p>
            <p>{m.quiet_candid_lark_rush()} {dt.toLocaleString(DateTime.TIME_SIMPLE)}</p>
            <p>{m.grand_swift_pig_treat()} {point.windDirection}°</p>
            <p>{m.livid_brief_sloth_care()} {point.windSpeed} m/s</p>
        </div>
    );
}

export default function LiveScore({ longitude, latitude, name }) {
    const [data, setData] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchScore() {
            try {
                const res = await fetch("https://dswx6vubccbkr.cloudfront.net/enriched/coast-points-now.json");
                const fullPrognosis = await res.json();

                const match = fullPrognosis.find((item) => {
                    const { longitude: lon, latitude: lat } = item.gridPoint;
                    return lon === longitude && lat === latitude;
                });
                setData(match);
            } catch (err) {
                console.error("Fejl ved hentning af score:", err);
            } finally {
                setLoading(false);
            }
        }

        async function fetchForecast() {
            try {
                const res = await fetch("https://dswx6vubccbkr.cloudfront.net/raw/forecast.json");
                const fullForecast = await res.json();
                const match = fullForecast[`${longitude},${latitude}`];
                // Keep first 58 points, as the rest are not hourly
                setForecast(match.slice(0, 57));
            } catch (err) {
                console.error("Fejl ved hentning af forecast:", err);
            }
        }

        fetchScore();
        fetchForecast();

    }, [longitude, latitude]);

    if (loading) return <div className="notification">{m.ok_round_squirrel_dash()}</div>;
    if (!data) return <div className="notification is-light">{m.north_sour_skunk_pave()}</div>;

    const scorePct = Math.round((data.score || 0) * 100);
    const details = getScoreDetails(data.score);

    const forecastToChartData = (forecast) => {
        if (!forecast) return [];
        return forecast.map((item) => ({
            time: item.time,
            windDirection: item.windDirection,
            windSpeed: item.windSpeed,
        }));
    }

    const timeLabels = forecastToChartData(forecast).filter((_, index) => index % 24 === 0);

    return (
        <div>
            <p className="subtitle is-6 mb-3">
                {m.simple_spare_duck_peel({ name })}
            </p>
            <div className="box amber-score-card glass">
                <div className="level is-mobile mb-2">
                    <div className="level-left">
                        <span className={`tag is-medium ${details.badgeClass}`}>
                            {details.label}
                        </span>
                    </div>
                    <div className="level-right">
                        <span className="title is-2 mb-0" style={{ color: details.color }}>
                            {scorePct}%
                        </span>
                    </div>
                </div>

                <progress
                    className={`progress ${details.badgeClass} is-small mb-4`}
                    value={scorePct}
                    max="100"
                >
                    {scorePct}%
                </progress>

                <p className="subtitle is-6 mb-2">{details.description}</p>

                <div className="content is-small subtitle mt-3">
                    <p><strong>{m.caring_north_haddock_express()}</strong> {details.advice}</p>
                </div>
            </div>
            <div className="box glass mb-5">
                <ResponsiveContainer width="100%" height={240}>
                    <LineChart width={"100%"} height={240} data={forecastToChartData(forecast)}>
                        <XAxis dataKey="windDirection" tick={<DirectionTick />} tickLine={false} axisLine={false} />
                        <YAxis dataKey="windSpeed" unit="m/s" />
                        <Tooltip content={<ForecastTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="windSpeed"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
                <div className="ml-6 mr-6" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#7a7a7a" }}>
                    {timeLabels.map((point) => (
                        <span key={point.time}>
                            {formatForecastTimestamp(point.time)}
                        </span>
                    ))}
                </div>
                <div className="content is-small subtitle mt-3">
                    <p><strong>{m.caring_north_haddock_express()} </strong>{m.jumpy_cute_koala_assure()}</p>
                </div>
            </div>
            <a href={`${getLocale() === 'da' ? '/' : `/${getLocale()}/`}`} className="button is-warning is-fullwidth  mb-4 p-2">
                {m.swift_glad_chipmunk_flow()} 🗺️
            </a>
            <p className="subtitle is-6 mb-3">
                {m.full_mad_beaver_pray({ name })}
            </p>
        </div>
    );
}