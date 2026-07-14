import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';

/* eslint-disable react/prop-types */
export default function Sidebar({ loading, tiderWaterStationName, currentWind, lowSpots, sidebarOpen, setSidebarOpen }) {
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 768px)").matches
    )
    useEffect(() => {
        window
            .matchMedia("(min-width: 768px)")
            .addEventListener('change', e => setMatches(e.matches));
    }, []);
    const calculateChance = (hours) => {
        let result = 'God 👍'
        if (hours < 3) {
            result = "Dårlig 👎";
        } else if (hours <= 7) {
            result = "Moderat 🤷";
        }
        return result;
    }

    const renderLowSpots = () => {
        const spots = [];
        for (const lowSpot of lowSpots) {
            if (calculateChance(lowSpot.hours) === "Dårlig 👎") {
                continue;
            }
            spots.push(
                <div className="card" key={lowSpot.height}>
                    <div className="card-content">
                        <div className="content">
                            <p>{DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.DATE_MED)} - {DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.TIME_24_SIMPLE)}</p>
                            <p title="Vandstand">🌊: {Math.round(lowSpot.height)}cm</p>
                            <p title="Timer med pålandsvind">💨: {lowSpot.hours} timer</p>
                            <p className="has-text-weight-medium" style={{ fontSize: 18 }}>Chance: {calculateChance(lowSpot.hours)}</p>
                        </div>
                    </div>
                </div>
            )
        }
        if (spots.length === 0) {
            return <div className="card">
                <div className="card-content">
                    <div className="content">
                        <p>Ingen lavvands alarmer</p>
                    </div>
                </div>
            </div>
        }
        return spots;
    }

    if (!sidebarOpen) {
        return null;
    } else return (
        <div style={{ position: 'absolute', zIndex: 401, overflowY: 'auto', height: matches ? '35vh' : '30vh', left: 10, bottom: 0 }}>
            {loading ?
                <div className='box' style={!matches ? { minWidth: '95vw' } : { minWidth: '30vw' }}>
                    <h1 className="is-size-4 has-text-weight-bold is-skeleton">Henter data...</h1>
                    <hr />
                    <div className='card is-skeleton'>
                        <br />
                        <br />
                    </div>
                    <div className='card is-skeleton'>
                        <br />
                        <br />
                    </div>
                </div> :
                <div>
                    <div className='box' style={!matches ? { minWidth: '95vw' } : { minWidth: '30vw' }}>
                        <div className='box'>
                            <button className="delete is-pulled-right" onClick={() => setSidebarOpen(false)}></button>
                            <h1 className="is-size-4 has-text-weight-bold">{tiderWaterStationName}</h1>
                            <span className='is-size-4' style={{ display: 'inline-block', transform: `rotate(${currentWind?.direction}deg)`, transformOrigin: 'center center' }}><i className='bx bx-down-arrow-alt'></i></span>
                            <span>  {currentWind?.speed}ms ({currentWind?.isOnshore ? 'Pålandsvind' : 'Fralandsvind'})</span>
                        </div>
                        {renderLowSpots()}
                    </div>
                </div>}
        </div >
    )
}