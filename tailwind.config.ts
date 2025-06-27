import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				elite: {
					primary: {
						50: '#f0f9ff',
						100: '#e0f2fe',
						200: '#bae6fd',
						300: '#7dd3fc',
						400: '#38bdf8',
						500: '#1e40af',
						600: '#1d4ed8',
						700: '#1e3a8a',
						800: '#1e293b',
						900: '#0f172a',
						950: '#0c1629',
					},
					secondary: {
						50: '#fff7ed',
						100: '#ffedd5',
						200: '#fed7aa',
						300: '#fdba74',
						400: '#fb923c',
						500: '#f97316',
						600: '#ea580c',
						700: '#c2410c',
						800: '#9a3412',
						900: '#7c2d12',
						950: '#431407',
					},
					accent: {
						50: '#f0fdf4',
						100: '#dcfce7',
						200: '#bbf7d0',
						300: '#86efac',
						400: '#4ade80',
						500: '#22c55e',
						600: '#16a34a',
						700: '#15803d',
						800: '#166534',
						900: '#14532d',
						950: '#052e16',
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(30, 64, 175, 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 30px rgba(249, 115, 22, 0.5), 0 0 40px rgba(30, 64, 175, 0.4)' 
					}
				},
				'gradient-shift': {
					'0%, 100%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 3s ease infinite',
				'float': 'float 3s ease-in-out infinite'
			},
			backgroundImage: {
				'elite-primary': 'linear-gradient(135deg, #0c1629 0%, #1e40af 50%, #1d4ed8 100%)',
				'elite-secondary': 'linear-gradient(135deg, #1e293b 0%, #f97316 100%)',
				'elite-button': 'linear-gradient(135deg, #1e40af 0%, #f97316 100%)',
				'elite-card': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
				'elite-hero': 'linear-gradient(135deg, #0c1629 0%, #1e40af 30%, #f97316 70%, #1e40af 100%)',
			},
			boxShadow: {
				'elite': '0 8px 32px rgba(12, 22, 41, 0.6), 0 0 0 1px rgba(30, 64, 175, 0.1)',
				'elite-lg': '0 20px 40px rgba(12, 22, 41, 0.4), 0 0 0 1px rgba(30, 64, 175, 0.2)',
				'cyber': '0 0 20px rgba(30, 64, 175, 0.4), 0 0 40px rgba(30, 64, 175, 0.2)',
				'glow': '0 0 30px rgba(249, 115, 22, 0.3), 0 0 60px rgba(30, 64, 175, 0.2)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
