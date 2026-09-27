# 📖 tossatale — Premium Storytelling & Editorial Ecosystem (Frontend)

[![Live Website](https://img.shields.io/badge/Live%20Website-tossatale.com-2B638C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://tossatale.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **tossatale** is a handcrafted, typography-first digital storytelling ecosystem combining longform stories, series, essays, and films. Designed with a modern, high-end editorial aesthetic (inspired by Apple, Linear, Framer, and Stripe), it empowers readers, writers, and managing editors within a unified platform.

---

## 🌐 Live Production URL & Links
- **Production Website**: [https://tossatale.com](https://tossatale.com)
- **Staging / Fallback**: [https://www.tossatale.com](https://www.tossatale.com)
- **Sitemap Index**: [https://tossatale.com/sitemap.xml](https://tossatale.com/sitemap.xml)
- **Robots Policy**: [https://tossatale.com/robots.txt](https://tossatale.com/robots.txt)
- **PWA Webmanifest**: [https://tossatale.com/site.webmanifest](https://tossatale.com/site.webmanifest)

---

## 🌟 Executive Presentation & Highlights

### 🎨 Design Philosophy & Brand Casing
- **Brand Identity**: Represented strictly in all-lowercase **"tossatale"** across the platform.
- **Editorial Typography**: Pairing serif Playfair Display headings with crisp Lato body typography for a comfortable reading experience.
- **Text-First Reading Experience**: Story cards, hero spotlights, and article views prioritize rich typography and clean whitespace, operating without story cover image fields.
- **Tailored Dark Mode 🌙**: Deep Steel Obsidian Navy palette (`#0F171E` / `#16212B`) anchored around the core primary color **`#2B638C`** with soft Ice Ivory text (`#F4F7FA`) and a 1-click header theme toggle.

---

## 🚀 Key Features Matrix

### 📚 1. Public Reader Experience
- **Interactive Homepage (`/`)**:
  - **Hero Spotlight**: Dynamic featured editorial story with reading metrics.
  - **Featured Writers Auto-Carousel**: Auto-scrolling (3.5s interval with pause-on-hover) writer spotlight showcase with uniform fixed cards (`h-[240px]`).
  - **Categorized Story Rails**: Memoir, Fiction, Travel, Essays, Speculative, Poetry, and Food.
  - **Editorial Journal & Videos**: Integrated blog dispatches and film documentaries.
- **Story Reader View (`/stories/$slug`)**: Typography-first reading experience with estimated reading times, category tags, author bylines, and bookmarking.
- **Editorial Blogs (`/blogs` & `/blogs/$slug`)**: Rich markdown blog articles with XSS-sanitized link rendering, dynamic table of contents, and social share modals.
- **Short Films & Documentaries (`/videos` & `/videos/$slug`)**: Video showcase with YouTube / Vimeo embeds, engagement metrics, and share modals.
- **Writer Directory (`/writers` & `/writers/$slug`)**: Public author profiles with verified badges, personal statistics, social media channels, and published works.
- **Public Contact Desk (`/contact`)**: Inquiries submission with real-time rate throttling feedback and instant toast notifications.

### ✍️ 2. Writer Studio (`/writer`)
- **Studio Overview Dashboard (`/writer`)**: Track reads, total stories, followers, and engagement metrics.
- **My Profile & Settings (`/writer/profile`)**: Manage personal contact details (Email, Phone), bio, and 7 social/portfolio links (Website, Substack, Instagram, X/Twitter, LinkedIn, Medium, YouTube).
- **Story Editor (`/writer/editor`)**: Pure text-first editor for drafting title, standfirst, rich story body, category, tags, and serial attachments.
- **My Stories & Series (`/writer/stories`, `/writer/series`)**: Drafts, in-review queue, and published story management.

### 🛡️ 3. Admin Control Desk (`/admin`)
- **Homepage Builder (`/admin/homepage-builder`)**: Admin controls to select which writers appear in the **Featured Writers Carousel**, configure top Announcement Bars, and manage site footer details with zero false-positive unsaved alert popups.
- **Editorial Blog Management (`/admin/blogs`)**: Full Markdown blog drafting, live side-by-side preview with sanitized links, and instant publishing.
- **Writer Management & Custom Badges (`/admin/writers/$slug`)**:
  - Grant / revoke **Verified Writer** badges.
  - Create, assign, and delete custom and preset editorial badges (*Editor's Pick*, *100k Reads Club*, etc.).
- **Editorial Review Queue (`/admin/review-queue`)**: Approve, reject, or request revisions on incoming writer submissions.
- **Editorial Direct Publishing (`/admin/editor`)**: Publish top-level editorial pieces directly to the platform.
- **Admin Profile (`/admin/profile`)**: Manage editor credentials, view audit logs, and access desk shortcuts.

### 🔄 4. Universal Navigation & Role Switcher
- **No-Redirect Navigation**: Login redirects directly to the main landing page (`/`) while enabling role action links directly in the sticky top header navbar (**SiteHeader**).
- **Navbar Role Switcher**: Seamlessly switch between **Reader**, **Writer**, and **Admin** modes from the header dropdown menu without losing page state or triggering full redirects.
- **Persistent Role & Theme State**: Remembers your active mode and theme preference in `localStorage` across page transitions and reloads.
- **Under Construction Mode**: Configurable toggle via `VITE_UNDER_CONSTRUCTION=true` for private staging or scheduled maintenance.

---

## 🛠️ Technology Stack

| Layer | Technology / Library |
| :--- | :--- |
| **Framework & Core** | React 19, TypeScript, Vite 8 |
| **Routing & Navigation** | TanStack Router (File-based route tree code splitting) |
| **State & Server Cache** | TanStack Query, Zustand |
| **Styling & Design** | Tailwind CSS v4, OKLCH Design Tokens, Lucide Icons |
| **UI Components & Kit** | Custom Tossa Component Kit (Buttons, Panels, Fields, Avatars, Badges) |
| **Authentication** | SimpleJWT Bearer Tokens, Google OAuth 2.0 1-Click Sign-In |
| **Notifications** | Sonner Toasts |
| **SEO & Discoverability** | Dynamic OpenGraph / Twitter Meta Tags, `sitemap.xml`, `robots.txt`, `site.webmanifest` |
| **Hosting & Deployment** | Netlify / Vercel (Configured via `netlify.toml`, `vercel.json`, and `public/_redirects`) |

---

## 📦 Project Structure

```
tossatale-canvas-main/
├── public/
│   ├── robots.txt                   # Search crawler directives & sitemap location
│   ├── sitemap.xml                  # Master XML sitemap index for search engines
│   ├── site.webmanifest             # Progressive Web App (PWA) manifest
│   ├── _redirects                   # Netlify SPA routing rules
│   └── favicon.ico                  # Platform favicon
├── src/
│   ├── components/
│   │   ├── tossa/
│   │   │   ├── AppShell.tsx         # Admin & Writer Studio layout & sidebar
│   │   │   ├── SiteLayout.tsx       # Main Header, Navbar, Footer & Dark Mode Toggle
│   │   │   ├── StoryCard.tsx        # Text-first story card component
│   │   │   ├── StoryEditor.tsx      # Rich story drafting editor
│   │   │   └── kit.tsx              # Core UI design system kit (buttons, inputs, pills)
│   │   └── ui/                      # shadcn/ui base components
│   ├── lib/
│   │   ├── api.ts                   # TanStack Query & Axios backend API clients
│   │   ├── data.ts                  # Mock data, safe URL sanitizer, catalog helpers
│   │   └── head.ts                  # Dynamic SEO metadata injector
│   ├── routes/
│   │   ├── __root.tsx               # Root application shell & global providers
│   │   ├── index.tsx                # Homepage with Auto-Carousel & Story Rails
│   │   ├── auth.tsx                 # Sign-in / Register / Google OAuth
│   │   ├── stories.index.tsx        # Full stories library & category filtering
│   │   ├── stories.$slug.tsx        # Typography-first story reading view
│   │   ├── blogs.index.tsx          # Editorial blogs & dispatches
│   │   ├── blogs.$slug.tsx          # Blog article reader & dynamic TOC
│   │   ├── videos.index.tsx         # Documentaries & short films showcase
│   │   ├── videos.$slug.tsx         # Video player & film details
│   │   ├── writers.index.tsx        # Verified writer directory
│   │   ├── writers.$slug.tsx        # Public writer profile & portfolio
│   │   ├── contact.tsx              # Public contact & inquiry desk
│   │   ├── about.tsx                # About tossatale philosophy & mission
│   │   ├── writer.profile.tsx       # Writer studio profile settings
│   │   ├── writer.editor.tsx        # Writer story drafting studio
│   │   ├── admin.homepage-builder.tsx # Admin homepage, carousel & footer builder
│   │   ├── admin.blogs.tsx          # Admin editorial blog manager & preview
│   │   ├── admin.writers.$slug.tsx  # Admin writer verification & custom badges
│   │   └── admin.profile.tsx        # Admin credentials & system audit log
│   └── styles.css                   # OKLCH design tokens & tailored dark mode
├── netlify.toml                     # Netlify build & header configuration
├── vercel.json                      # Vercel deployment configuration
├── vite.config.ts                   # Vite 8 build & plugins configuration
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **bun**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Vinaypenke01/Tossatale-Frontend.git
cd Tossatale-Frontend

# Install dependencies
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser to explore the platform.

### 4. Build & Production Preview
```bash
# Build production bundle
npm run build

# Preview build locally
npm run preview
```

---

## ☁️ Deployment

Configured for continuous deployment on **Netlify** or **Vercel**:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist` or `.output/public`
- Redirect rules are pre-configured in `public/_redirects` for single-page application (SPA) routing.

---

## 📄 License

Created for **tossatale**. All rights reserved.
