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


    return (
        <>
            <div
                onClick={() => setIsGuideOpen(false)}
                aria-hidden={!isGuideOpen || !isNarrowViewport}
            />
            <div
                style={{
                    position: "absolute",
                    top: 122,
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
                    className="glass p-2 m-1"
                    onClick={() => setIsGuideOpen((prev) => !prev)}
                    aria-expanded={isGuideOpen}
                    aria-controls="map-guide-card"
                    style={{
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                    }}
                    title="Sådan bruger du kortet"
                >
                    <span>{isGuideOpen ? "❌" : "❔"}</span>
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
                        transition: "opacity .2s ease, transform .2s ease, max-height .2s ease",
                        pointerEvents: isGuideOpen ? "auto" : "none",
                    }}
                >
                    <div className="box glass"      >
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