import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // AUREUS SYSTEM
                surface: {
                    app: "#09090B", // OLED Saver
                    card: "#121214", // Content containers
                    input: "#18181B", // Form fields
                },
                border: {
                    subtle: "#27272A", // Card dividers
                    focus: "#E5C07B", // Active input states
                },
                text: {
                    hero: "#FAFAFA", // Primary headings
                    body: "#D4D4D8", // Standard paragraphs
                    muted: "#71717A", // Metadata
                },
                brand: {
                    gold: "#E5C07B", // "Champagne" (Money In)
                    action: "#FAFAFA", // Primary Buttons
                },
            },
            fontFamily: {
                // BRAND TYPOGRAPHY (Manrope)
                sans: ["var(--font-manrope)", "sans-serif"],
                heading: ["var(--font-manrope)", "sans-serif"],

                // FINANCIAL TYPOGRAPHY (Geist/Mono for data)
                mono: ["var(--font-geist-mono)", "monospace"],
            },
        },
    },
    plugins: [],
};
export default config;