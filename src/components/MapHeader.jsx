import React from 'react';
import AmberIcon from "../resources/images/rav.png"


// const AmberIcon = () => (
//   <svg
//     width="32"
//     height="36"
//     viewBox="0 0 32 36"
//     fill="none"
//     xmlns="http://www.w3.org/2000/svg"
//     style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))' }}
//   >
//     <defs>
//       {/* 3D Krop: Radial gradient placeret øverst til venstre for at skabe en rund "buelinje" */}
//       <radialGradient id="amber3D" cx="35%" cy="30%" r="70%">
//         <stop offset="0%" stopColor="#FFEA79" />   {/* Lyseste punkt */}
//         <stop offset="40%" stopColor="#F59E0B" />  {/* Varm rav-krop */}
//         <stop offset="75%" stopColor="#D97706" />  {/* Mørkere orange */}
//         <stop offset="100%" stopColor="#92400E" /> {/* Mørk skyggekant */}
//       </radialGradient>

//       {/* Indre glød for at give illusion af gennemsigtighed */}
//       <radialGradient id="innerGlow" cx="60%" cy="60%" r="50%">
//         <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.8" />
//         <stop offset="100%" stopColor="#B45309" stopOpacity="0" />
//       </radialGradient>

//       {/* Blød bundskygge der følger formens runding */}
//       <linearGradient id="bottomCurve" x1="0%" y1="0%" x2="100%" y2="100%">
//         <stop offset="0%" stopColor="#451A03" stopOpacity="0" />
//         <stop offset="100%" stopColor="#321302" stopOpacity="0.75" />
//       </linearGradient>
//     </defs>

//     {/* Yderstreg og hovedform */}
//     <path
//       d="M15 2.5 
//          C20.5 2.5, 26.5 6, 28 11.5 
//          C29.5 17, 28.5 23.5, 25 27.5 
//          C21.5 31.5, 14 33, 9 29.5 
//          C4 26, 2 19.5 3 13.5 
//          C4 7.5, 9.5 2.5, 15 2.5 Z"
//       fill="url(#amber3D)"
//       stroke="#3A1700"
//       strokeWidth="2.5"
//       strokeLinejoin="round"
//       strokeLinecap="round"
//     />

//     {/* Indre varm glød (giver masse/fylde indeni) */}
//     <path
//       d="M15 2.5 
//          C20.5 2.5, 26.5 6, 28 11.5 
//          C29.5 17, 28.5 23.5, 25 27.5 
//          C21.5 31.5, 14 33, 9 29.5 
//          C4 26, 2 19.5 3 13.5 
//          C4 7.5, 9.5 2.5, 15 2.5 Z"
//       fill="url(#innerGlow)"
//     />

//     {/* 3D Krummende bundskygge */}
//     <path
//       d="M6 21 C10 28, 16 32, 25 28.5 C27.5 25, 28 20, 28 18 C26 26, 18 31, 10 28 C6.5 26.5, 5.5 23, 6 21 Z"
//       fill="url(#bottomCurve)"
//     />

//     {/* De to lodrette mærker i midten (med svag skygge under sig for 3D effekt) */}
//     <ellipse cx="14" cy="15.2" rx="1.3" ry="2.5" transform="rotate(-8 14 15.2)" fill="#3A1700" opacity="0.3" />
//     <ellipse cx="13.5" cy="14.5" rx="1.2" ry="2.4" transform="rotate(-8 13.5 14.5)" fill="#6C2E05" />

//     <ellipse cx="19" cy="14.2" rx="1.2" ry="2.3" transform="rotate(-5 19 14.2)" fill="#3A1700" opacity="0.3" />
//     <ellipse cx="18.5" cy="13.5" rx="1.1" ry="2.2" transform="rotate(-5 18.5 13.5)" fill="#6C2E05" />

//     {/* Hoved-highlight (lang hvid kurve der følger overfladens krumning) */}
//     <path
//       d="M8 9 C6.2 12, 6 15.5 7.5 18"
//       stroke="#FFFFFF"
//       strokeWidth="2.8"
//       strokeLinecap="round"
//       opacity="0.85"
//     />

//     {/* Sekundært blødt highlight (giver glans) */}
//     <path
//       d="M9.5 7.5 C12 5.5, 15.5 5, 18.5 6"
//       stroke="#FFFFFF"
//       strokeWidth="1.5"
//       strokeLinecap="round"
//       opacity="0.5"
//     />

//     <circle cx="11.5" cy="6.2" r="1.2" fill="#FFFFFF" opacity="0.95" />

//     {/* De to skarpe hvide lysprikker nederst til højre */}
//     <circle cx="20.5" cy="25" r="1.1" fill="#FFFFFF" />
//     <circle cx="23" cy="23" r="1.4" fill="#FFFFFF" />
//   </svg>
// );
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
                    className="box p-2 px-4"
                    style={{
                        backgroundColor: 'rgba(17, 24, 39, 0.75)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                        borderRadius: '10px',
                    }}
                >
                    <div className="is-flex is-align-items-center">
                        {/* Ikon */}
                        <div className="is-flex is-align-items-center is-justify-content-center">
                            <img src={AmberIcon} alt="Amber Icon"
                                style={{
                                    width: '55px',
                                    height: '55px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.4))',
                                }}
                            />
                        </div>

                        {/* Tekstsektion */}
                        <div style={{ overflow: 'hidden' }}>
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
                                    whiteSpace: 'nowrap',
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