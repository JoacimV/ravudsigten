import React, { useEffect, useState } from "react";
import heatlayer from "../resources/images/heatlayer.png"
const MAP_GUIDE_SEEN_STORAGE_KEY = "amberFinder.mapGuideSeen"

export default function MapGuideControl() {
    const [isGuideOpen, setIsGuideOpen] = useState(() => {
        if (typeof window === "undefined") {
            return false
        }

        return window.localStorage.getItem(MAP_GUIDE_SEEN_STORAGE_KEY) !== "true"
    })
    const [isNarrowViewport, setIsNarrowViewport] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 768px)")

        const updateViewport = () => {
            setIsNarrowViewport(mediaQuery.matches)
        }

        updateViewport()
        mediaQuery.addEventListener("change", updateViewport)

        return () => {
            mediaQuery.removeEventListener("change", updateViewport)
        }
    }, [])

    useEffect(() => {
        if (isGuideOpen) {
            window.localStorage.setItem(MAP_GUIDE_SEEN_STORAGE_KEY, "true")
        }
    }, [isGuideOpen])

    const controlButtonStyle = {
        border: "1px solid rgba(255,255,255,0.35)",
        background: "rgba(0, 0, 0, 0.7)",
        color: "#fff",
        padding: "8px 10px",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        backdropFilter: "blur(10px)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
    }

    return (
        <>
            <div
                onClick={() => setIsGuideOpen(false)}
                aria-hidden={!isGuideOpen || !isNarrowViewport}
                style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 998,
                    background: "rgba(3, 7, 18, 0.36)",
                    backdropFilter: isGuideOpen && isNarrowViewport ? "blur(4px)" : "blur(0px)",
                    opacity: isGuideOpen && isNarrowViewport ? 1 : 0,
                    pointerEvents: isGuideOpen && isNarrowViewport ? "auto" : "none",
                    transition: "opacity 220ms ease, backdrop-filter 220ms ease",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    width: "min(320px, calc(100vw - 24px))",
                }}
            >
                <button
                    type="button"
                    onClick={() => setIsGuideOpen((prev) => !prev)}
                    aria-expanded={isGuideOpen}
                    aria-controls="map-guide-card"
                    style={{
                        ...controlButtonStyle,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                    }}
                    title="Sådan bruger du kortet"
                >
                    <span>{isGuideOpen ? "❌" : "❔"}</span>
                    {/* <span
                        aria-hidden="true"
                        style={{
                            display: "inline-block",
                            transform: isGuideOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 220ms ease",
                        }}
                    >
                        ▾
                    </span> */}
                </button>
                <div
                    id="map-guide-card"
                    style={{
                        width: "100%",
                        overflow: "hidden",
                        transformOrigin: "top right",
                        maxHeight: isGuideOpen ? "min(70vh, 520px)" : 0,
                        opacity: isGuideOpen ? 1 : 0,
                        transform: isGuideOpen ? "scale(1) translateY(0)" : "scale(0.88) translateY(-12px)",
                        transition: "max-height 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease, transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
                        pointerEvents: isGuideOpen ? "auto" : "none",
                    }}
                >
                    <div
                        style={{
                            borderRadius: 16,
                            padding: "14px 16px 16px",
                            background: "linear-gradient(180deg, rgba(11,18,32,0.94), rgba(18,34,58,0.92))",
                            color: "#f8fafc",
                            border: "1px solid rgba(255,255,255,0.16)",
                            boxShadow: "0 18px 42px rgba(0,0,0,0.28)",
                            backdropFilter: "blur(16px)",
                            maxHeight: "min(70vh, 520px)",
                            overflowY: "auto",
                        }}
                    >
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                            Sådan virker kortet
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.92 }}>
                            Tryk på kortet for at vælge et punkt og se en mere detaljeret prognose fra de nærmeste målestationer.
                        </div>
                        <div style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.92, marginTop: 10 }}>
                            De farvede felter viser de steder, hvor chancen for at finde rav ser bedst ud lige nu.
                            <img
                                src={heatlayer}
                                alt="Eksempel på heatmap overlay"
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginTop: 10,
                                    borderRadius: 12,
                                }}
                            />
                        </div>
                        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.72 }}>
                            Tip: skift mellem standardkort og satellitvisning for at sammenligne kystlinje og hotspots 🗺️.
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}