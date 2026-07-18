import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

export default function Sidebar({ loading, tiderWaterStationName, currentWind, lowSpots, sidebarOpen, setSidebarOpen }) {
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 768px)").matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handler = e => setMatches(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const calculateChance = (hours) => {
        switch (true) {
            case hours < 3:
                return {
                    text: 'LAV CHANCE',
                    color: '#f43f5e', // Rød
                    emoji: '🌧️',
                    dashOffset: 75,
                    colorClass: 'is-danger'
                };
            case hours <= 7:
                return {
                    text: 'MIDDEL CHANCE',
                    color: '#f59e0b', // Gul/Orange
                    emoji: '⛅',
                    dashOffset: 45,
                    colorClass: 'is-warning'
                };
            default:
                return {
                    text: 'HØJ CHANCE',
                    color: '#10b981', // Grøn
                    emoji: '☀️',
                    dashOffset: 0,
                    colorClass: 'is-success'
                };
        }
    };

    const renderSpots = () => {
        const spots = lowSpots.map((lowSpot, index) => {
            const gauge = calculateChance(lowSpot.hours);
            if (gauge.colorClass === 'is-danger') return null; // Skip rendering if the chance is low
            const strokeDashArray = "126";

            return (
                <div
                    className="box has-background-black-ter mb-4"
                    key={lowSpot.time || index}
                    style={{ border: '1px solid #2b313a', borderRadius: '12px' }}
                >
                    <div className="columns is-mobile is-vcentered">

                        {/* Venstre side: Den skudsikre SVG-gauge */}
                        <div className="column is-5 is-flex is-justify-content-center">
                            <svg width="110" height="75" viewBox="0 0 100 65" style={{ overflow: 'visible' }}>
                                {/* Grå baggrunds-bue */}
                                <path
                                    d="M 10,50 A 40,40 0 0,1 90,50"
                                    fill="none"
                                    stroke="#2b313a"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                />
                                {/* Farvet status-bue */}
                                <path
                                    d="M 10,50 A 40,40 0 0,1 90,50"
                                    fill="none"
                                    stroke={gauge.color}
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={strokeDashArray}
                                    strokeDashoffset={gauge.dashOffset}
                                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                                />

                                {/* EMOJI (Placeret præcis i SVG-koordinatsystemet) */}
                                <text
                                    x="50"
                                    y="42"
                                    textAnchor="middle"
                                    style={{ fontSize: '18px', fill: '#fff' }}
                                >
                                    {gauge.emoji}
                                </text>

                                {/* TEKST (Placeret præcis under emojien) */}
                                <text
                                    x="50"
                                    y="58"
                                    textAnchor="middle"
                                    style={{
                                        fontSize: '7.5px',
                                        fontWeight: 'bold',
                                        fill: gauge.color,
                                        letterSpacing: '0.3px',
                                        fontFamily: 'sans-serif'
                                    }}
                                >
                                    {gauge.text}
                                </text>
                            </svg>
                        </div>

                        {/* Højre side: Detaljerne om dette lavvands-spot */}
                        <div className="column is-7">
                            <p className="has-text-weight-bold is-size-6 has-text-white mb-1">
                                {DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.TIME_24_SIMPLE)}
                            </p>
                            <p className="is-size-7 has-text-grey-light mb-2">
                                {DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.DATE_MED)}
                            </p>

                            <div className="is-flex is-align-items-center mb-1">
                                <span className="has-text-info mr-2">🌊</span>
                                <span className="is-size-7 has-text-grey-lighter">
                                    Vandstand: <strong style={{ color: 'currentColor' }}>{Math.round(lowSpot.height)} cm</strong>
                                </span>
                            </div>

                            <div className="is-flex is-align-items-center">
                                <span className="has-text-warning mr-2">💨</span>
                                <span className="is-size-7 has-text-grey-lighter">
                                    Pålandsvind: <strong style={{ color: 'currentColor' }}>{lowSpot.hours} timer</strong>
                                </span>
                            </div>
                        </div>

                    </div>
                </div>
            );
        });
        // If no spots are rendered (all were low chance), show a message
        if (spots.filter(spot => spot !== null).length === 0) {
            return (
                <div className="box has-background-black-ter" style={{ border: '1px solid #2b313a', borderRadius: '12px' }}>
                    <p className="has-text-grey-light is-size-7 has-text-centered">
                        Ingen lavvands-prognoser i dette område.
                    </p>
                </div>
            );
        }

        return spots;
    };

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
                flexDirection: 'column'
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
                        overflow: 'hidden'
                    }}
                >
                    {/* Top Header */}
                    <div className="is-flex is-justify-content-space-between is-align-items-flex-start mb-4">
                        <div>
                            <span className="heading has-text-grey-light mb-0" style={{ letterSpacing: '1px' }}>Kortvalgt område</span>
                            <h2 className="title is-4 has-text-white mt-1 mb-0">{tiderWaterStationName}</h2>
                        </div>
                        <button className="delete" aria-label="close" onClick={() => setSidebarOpen(false)}></button>
                    </div>

                    {/* Nuværende vindforhold */}
                    <div
                        className="mb-4 p-3 is-flex is-align-items-center"
                        style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            borderRadius: '10px',
                            border: '1px solid #363636'
                        }}
                    >
                        <span
                            className="icon is-medium has-text-info mr-3"
                            style={{
                                display: 'inline-block',
                                transform: `rotate(${currentWind?.direction}deg)`,
                                transformOrigin: 'center center',
                                transition: 'transform 0.5s ease'
                            }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                            </svg>
                        </span>
                        <div className="is-size-7">
                            <span className="has-text-grey-light block">Nuværende vind </span>
                            <span className="has-text-weight-semibold">
                                {currentWind?.speed} m/s – {currentWind?.isOnshore ? (
                                    <span className="has-text-success">Pålandsvind</span>
                                ) : (
                                    <span className="has-text-grey">Fralandsvind</span>
                                )}
                            </span>
                        </div>
                    </div>

                    <p className="heading has-text-grey-light mb-3">Kommende lavvands-prognoser:</p>

                    {/* Scrollbar-område */}
                    <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                        {renderSpots()}
                    </div>
                </div>
            )}
        </div>
    );
}