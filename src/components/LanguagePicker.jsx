import React, { useMemo } from "react";
import { getLocale, setLocale, locales } from "../paraglide/runtime.js";

const labels = {
    dk: "🇩🇰",
    se: "🇸🇪",
    en: "🇬🇧",
    de: "🇩🇪",
};

export const LanguagePicker = () => {
    const current = useMemo(() => getLocale(), []);

    const handleChange = (event) => {
        const nextLocale = event.target.value;
        if (!locales.includes(nextLocale)) return;
        if (nextLocale === current) return;
        setLocale(nextLocale);
    };

    return (
        <div
            className="glass select is-small"
            style={{
                position: "fixed",
                top: 22,
                right: 12,
                zIndex: 1001,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
            }}
            title="Skift sprog"
        >
            <select
                id="language-picker"
                defaultValue={current}
                onChange={handleChange}
                style={{
                    background: "transparent",
                    border: "none",
                    color: "inherit",
                    fontWeight: 700,
                    outline: "none",
                }}
                aria-label="Choose language"
            >
                {locales.map((locale) => (
                    <option key={locale} value={locale}>{labels[locale]}</option>
                ))}
            </select>
        </div>
    );
};