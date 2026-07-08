// GSIC brand tokens on top of Tailwind.
// darkMode MUST be 'media' — Airtable drives dark mode via prefers-color-scheme.
module.exports = {
    darkMode: 'media',
    content: ['./frontend/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"Familjen Grotesk"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
            },
            colors: {
                gsic: {
                    green: '#149a49',
                    greenHover: '#117a3a',
                    greenLight: '#e0f1d9',
                    purple: '#4750a2',
                    purpleLight: '#dde0fe',
                    teal: '#53c3c2',
                    tealLight: '#e7f7f6',
                    gold: '#eec61a',
                    orange: '#f15922',
                    orangeLight: '#f8dcd3',
                    lime: '#66b445',
                    cream: '#fcf3cf',
                    bg: '#f4f5f7',
                    line: '#e6e8ec',
                    lineDark: '#cfd2d8',
                    // Dark-mode surfaces (GSIC artifacts are light-only; these keep the
                    // extension legible when Airtable is in dark appearance)
                    night: '#1d1f25',
                    nightCard: '#26292f',
                    nightLine: '#3a3e46',
                },
            },
            boxShadow: {
                gsic: '0 4px 14px rgba(0,0,0,.05)',
                gsicHover: '0 6px 22px rgba(0,0,0,.06)',
            },
        },
    },
};
