import React, { useEffect, useRef, useState } from "react";
import heatlayer from "../resources/images/heatlayer.png"
import * as m from "../paraglide/messages"
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
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 999,
                    background: isGuideOpen ? "rgba(4, 12, 18, 0.42)" : "transparent",
                    backdropFilter: isGuideOpen ? "blur(8px) saturate(120%)" : "none",
                    WebkitBackdropFilter: isGuideOpen ? "blur(8px) saturate(120%)" : "none",
                    opacity: isGuideOpen ? 1 : 0,
                    pointerEvents: isGuideOpen ? "auto" : "none",
                    transition: "opacity 180ms ease, backdrop-filter 180ms ease, background 180ms ease",
                }}
            />
            <div
                ref={guideRef}
                style={{
                    position: "fixed",
                    top: 64,
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
                    title={m.dirty_formal_bullock_bless()}
                >
                    <span>{isGuideOpen ? "❌" : "❔"}</span>
                </button>
                <div
                    id="map-guide-card"
                    className="px-4 py-3 mt-4"
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
                            aria-label={m.small_clear_moth_hurl()}
                            onClick={() => setIsGuideOpen(false)}
                            style={{ position: "absolute", top: 10, right: 10, scale: 1.2 }}
                        />
                        <p className="title is-6 mb-3 pr-5">
                            {m.antsy_away_elephant_amuse()}
                        </p>
                        <p className="content is-small has-text-weight-medium mb-3">
                            {m.wacky_brief_penguin_boil()}
                        </p>
                        <p className="content is-small has-text-weight-medium mb-3">
                            {m.long_cozy_tadpole_advise()}
                            <img
                                src={heatlayer.src}
                                alt={m.vexed_patchy_wren_lift()}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    marginTop: 10,
                                    borderRadius: 12,
                                }}
                            />
                        </p>
                        <p className="content is-small has-text-grey">
                            {m.tangy_neat_ray_reap()}
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}