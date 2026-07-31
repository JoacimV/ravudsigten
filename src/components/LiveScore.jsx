import { useState, useEffect } from "react";

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

export default function LiveScore({ longitude, latitude, name }) {
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

    if (loading) return <div className="notification">Henter nyeste ravscore...</div>;
    if (!data) return <div className="notification is-light">Score ikke tilgængelig lige nu.</div>;

    const scorePct = Math.round((data.score || 0) * 100);
    const details = getScoreDetails(data.score);

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

                <div className="content is-small has-text-grey mt-3">
                    <p><strong>Tip:</strong> {details.advice}</p>
                </div>
            </div>
            <p className="subtitle is-6 mb-3">
                Vores algoritmeprognose analyserer løbende vindretning, vindstyrke, bølger og strømforhold ved {name} for at give dig det bedste estimat på, hvornår chancerne for at finde rav er størst.
            </p>
        </div>
    );
}