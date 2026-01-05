import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)'],
                mono: ['var(--font-mono)'],
            },
            colors: {
                // High-end Grayscale (Zinc)
                surface: {
                    app: '#F4F4F5',      // zinc-100 (Background)
                    card: '#FFFFFF',     // White (Cards)
                    hover: '#FAFAFA',    // Very light gray (Hover)
                    stroke: '#E4E4E7',   // zinc-200 (Borders)
                },
                text: {
                    main: '#18181B',     // zinc-900 (Headings)
                    body: '#52525B',     // zinc-600 (Paragraphs)
                    muted: '#A1A1AA',    // zinc-400 (Subtitles)
                },
                brand: {
                    accent: '#18181B',   // Black (Primary Actions)
                    gold: '#D97706',     // Amber-600 (Money/Highlights)
                    success: '#10B981',  // Emerald-500 (Paid Status)
                },
            },
            boxShadow: {
                'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
            }
        },
    },
    plugins: [],
};
export default config;