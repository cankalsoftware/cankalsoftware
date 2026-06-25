# Next.js & Vercel Guide

This document is designed to help you understand the tools and platforms we are using to build the Cankal Software website. Since this stack (Next.js + Vercel) is new to you, here is a breakdown of how it works and how to manage it.

## 1. What is Next.js?
Next.js is a powerful React framework created by Vercel. It allows us to build fast, SEO-friendly web applications.
- **App Router (`src/app`):** We use the latest Next.js feature called the App Router. Every folder inside `src/app` becomes a route (e.g., `src/app/about/page.tsx` becomes `cankalsoftware.com/about`).
- **Server and Client Components:** Next.js allows some parts of your website to render on the server (which is great for SEO and performance) and some parts on the client (like interactive buttons or contact forms).
- **API Routes:** You can build backend APIs directly in Next.js. We will use this feature (`src/app/api/contact/route.ts`) to securely send emails from the contact form without needing a separate backend server.

## 2. Tailwind CSS & Framer Motion
- **Tailwind CSS:** A utility-first CSS framework. Instead of writing custom CSS files, we use Tailwind's classes directly in our HTML (e.g., `<div className="bg-purple-900 text-white p-4">`). This speeds up development and ensures consistency.
- **Framer Motion:** A production-ready animation library for React. We use it to create the "flashy, futuristic" glassmorphism hover effects and scroll animations you requested.

## 3. Vercel (Hosting & Deployment)
Vercel is the platform that created Next.js, and it provides the best hosting experience for it.
- **Continuous Deployment:** Once we connect your GitHub repository to Vercel, every time we push new code to the `main` branch, Vercel will automatically build and deploy the changes within minutes.
- **Environment Variables:** For security, sensitive data like your SMTP passwords should never be stored in the code. In Vercel, you will add these securely in the Project Settings -> Environment Variables.

## 4. Managing Environment Variables Locally
To run the project on your own machine and test the Contact form, you need to create a file named `.env.local` in the root folder (next to `package.json`).

Example `.env.local` format:
```env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=465
SMTP_USER=info@cankalsoftware.com
SMTP_PASS=your_email_password
```
*(Do not share this file or commit it to GitHub. It is ignored automatically.)*

## 5. Helpful Commands
- `npm run dev`: Starts the local development server (usually at http://localhost:3000).
- `npm run build`: Compiles the application for production.
- `npm start`: Runs the compiled production application.

## 6. Official Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
