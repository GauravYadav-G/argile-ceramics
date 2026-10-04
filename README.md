# Argile — Artisanal Wheel-Thrown Ceramics · Marseille

**Artisanal Ceramics & Workshop Studio · Marseille, France** · Standalone Production Website

Stoneware and porcelain ceramics thrown on the wheel and wood-fired in Marseille from local Provençal clays.

---

## Key Highlights & Features

- **E-Commerce Shop & Cart Drawer**: Interactive product catalog with category filtering (Vases, Sets, Planters) and live cart drawer.
- **Free Shipping Progress Tracker**: Dynamic cart threshold bar calculating free worldwide dispatch eligibility.
- **Six-Stage Slow Craft Method**: In-depth guide covering wedging, wheel-throwing, drying, bisque firing, custom ash glazing, and 1,260°C kiln firing.
- **Weekend Studio Workshop Booking**: Reserve a private pottery wheel masterclass with Marseille ceramicists.

---

## Quick Start

Run this website locally in development mode:

```bash
# Navigate to this website
cd websites/argile

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## Project Structure

```
websites/argile/
├── index.html           # Bespoke page title, fonts, meta & theme color
├── package.json         # Standalone dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Bundler config with Tailwind CSS v4 & single-file
├── README.md            # Quick-start documentation
├── public/              # Dedicated assets
└── src/
    ├── main.tsx         # React root
    ├── App.tsx          # Standalone application entry
    ├── index.css        # Tailwind v4 theme & animation tokens
    ├── lib/             # Shared motion, WebGL canvas, smooth scroll & images
    └── ...              # Dedicated components and data
```
