import { useMemo } from "react";
import * as m from "../paraglide/messages.js";
import { deLocalizeHref, getLocale, localizeHref, locales } from "../paraglide/runtime.js";

const labels = {
    da: { flag: "🇩🇰", code: "DA" },
    sv: { flag: "🇸🇪", code: "SV" },
    en: { flag: "🇬🇧", code: "EN" },
    de: { flag: "🇩🇪", code: "DE" },
};

export const LanguagePicker = () => {
    const current = useMemo(() => getLocale(), []);

    const handleChange = (event) => {
        const nextLocale = event.target.value;
        if (!locales.includes(nextLocale)) return;
        if (nextLocale === current) return;

        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const basePath = deLocalizeHref(currentPath);
        const nextPath = localizeHref(basePath, { locale: nextLocale });
        window.location.assign(nextPath);
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
            title={m.lost_such_lark_devour()}
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
                aria-label={m.aqua_topical_seal_mend()}
            >
                {locales.map((locale) => (
                    <option key={locale} value={locale}>
                        {labels[locale]?.flag} {labels[locale]?.code ?? locale.toUpperCase()}
                    </option>
                ))}
            </select>
        </div>
    );
};