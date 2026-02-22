# OutlookReader

📧 Secure, static-hosted React web app for reading Outlook & Hotmail via Microsoft Graph API. No backend required. Features Ephemeral modes, local AES-GCM vault encryption, and beautiful glassmorphism UI built with Shadcn.

## Sponsors & Partners

OutlookReader is built and maintained for free. We are currently looking for visionary email providers organizations to sponsor this project! 

Sponsorship helps ensure the continuous development of zero-backend, privacy-first clients.

*Become our first sponsor to have your logo featured prominently here.* 
[Contact us to become a sponsor](mailto:50553790+Dissociable@users.noreply.github.com)

<div align="center">
  <br/>
  <!-- Sponsor Logos Grid Placeholder -->
  <a href="#"><img src="https://placehold.co/200x80?text=Your+Logo+Here" alt="Sponsor Placeholder" width="200"/></a>
  &nbsp;&nbsp;&nbsp;
  <a href="#"><img src="https://placehold.co/200x80?text=Your+Logo+Here" alt="Sponsor Placeholder" width="200"/></a>
  <br/>
</div>

## Features

- **Portability-First**: Fully static application (no backend required). Easily deployable to GitHub Pages, Netlify, Vercel, or Cloudflare Pages.
- **Three-Pane Desktop Architecture**: A modern, native-feeling layout featuring a seamless sidebar, inbox list, and message detail pane. Responsive fallback to a mobile-friendly stacked layout on smaller screens.
- **Secure Encrypted Vault**: Stores your credentials encrypted locally in IndexedDB using Web Crypto (AES-GCM encryption derived from a master passphrase).
- **Direct Graph Integration**: Communicates directly with Microsoft Graph APIs without a middleman server.
- **Safe HTML Rendering**: Emails are sanitized via DOMPurify to prevent XSS.
- **Premium UI/UX**: Features glassmorphism, micro-interactions, responsive sidebars, and refined typography.

## Security & Privacy Note

This application stores your credentials *locally* in your browser. All communication happens directly between your browser and Microsoft Graph.

While this offers great privacy, please note that any XSS vulnerability or physical access to your unlocked browser could expose your session tokens.
- **Use the Lock feature** when stepping away.
- For shared devices, continuously clear site data.
- Ensure your Microsoft App Registration uses the **Mail.Read** and **offline_access** scopes only.

## Getting Started

### Prerequisites

- Node.js (v18+)
- [pnpm](https://pnpm.io/) (Recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/OutlookReader.git
   cd OutlookReader
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Running Locally

```bash
pnpm dev
```
Open `http://localhost:5173` to view the application in your browser.

## Using the Application

You will need a credential string formatted precisely as:
```text
email:password:refresh_token:client_id
```
*(Note: The `password` segment is ignored and retained only for formatted legacy compatibility. The app relies strictly on the `refresh_token` and `client_id` configured as an Entra ID Single-Page Application (SPA) to exchange tokens).*

1. Initialize the **Vault** with a master passphrase.
2. Under "Add Account", paste your credential string.
3. Once authenticated, unlock the vault to read your emails directly from the inbox pane.

## Environment Configuration

By default, the application will use a local `/api/token` proxy during development (`pnpm dev`) to bypass browser CORS restrictions for Microsoft Graph, while attempting to hit Microsoft's OAuth endpoint directly in production builds.

You can explicitly override this behavior by defining `VITE_USE_OAUTH_PROXY` in a `.env` file at the root of the project:

```env
# Force the app to hit the local proxy even in production builds
VITE_USE_OAUTH_PROXY=true

# Force the app to hit Microsoft directly even during local development
VITE_USE_OAUTH_PROXY=false
```

## Deployment

OutlookReader is a pure static web application designed to be served from any static file host. React Router is configured with Hash Routing (`/#/`) to ensure it works natively without server-side rewrite rules.

### GitHub Pages (Automated via Actions)
The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages when you push to the `main` branch. 
1. In your GitHub repository settings, go to **Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Push to `main` and the workflow will handle the rest.

### Netlify
A `netlify.toml` file is included in the project root with the correct build command and security headers.
1. Connect your repository to Netlify.
2. Netlify will automatically detect the configuration and deploy the `dist` directory.

### Vercel
A `vercel.json` file is included to configure the static export routing and headers.
1. Import the project in your Vercel dashboard.
2. The framework preset should default to **Vite**. Vercel will build and deploy the application.

### Cloudflare Pages
A `wrangler.toml` file is included for Cloudflare.
1. Connect your repository to Cloudflare Pages.
2. Ensure the build command is `pnpm build` and the output directory is set to `dist`.

### Manual Build
To build the application manually:
```bash
pnpm build
```
The deployable static files will be placed in the `dist/` directory.

## Technology Stack

- [React 19](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand.docs.pmnd.rs/getting-started/introduction) (State Management)
- [Microsoft Graph API](https://developer.microsoft.com/en-us/graph)

## License

This project is open-source and available under the [MIT License](LICENSE).
