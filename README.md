# Baalvion Global Trade Platform

This project is the frontend for the Baalvion Global Trade Platform, a sophisticated dashboard for managing international trade operations. It's built with Next.js (App Router), TypeScript, ShadCN UI, and Tailwind CSS.

## Project Structure

The project follows a feature-centric structure, co-locating components and logic with the routes they belong to.

-   `src/app`: Contains all application routes and layouts, following the Next.js App Router paradigm.
    -   `src/app/layout.tsx`: The root layout of the application. It sets up the main `DashboardShell`.
    -   `src/app/page.tsx`: The homepage of the application, which is the main dashboard view.
    -   `src/app/(dashboard)/`: A route group containing all the pages for the dashboard.
        -   `src/app/(dashboard)/_components`: Contains all React components that are specific to the dashboard pages.
-   `src/components`: Contains globally reusable components, primarily the UI primitives from ShadCN (`/ui`).
-   `src/lib`: Home to utility functions (`utils.ts`), mock data (`mock-data.ts`), and other shared logic.
-   `src/ai`: Contains all Genkit-related code for AI features, organized into flows.

## Getting Started

To run the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### Adding a New Page

To add a new page to the dashboard:
1. Create a new folder inside `src/app/(dashboard)/`. For example, `src/app/(dashboard)/new-page`.
2. Add a `page.tsx` file inside the new folder.
3. Add the new route to the navigation in `src/app/(dashboard)/_components/sidebar-nav.tsx`.

### Adding a New Component

- For a component used across multiple dashboard pages, create a new `.tsx` file in `src/app/(dashboard)/_components/`.
- For a component used only on a single page, you can create it within that page's directory.

### Mock Data

All mock data for the application is centralized in `src/lib/mock-data.ts`. To modify or add new data, edit this file.
