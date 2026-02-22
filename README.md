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

## Deployment & CORS Limitations

While OutlookReader is designed as a static client, **Microsoft Graph's `/token` endpoint strictly enforces CORS headers**. This means that in 90% of cases, pure static hosting (like GitHub Pages) will fail to exchange refresh tokens because your browser will block the cross-origin request.

Therefore, **it is highly recommended to deploy OutlookReader using a provider that supports Serverless Functions or Edge Proxies** so you can run the `/api/token` route as a backend proxy.

### 1. Vercel (Recommended - Free Tier)
Vercel is the easiest way to deploy both the static React frontend and the necessary `/api/token` proxy.
1. Import the project into your Vercel dashboard.
2. The framework preset should default to **Vite**.
3. Create an `api/token.js` or `api/token.ts` file in your repository root to forward the token request to `https://login.microsoftonline.com/common/oauth2/v2.0/token`.
4. Ensure your repository settings set the environment variable: `VITE_USE_OAUTH_PROXY=true`.
5. Vercel will automatically host your frontend and seamlessly proxy the token requests without CORS issues.

### 2. Netlify (Alternative)
Netlify also supports Edge Functions and standard Functions which can act as your proxy.
1. Connect your repository to Netlify.
2. Create a `netlify/functions/token.js` handler to forward the OAuth requests.
3. Update your `netlify.toml` to rewrite `/api/token` to your new function.
4. Set the `VITE_USE_OAUTH_PROXY=true` environment variable.

### Legacy Static Hosting (GitHub Pages / Cloudflare Pages)
If you must use pure static hosting (e.g., GitHub Pages), you *must* have an Entra ID application configured perfectly as a "Single-page application" that explicitly allows your GitHub Pages Origin. If you cannot configure this (or if CORS still blocks you), you will not be able to fetch emails.

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
