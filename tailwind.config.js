module.exports = {
  // Scanned for class names: the markup and every template literal in app.js.
  content: ['./casaven74 (3).html', './app.js'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        marker: ['Permanent Marker', 'cursive'],
        gothic: ['UnifrakturCook', 'serif'],
      },
      colors: {
        obsidian: '#050505',
        graphite: '#0e0e11',
        carbon: '#16161a',
        ash: '#27272a',
      },
      animation: {
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
