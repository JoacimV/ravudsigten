import React, { useEffect, useRef, useState } from "react";
import heatlayer from "../resources/images/heatlayer.png"
const MAP_GUIDE_SEEN_STORAGE_KEY = "amberFinder.mapGuideSeen"

export default function MapGuideControl() {
    const guideRef = useRef(null)
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

    useEffect(() => {
        if (!isGuideOpen) {
            return undefined
        }

        const handlePointerDown = (event) => {
            if (guideRef.current && !guideRef.current.contains(event.target)) {
                setIsGuideOpen(false)
            }
        }

        document.addEventListener("mousedown", handlePointerDown)

        return () => {
            document.removeEventListener("mousedown", handlePointerDown)
        }
    }, [isGuideOpen])

    return (
        <>
            <div
                onClick={() => setIsGuideOpen(false)}
                aria-hidden={!isGuideOpen || !isNarrowViewport}
            />
            <div
                ref={guideRef}
                style={{
                    position: "fixed",
                    top: 22,
                    right: 12,
                    zIndex: 1000,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    width: "min(520px, calc(100vw - 24px))",
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
                    className="glass px-4 py-3 mt-4"
                    style={{
                        width: "100%",
                        overflow: "hidden",
                        transformOrigin: "top right",
                        maxHeight: isGuideOpen ? "min(90vh, 920px)" : 0,
                        opacity: isGuideOpen ? 1 : 0,
                        transform: isGuideOpen ? "scale(1) translateY(0)" : "scale(0.88) translateY(-12px)",
                        transition: "max-height 180ms cubic-bezier(0.22, 1, 0.36, 1), transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
                        pointerEvents: isGuideOpen ? "auto" : "none",
                    }}
                >
                    <div className="box glass" style={{ position: "relative" }}>
                        <button
                            type="button"
                            className="delete is-small m-1"
                            aria-label="Luk guide"
                            onClick={() => setIsGuideOpen(false)}
                            style={{ position: "absolute", top: 10, right: 10, scale: 1.2 }}
                        />
                        <p className="title is-6 mb-3 pr-5">
                            Sådan virker kortet
                        </p>
                        <p className="content is-small has-text-weight-medium mb-3">
                            Tryk på kortet for at vælge et punkt og se en mere detaljeret prognose fra de nærmeste målestationer.
                        </p>
                        <p className="content is-small has-text-weight-medium mb-3">
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
                        </p>
                        <p className="content is-small has-text-grey">
                            Tip: skift mellem standardkort og satellitvisning for at sammenligne kystlinje og hotspots 🗺️.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}