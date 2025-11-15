YoYo Flavor Web App — React Product Requirements Document (PRD)
Product Overview
A modern, bilingual (English/Chinese) restaurant site developed with React.

Uses filesystem (JSON) for backend API, supports future upgrade to a database.

Designed to maximize UI flexibility, accessibility, and ease of customization.

Built with a top React UI library (e.g., Material-UI, Chakra UI, Radix UI + Tailwind CSS) for scalable, beautiful components.

Goals
Increase engagement with interactive features (menu browsing, flavor quiz, reviews).

Streamline admin workflows with simple file-backed APIs.

Ensure privacy and security with minimal data exposure.

Optimize UI/UX with rich animations, responsive layouts, and accessible design.

Primary Users
Visitors: View menu, submit contact forms, play flavor quiz, read blog, leave reviews.

Admin: Manage content via a secure admin dashboard (protected by admin key), reply to contacts, upload content/media, configure branding.

Information Architecture
Public Pages

Home: Hero/banner image, business hours grid, brand tagline/CTA.

Menu: Filterable sidebar (categories/tags), searchable, item cards with price badges, tags, "like" button.

Gallery: Visual media grid.

Blog: News/updates, public viewing, admin CRUD.

Reviews: Star ratings, image attachments, comments, likes/pagination.

Flavor Quiz: Bilingual, maps persona to menu recommendations, WhatsApp share option.

Contact: Address, call/WhatsApp direct links, map embed, refined form with success/error feedback.

Admin Pages

Contacts: View, mark, delete, reply via email.

Settings: Upload/change logo/banner images, edit branding data.

Blog: Create/edit/publish posts, upload images.

Reviews: Moderate ratings/photos, reply or flag comments.

Security: Admin routes gated by encrypted key in localStorage.

Core Features
UI Components: Implemented with Material-UI, Chakra UI, or Tailwind CSS for fast, consistent design.

Routing: React Router for SPA navigation; localized paths (e.g., /en/menu, /zh/menu).

State Management: Context API or Zustand/Recoil for global state (admin key, user locale).

APIs: Local file-based JSON (contacts, menu, posts, reviews, likes, comments, settings).

Admin Workflow: Unlock admin area by key; key stored securely; lock clears context.

Internationalization (i18n): Dictionaries for navigation/UI/labels; paths support /en /zh.

Accessibility: Labelled inputs, color contrast, keyboard navigation support, aria tags.

SEO: Metadata, structured data (JSON-LD), OGP images.

Example Tech Stack
Frontend: React 18, TypeScript, Material-UI/Chakra UI/Tailwind CSS, React Router, React Query (for fetching/persisting API data).

Backend (API): Node.js/Express (or lightweight local server), file system for JSON data, future-ready for migration to Prisma (SQLite/Postgres) if needed.

Deployment: Vercel/Netlify for static files and serverless API functions.

Data Models (Sample JSON)
contacts.json: id, name, email, message, date, status, reply, repliedAt

menu.json: category, subcategory, items (id, name, price, image, tags, available)

posts.json: id, title, excerpt, content, date, locale, published, image

reviews.json: id, name, rating, comment, date, image

likes.json: post, count

comments.json: id, post, name, message, date

settings.json: logoUrl, bannerUrl

Security & Privacy
Admin features protected by encrypted key checked via API header.

No sensitive data stored beyond contact/review text.

UX/UI Brand Palette
Brand palette in CSS variables (--accent, --brand, etc.).

Utility classes (.btn, .btn-primary) for key actions; all major components styled according to brand guide.

Responsive layouts and mobile-first interaction design.

User Flows
Visitor: Browse menu → filter/sort → like items → submit contact → complete quiz → add review.

Admin: Unlock → manage messages/posts/assets/settings → reply/delete as needed.

Roadmap
Phase 1: Refactor UI to React, implement file-backed APIs, admin dashboard.

Phase 2: Add drawer/modal components, review highlights, advanced design system, analytics on CTA/sign-up.

Phase 3: Optional migrate to Prisma DB, add multi-admin support, role-based access, email templates.