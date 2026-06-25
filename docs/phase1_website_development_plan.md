# Phase 1: Cankal Software & IT Consultancy Website Plan

## Overview
Cankal Software & IT Consultancy Ltd. requires a premium, futuristic, and highly aesthetic website to reflect its expertise in AI, ML, and web development. This site will serve as the primary landing page for traffic coming from LinkedIn and other channels, showcasing both internal SaaS products (Firevision, Evacuation App, Forex Tracker, etc.) and customer projects. The goal is to build a "flashy, eye-catching, glass-look" website using Next.js and Tailwind CSS, which will be deployed on Vercel.

## Technology Stack
- **Framework:** Next.js (App Router) for optimal performance, API routes, and SEO.
- **Styling:** Tailwind CSS with a custom deep purple/blue neon theme supporting both Light and Dark modes.
- **Animations:** Framer Motion (for dynamic scroll animations, hover effects, and transitions).
- **Icons:** Lucide React or similar modern icon set.
- **Email/Contact:** Nodemailer with custom SMTP (info@cankalsoftware.com).

## Design System (Glassmorphism & Futuristic UI)
- **Colors:** Deep purple and blues with neon accents. Full support for Dark and Light modes.
- **Backgrounds:** Dynamic, glowing gradient orbs (mesh gradients) that adapt to the theme.
- **Cards/Containers:** Semi-transparent, blurred backgrounds (`backdrop-blur-md`) with thin borders to create the "glass" effect.
- **Typography:** Premium modern sans-serif fonts (e.g., *Inter* or *Outfit*).
- **Interactions:** Smooth hover animations, glowing borders on focus, and scroll-triggered fade-ins.

## Pages & Architecture

### 1. Landing / Home Page
- **Hero Section:** High-impact headline, dynamic background, and a strong Call to Action (CTA). Will include an aesthetic AI-generated logo if the uploaded one needs refinement.
- **SaaS Showcase:** Glassmorphic grid highlighting:
  - firevision.uk
  - Evacuation App
  - Forex Tracker and Prediction
  - Arcade Games
- **Client Portfolio:** Carousel or grid of customer projects:
  - yangincim.com
  - usman-yangin.com
  - dardayim.com
  - alicankal.com
  - gotoaltinkum.com
  - cbt-os.com
  - handmadetoorder.uk
  - mentorinai.com
- **Trust Elements:** Brief mention of AI/ML expertise.

### 2. About Us Page
- Company history, AI & ML focus, and mission statement.
- Leadership/Team section if applicable.

### 3. Contact Page
- Glassmorphic contact form connected to a Next.js API route that uses SMTP (info@cankalsoftware.com) to send emails.
- `.env` variables will be set up for SMTP configuration.
- Company registered details: Cankal Software and IT Consultancy Ltd.
- LinkedIn and social links.

## Development Phases

### Phase 1: Setup & Planning (Completed)
- Finalize this plan and initialize the Next.js project in the repository.
- Setup `docs/` folder with documentation.

### Phase 2: Design System & Core Components (In Progress)
- Configure Tailwind, global CSS, and design tokens (colors, fonts).
- Setup Next.js boilerplate and Vercel-specific skills.
- Build the Navbar, Footer, and basic layouts (GlassContainer, ProjectCard, ThemeToggle).

### Phase 3: Page Implementation
- Develop the Landing page, About Us, and Contact pages with responsive design.
- Integrate Framer Motion for the requested "flashy" feel.
- Implement the SMTP email contact route.

### Phase 4: Content Integration
- Add the provided logo and project screenshots (or generate AI variants).
- Refine text and copy inspired by `firevision.uk`, `alicankal.com`, etc.

### Phase 5: Deployment & Optimization
- Ensure perfect Lighthouse scores for SEO and performance.
- Push to GitHub and connect to Vercel for live hosting.
