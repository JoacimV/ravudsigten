import React from 'react';
import AmberIcon from "../resources/images/rav.png";

const MapHeader = () => {
    return (
        <>
            {/* Indlejret CSS til responsiv placering på desktop vs. mobil */}
            <style>{`
        .map-header-container {
          position: fixed;
          top: 20px;
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
                <div className="box glass p-3">
                    <div className="is-flex is-align-items-center" >
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
                            <img src={AmberIcon.src} alt="Amber Icon"
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
                            <h1 className="title mb-0 is-size-7">RAVUDSIGTEN</h1>
                            <p className="subtitle is-size-7">Din prognose for ravfund</p>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default MapHeader;