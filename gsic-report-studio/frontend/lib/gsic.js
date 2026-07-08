// GSIC brand constants shared across components.

export const GSIC = {
    green: '#149a49',
    greenHover: '#117a3a',
    greenLight: '#e0f1d9',
    purple: '#4750a2',
    purpleLight: '#dde0fe',
    teal: '#53c3c2',
    gold: '#eec61a',
    orange: '#f15922',
    lime: '#66b445',
    line: '#e6e8ec',
    bg: '#f4f5f7',
};

/** Categorical palette for charts — GSIC accent order used across past tools. */
export const CHART_PALETTE = [
    GSIC.green,
    GSIC.purple,
    GSIC.teal,
    GSIC.gold,
    GSIC.orange,
    GSIC.lime,
    '#8c5fd9',
    '#2a9db5',
];

/** Map an Airtable select color family to the nearest GSIC accent, so
    branded charts still respect the base's own color semantics loosely. */
export function chartColorAt(index) {
    return CHART_PALETTE[index % CHART_PALETTE.length];
}

export const FONT_CSS_URL =
    'https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400;500;600;700;800&display=swap';
