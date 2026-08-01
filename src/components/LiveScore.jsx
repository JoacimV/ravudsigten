import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from "recharts";

// Hjælpefunktion til at hente status, farve og råd baseret på score (0 - 1)
function getScoreDetails(score) {
    if (score === null || score === undefined) return null;

    if (score >= 0.8) {
        return {
            label: "Fremragende ravvejr!",
            badgeClass: "is-success",
            color: "#23d160",
            description: "Forholdene er ideelle! Vind og strøm har arbejdet sammen om at føre rav ind mod kysten. Kom ud og kig i opskyllet!",
            advice: "Søg efter 'ravpinde' (små træstykker) og mørkt opskyl langs vandkanten."
        };
    } else if (score >= 0.6) {
        return {
            label: "Gode chancer",
            badgeClass: "is-primary",
            color: "#00d1b2",
            description: "Betingelserne er rigtig fine. Der er god bevægelse i vandet og chance for opskyl af rav.",
            advice: "Fokuser på strækninger med læ eller hvor tangen samler sig."
        };
    } else if (score >= 0.4) {
        return {
            label: "Nogenlunde forhold",
            badgeClass: "is-warning",
            color: "#ffe08a",
            description: "Forholdene er middel. Der kan godt ligge rav, men det kræver et godt øje og lidt tålmodighed.",
            advice: "Gå en tur langs vandkanten og hold øje med friske opskyllinjer."
        };
    } else if (score >= 0.2) {
        return {
            label: "Lave chancer",
            badgeClass: "is-orange",
            color: "#ffdd57",
            description: "Svage betingelser. Vandet har enten været for roligt, eller vindretningen er ikke helt gunstig endnu.",
            advice: "Det er en fin tur ud, men forvent ikke store mængder rav i dag."
        };
    } else {
        return {
            label: "Dårlige forhold",
            badgeClass: "is-danger",
            color: "#ff3860",
            description: "Blikstille vand eller forkert vindretning. Ravet ligger sandsynligvis stadig roligt på bunden ude i vandet.",
            advice: "Vent på at vinden og bølgerne rører op i havbunden."
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
            <p>Tid: {dt.toLocaleString(DateTime.TIME_SIMPLE)}</p>
            <p>Vindretning: {point.windDirection}°</p>
            <p>Vindstyrke: {point.windSpeed} m/s</p>
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

    if (loading) return <div className="notification">Henter nyeste ravscore...</div>;
    if (!data) return <div className="notification is-light">Score ikke tilgængelig lige nu.</div>;

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
                Følg den live ravprognose for kysterne {name}.
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
                    <p><strong>Tip:</strong> {details.advice}</p>
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
                    <p><strong>Tip: </strong>Linjen viser vindhastigheden (m/s) over de næste dage, og pilene i bunden angiver vindretningen. Et hop i vinden kombineret med den rette vindretning er ofte nøglen til gode ravbetingelser.</p>
                </div>
            </div>
            <a href={`/`} className="button is-warning is-fullwidth  mb-4 p-2">
                Tilbage til ravkortet 🗺️
            </a>
            <p className="subtitle is-6 mb-3">
                Vores algoritmer analyserer løbende vindretning, vindstyrke, bølger og strømforhold ved {name} for at give dig det bedste estimat på, hvornår chancerne for at finde rav er størst.
            </p>
        </div>
    );
}