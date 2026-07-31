import React, { useState, useEffect, useRef } from 'react';
import { DateTime } from 'luxon';
import { RechartLinearChart } from './RechartLinearChart';

export default function Sidebar({ sidebarOpen, setSidebarOpen, nearestStationObservations, onOutsideClose, score, nearestTown }) {
    const sidebarRef = useRef(null);
    const pointerDownRef = useRef(null);
    const draggedSincePointerDownRef = useRef(false);
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 768px)").matches
    );

    const tideWaterFiltered = nearestStationObservations?.tidewater?.observations.filter(item => {
        const observedDate = new Date(item.timestamp);
        return observedDate.getMinutes() === 0 || observedDate.getMinutes() === 30; // Keep only observations at the top of the hour or half past the hour
    });


    // Set up a media query listener to update the matches state when the viewport width changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handler = e => setMatches(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    useEffect(() => {
        if (!sidebarOpen) {
            return;
        }

        const dragThresholdPx = 6;

        const handlePointerDown = (event) => {
            pointerDownRef.current = { x: event.clientX, y: event.clientY };
            draggedSincePointerDownRef.current = false;
        };

        const handlePointerMove = (event) => {
            if (!pointerDownRef.current || draggedSincePointerDownRef.current) {
                return;
            }

            const distanceX = Math.abs(event.clientX - pointerDownRef.current.x);
            const distanceY = Math.abs(event.clientY - pointerDownRef.current.y);

            if (distanceX > dragThresholdPx || distanceY > dragThresholdPx) {
                draggedSincePointerDownRef.current = true;
            }
        };

        const handlePointerUp = () => {
            pointerDownRef.current = null;
        };

        const handleOutsideClick = (event) => {
            if (draggedSincePointerDownRef.current) {
                draggedSincePointerDownRef.current = false;
                return;
            }

            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
                onOutsideClose?.('outside');
            }
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('pointermove', handlePointerMove, true);
        document.addEventListener('pointerup', handlePointerUp, true);
        document.addEventListener('click', handleOutsideClick, true);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('pointermove', handlePointerMove, true);
            document.removeEventListener('pointerup', handlePointerUp, true);
            document.removeEventListener('click', handleOutsideClick, true);
        };
    }, [sidebarOpen, setSidebarOpen, onOutsideClose]);


    const renderScore = () => {
        if (score === undefined) {
            return null;
        }
        const scoreTexts = [{
            color: '',
            title: 'Svage ravforhold',
            textOne: 'De seneste vejrforhold har ikke været særligt gunstige for ravjagt ved denne kyst. Der har kun været begrænset pålandsvind, og der er derfor mindre sandsynlighed for, at nyt materiale med rav er blevet skyllet op på stranden.',
            textTwo: 'Det kan stadig være værd at undersøge stranden, især efter lokale ændringer i vind og bølgegang.'
        },
        {
            color: '',
            title: 'Mindre gode ravforhold',
            textOne: 'Ravforholdene ved denne kyst er lige nu under middel. Vindforholdene har kun i begrænset omfang hjulpet med at transportere rav og opskyl ind mod kysten.',
            textTwo: 'Kig efter friske opskylsbælter, tanglinjer og områder med småsten, hvor rav kan samle sig.'
        },
        {
            color: 'is-link',
            title: 'Moderate ravforhold',
            textOne: 'Der har været nogen aktivitet ved kysten, men forholdene er ikke optimale for ravjagt. Vinden har delvist været med til at skabe opskyl, men perioden med gunstige forhold har ikke været lang nok til at give de bedste muligheder.',
            textTwo: 'En tur langs vandkanten kan stadig give fine fund, især hvis du søger grundigt i nyt opskyl.'
        },
        {
            color: 'is-primary',
            title: 'Gode ravforhold',
            textOne: 'Forholdene ved denne kyst er gode for ravjagt. Der har været en længere periode med gunstige vindforhold, som kan have hjulpet med at samle rav langs kysten.',
            textTwo: 'De bedste steder at lede er typisk ved den nyeste opskylsrand, hvor tang, træstykker og andet let materiale samler sig.'
        },
        {
            color: 'is-success',
            title: 'Meget gode ravforhold',
            textOne: 'Forholdene ved denne strand er meget gode for ravjagt lige nu. Der har været vedvarende pålandsvind i flere dage, hvilket giver optimale betingelser for at transportere rav ind mod kysten.',
            textTwo: 'Gå især efter friske opskylsbælter langs stranden. Her kan rav ofte findes sammen med tang, små grene og mørkt strandmateriale.'
        },
        ]

        const scoreIndex = Math.min(Math.max(Math.floor(score * scoreTexts.length), 0), scoreTexts.length - 1);

        return (
            <div className="glass mb-4 p-4">
                <p className="is-size-6 mb-2 title">{scoreTexts[scoreIndex].title}</p>
                <progress className={`progress ${scoreTexts[scoreIndex].color}`} value={score} max="1">{score}</progress>
                <p className="is-size-7  mb-1 subtitle">{scoreTexts[scoreIndex].textOne}</p>
                <br />
                <p className="is-size-7 mb-1 subtitle">{scoreTexts[scoreIndex].textTwo}</p>
            </div>
        );
    }

    /**
     * Takes nearestTown and creates a link to {apex}/prognoser/[nearestTown]
     * if there are any bad letters in the name it will be replaced or removed.
     * @returns {string} link to ravudsigten.dk/prognoser/[nearestTown]
     */
    const createLink = () => {
        if (!nearestTown) {
            return '';
        }
        const slug = nearestTown.toLowerCase()
            .trim()
            .replace(/æ/g, "ae")
            .replace(/ø/g, "oe")
            .replace(/å/g, "aa")
            .replace(/[^a-z0-9 -]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        return slug;
    }

    return (
        <div
            ref={sidebarRef}
            style={{
                position: 'fixed',
                zIndex: 402,
                // left: 15,
                opacity: sidebarOpen ? 1 : 0,
                pointerEvents: sidebarOpen ? "auto" : "none",
                transform: sidebarOpen ? "scale(1) translateY(0)" : "scale(0.88) translateY(-12px)",
                transition: "max-height 680ms cubic-bezier(0.22, 1, 0.36, 1), transform 680ms cubic-bezier(0.22, 1, 0.36, 1)",
                bottom: -10,
                width: matches ? '360px' : 'calc(100vw)',
                maxHeight: sidebarOpen ? matches ? 'calc(100dvh)' : 'calc(100vh - 50%)' : 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'auto'
            }}
        >
            <div
                className="box has-text-light p-2 glass"
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    maxHeight: '100%',
                    minHeight: 0,
                    transition: "max-height 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",

                }}
            >
                {/* Top Header */}
                <div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
                    <p className="mb-2 glass p-3 title is-size-6 ">{nearestTown}</p>
                    <button
                        type="button"
                        className="delete p-3 m-2"
                        aria-label="close"
                        onClick={() => {
                            setSidebarOpen(false)
                            onOutsideClose?.('button')
                        }}
                        style={{
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            minHeight: '36px',
                            marginTop: '-6px'
                        }}
                    ></button>
                </div>
                {renderScore()}
                {
                    nearestStationObservations && nearestStationObservations?.met?.windDir?.length > 0 && nearestStationObservations?.met?.windSpeed?.length > 0 ? (
                        <div className="grid p-4 mb-4 glass">
                            <div className="cell">
                                <p className="is-size-7 title mb-1">Nærmeste vejrstation</p>
                                <p className="is-size-6 subtitle mb-2">{nearestStationObservations?.metStation?.stationName}</p>
                                <p className="is-size-7 title mb-1">Seneste observation</p>
                                <p className="is-size-6 subtitle mb-2">{DateTime.fromISO(nearestStationObservations?.met?.windDir[0]?.observed).toLocaleString(DateTime.DATETIME_MED)}</p>

                            </div>
                            <div className="cell">
                                <p className="is-size-7 title mb-1">Vindhastighed</p>
                                <p className="is-size-6 subtitle mb-2">{nearestStationObservations?.met?.windSpeed[0]?.windSpeed} m/s</p>
                                <p className="is-size-7 title mb-1">Vindretning</p>
                                <p className="is-size-6 subtitle mb-2">{nearestStationObservations?.met?.windDir[0]?.windDirection}°
                                    <span
                                        className="icon is-medium has-text-info  p-0 ml-0 pb-1 m-0"
                                        style={{
                                            transform: `rotate(${nearestStationObservations?.met?.windDir[0]?.windDirection}deg)`,
                                            transformOrigin: 'center center',
                                            transition: 'transform 0.5s ease'
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                        </svg>
                                    </span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="mb-4 p-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid #363636' }}>
                            <p className="is-size-7 has-text-grey-light mb-1">Ingen observationer tilgængelige</p>
                        </div>
                    )}
                <RechartLinearChart data={tideWaterFiltered} />
                <a href={`/prognoser/${createLink()}`}
                    className="button is-warning is-fullwidth  mb-4 p-2">
                    Se fuld prognose for {nearestTown} ➔
                </a>
            </div>

        </div>
    );
}