# 📖 tossatale — Premium Storytelling & Editorial Ecosystem

> **tossatale** is a handcrafted, typography-first digital storytelling ecosystem combining longform stories, series, essays, and films. Designed with a modern, high-end editorial aesthetic (inspired by Apple, Linear, Framer, and Stripe), it empowers readers, writers, and managing editors within a unified platform.

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
- **Writer Directory (`/writers` & `/writers/$slug`)**: Public author profiles with verified badges, personal statistics, social media channels, and published works.

### ✍️ 2. Writer Studio (`/writer`)
- **Studio Overview Dashboard (`/writer`)**: Track reads, total stories, followers, and engagement metrics.
- **My Profile & Settings (`/writer/profile`)**: Manage personal contact details (Email, Phone), bio, and 7 social/portfolio links (Website, Substack, Instagram, X/Twitter, LinkedIn, Medium, YouTube).
- **Story Editor (`/writer/editor`)**: Pure text-first editor for drafting title, standfirst, rich story body, category, tags, and serial attachments.
- **My Stories & Series (`/writer/stories`, `/writer/series`)**: Drafts, in-review queue, and published story management.

### 🛡️ 3. Admin Control Desk (`/admin`)
- **Homepage Builder (`/admin/homepage-builder`)**: Admin controls to select which writers appear in the **Featured Writers Carousel**, configure top Announcement Bars, and manage site footer settings.
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

---

## 🛠️ Technology Stack

| Layer | Technology / Library |
| :--- | :--- |
| **Framework & Core** | React 19, TypeScript, Vite |
| **Routing** | TanStack Router (File-based route tree code splitting) |
| **Styling & Design** | Tailwind CSS v4, OKLCH Design Tokens, Lucide Icons |
| **UI Components & Kit** | Custom Tossa Component Kit (Buttons, Panels, Fields, Avatars, Badges) |
| **Notifications** | Sonner Toasts |
| **Hosting & Deployment** | Netlify (Configured via `netlify.toml` and `public/_redirects`) |

---

## 📦 Project Structure

```
tossatale-canvas/
├── src/
│   ├── components/
│   │   └── tossa/
│   │       ├── AppShell.tsx         # Admin & Writer Studio layout & sidebar
│   │       ├── SiteLayout.tsx       # Main Header, Navbar, Footer & Dark Mode Toggle
│   │       ├── StoryCard.tsx        # Text-first story card component
│   │       ├── StoryEditor.tsx      # Story drafting editor
│   │       └── kit.tsx              # Core UI design system kit
│   ├── lib/
│   │   ├── data.ts                  # Mock data, writer profiles, story catalog
│   │   └── head.ts                  # SEO metadata helper
│   ├── routes/
│   │   ├── index.tsx                # Homepage with Auto-Carousel
│   │   ├── auth.tsx                 # Sign-in / Register
│   │   ├── stories.index.tsx        # Stories index
│   │   ├── stories.$slug.tsx        # Story reading view
│   │   ├── writers.index.tsx        # Writers directory
│   │   ├── writers.$slug.tsx        # Public writer profile
│   │   ├── writer.profile.tsx       # Writer studio profile settings
│   │   ├── admin.homepage-builder.tsx # Admin homepage & carousel builder
│   │   ├── admin.writers.$slug.tsx  # Admin writer management & badges
│   │   └── admin.profile.tsx        # Admin profile & credentials
│   └── styles.css                   # OKLCH design system & dark mode tokens
├── netlify.toml                     # Netlify build & redirect config
├── public/_redirects                # SPA route fallback
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
