import React from 'react';

const values = ['Nu', 'Om 12 timer', 'I morgen', 'Om 36 timer', 'Om 48 timer'];
export default function Slider({ min, max, value, onChange }) {
    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        onChange(newValue);
    };
    return (
        <div className="columns is-mobile" style={{ position: 'fixed', zIndex: 401, bottom: 0 }}>
            <div className="column is-full-mobile" >
                <div className="box m-5 p-4 glass" >
                    <p className="mb-2" style={{ color: '#fffaba', fontSize: 12 }}>Vælg prognosevindue</p>
                    <p>
                        <strong style={{ color: 'white' }}>{values[value]}</strong>
                    </p>
                    <input
                        type="range"
                        min={min}
                        max={max}
                        value={value}
                        onChange={handleChange}
                    />
                </div >
            </div>
        </div >
    );
}
// const pointsStatusText = pointsLoadError ? 'Fejl i data' : pointsLoading ? 'Henter...' : ''
// const activeWindow = POINT_WINDOWS[activeWindowIndex]
// const activeWindowEdgeDate = activeWindow
//     ? calculateWindowEdgeDate(activeWindow.endOffsetHours)
//     : undefined
// const activeWindowTextLabel = WINDOW_TEXT_LABELS[activeWindow?.id] || 'Vindue'
// const activeWindowDateText = activeWindowEdgeDate ? formatDisplayDate(activeWindowEdgeDate) : ''
// const activeWindowTimeText = activeWindowEdgeDate ? formatDisplayTime(activeWindowEdgeDate) : ''
// const activeWindowTopLabel = activeWindowDateText
//     ? `${activeWindowTextLabel} · ${activeWindowDateText}`
//     : activeWindowTextLabel
// const activeWindowTitleText = `${activeWindowTextLabel} ${activeWindowDateText} ${activeWindowTimeText}`.trim()

// <div
//     style={{
//         position: 'absolute',
//         bottom: 16,
//         right: 16,
//         zIndex: 401,
//         width: 176,
//         height: 72,
//         border: '1px solid rgba(255,255,255,0.25)',
//         borderRadius: 10,
//         background: 'rgba(0, 0, 0, 0.7)',
//         color: '#fff',
//         padding: 6,
//         boxShadow: '0 10px 24px rgba(0,0,0,0.22)',
//         backdropFilter: 'blur(10px)',
//     }}
// >
//     <div
//         style={{
//             position: 'absolute',
//             top: 6,
//             left: 6,
//             right: 6,
//             height: 14,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//         }}
//         title={activeWindowTitleText}
//     >
//         <div
//             style={{
//                 fontSize: 9,
//                 opacity: 0.9,
//                 lineHeight: 1,
//                 textAlign: 'left',
//                 whiteSpace: 'nowrap',
//                 overflow: 'hidden',
//                 textOverflow: 'ellipsis',
//                 maxWidth: '70%',
//             }}
//         >
//             {activeWindowTopLabel}
//         </div>
//         <div style={{ fontSize: 8, opacity: 0.78, lineHeight: 1 }}>
//             {activeWindowTimeText}
//         </div>
//     </div>
//     <input
//         className="time-window-slider"
//         type="range"
//         min={0}
//         max={POINT_WINDOWS.length - 1}
//         step={1}
//         value={activeWindowIndex}
//         onChange={(event) => setActiveWindowIndex(Number(event.target.value))}
//         style={{
//             position: 'absolute',
//             left: 8,
//             right: 8,
//             top: 30,
//             width: 'calc(100% - 16px)',
//             height: 14,
//             margin: 0,
//         }}
//         aria-label="Vælg prognosevindue"
//     />
//     <div
//         style={{
//             position: 'absolute',
//             bottom: 6,
//             left: 6,
//             right: 6,
//             minHeight: 8,
//             fontSize: 8,
//             lineHeight: 1,
//             textAlign: 'right',
//             opacity: pointsLoadError ? 1 : 0.85,
//             color: pointsLoadError ? '#fca5a5' : '#fff',
//         }}
//     >
//         {pointsStatusText}
//     </div>
// </div>
// <style>{`
//     .time-window-slider {
//         -webkit-appearance: none;
//         appearance: none;
//         background: transparent;
//         cursor: pointer;
//         accent-color: transparent;
//         -webkit-tap-highlight-color: transparent;
//     }

//     .time-window-slider:focus {
//         outline: none;
//     }

//     .time-window-slider::-webkit-slider-runnable-track {
//         height: 4px;
//         border-radius: 999px;
//         background: rgba(255, 255, 255, 0.28);
//         border: 1px solid rgba(255, 255, 255, 0.22);
//     }

//     .time-window-slider::-webkit-slider-thumb {
//         -webkit-appearance: none;
//         appearance: none;
//         width: 12px;
//         height: 12px;
//         border-radius: 999px;
//         margin-top: -5px;
//         background: #fbbf24;
//         border: 1px solid rgba(255, 255, 255, 0.65);
//         box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.36);
//     }

//     .time-window-slider:focus-visible::-webkit-slider-thumb {
//         box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.36), 0 0 0 4px rgba(251, 191, 36, 0.35);
//     }

//     .time-window-slider::-moz-range-track {
//         height: 4px;
//         border-radius: 999px;
//         background: rgba(255, 255, 255, 0.28);
//         border: 1px solid rgba(255, 255, 255, 0.22);
//     }

//     .time-window-slider::-moz-range-thumb {
//         width: 12px;
//         height: 12px;
//         border-radius: 999px;
//         background: #fbbf24;
//         border: 1px solid rgba(255, 255, 255, 0.65);
//         box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.36);
//     }
// `}</style>