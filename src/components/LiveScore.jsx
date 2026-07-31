// src/components/LiveScore.jsx
import { useState, useEffect } from "react";

export default function LiveScore({ longitude, latitude }) {
    const [data, setData] = useState(null);
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

        fetchScore();
    }, [longitude, latitude]);

    if (loading) return <span>Henter nyeste score...</span>;
    if (!data) return <span>Score ikke tilgængelig</span>;

    return (
        <div class="box">
            <p class="title is-3">{data.score} / 100</p>
            {data.metStation && <p class="is-size-7">Målestation: {data.metStation}</p>}
        </div>
    );
}