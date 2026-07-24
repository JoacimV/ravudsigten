import React from 'react';
import AmberIcon from "../resources/images/rav.png"

const MapHeader = () => {
    return (
        <>
            {/* Indlejret CSS til responsiv placering på desktop vs. mobil */}
            <style>{`
        .map-header-container {
          position: absolute;
          top: 0.75rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          width: auto;
          max-width: calc(100% - 130px);
          pointer-events: auto;
        }

        /* På skærme større end 600px (f.eks. tablet og computer) flyttes den til venstre */
        @media (min-width: 600px) {
          .map-header-container {
            left: 65px; /* Skubber den forbi zoom-knapperne (+ / -) */
            transform: none;
            max-width: 340px;
          }
        }
      `}</style>

            <header className="map-header-container">
                <div
                    className="box"
                    style={{
                        backgroundColor: 'rgba(17, 24, 39, 0.75)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                        padding: '0.45rem 0.7rem 0.45rem 0.55rem',
                    }}
                >
                    <div className="is-flex is-align-items-center" style={{ gap: '0.35rem' }}>
                        {/* Ikon */}
                        <div
                            className="is-flex is-align-items-center is-justify-content-center"
                            style={{
                                width: 'clamp(32px, 8vw, 44px)',
                                height: 'clamp(32px, 8vw, 44px)',
                                overflow: 'hidden',
                                flexShrink: 0,
                            }}
                        >
                            <img src={AmberIcon} alt="Amber Icon"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center 45%',
                                    transform: 'scale(1.04)',
                                    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))',
                                }}
                            />
                        </div>

                        {/* Tekstsektion */}
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <h1
                                className="title mb-0"
                                style={{
                                    color: '#FFFFFF',
                                    fontSize: 'clamp(0.85rem, 3.5vw, 1.1rem)',
                                    fontWeight: '700',
                                    letterSpacing: '1px',
                                    whiteSpace: 'nowrap',
                                    lineHeight: 1.1,
                                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}
                            >
                                RAVUDSIGTEN
                            </h1>
                            <p
                                className="subtitle mb-0 mt-1"
                                style={{
                                    color: '#D1D5DB',
                                    fontSize: 'clamp(0.6rem, 2.2vw, 0.72rem)',
                                    fontWeight: '400',
                                    letterSpacing: '0.2px',
                                    whiteSpace: 'normal',
                                    lineHeight: 1,
                                    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}
                            >
                                Din prognose for ravfund
                            </p>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default MapHeader;