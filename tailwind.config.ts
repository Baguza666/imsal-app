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
                // THE NEW IMSAL PALETTE
                surface: {
                    app: '#000000',      // Deepest Black (Main BG)
                    card: '#121212',     // Dark Gray (Cards)
                    hover: '#1E1E1E',    // Slightly lighter (Hover state)
                    stroke: '#27272A',   // Border lines (Zinc-800)
                    input: '#09090b',    // Very dark input background
                },
                text: {
                    main: '#FFFFFF',     // Pure White (Headings)
                    body: '#A1A1AA',     // Light Gray (Paragraphs)
                    muted: '#52525B',    // Darker Gray (Subtitles)
                },
                brand: {
                    gold: '#F59E0B',     // The "IMSAL Gold" (Amber-500)
                    goldHover: '#D97706',// Darker Gold for hovers
                    success: '#10B981',  // Green (Paid)
                    danger: '#EF4444',   // Red (Overdue)
                    pending: '#F59E0B',  // Orange (Pending)
                },
            },
            boxShadow: {
                'glow': '0 0 20px -5px rgba(245, 158, 11, 0.15)', // Subtle gold glow
            }
        },
    },
    plugins: [],
};
export default config;