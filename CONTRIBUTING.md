# Contributing to OutlookReader

First off, thank you for considering contributing to OutlookReader!

## Coding Style
- We use React, TypeScript, and Tailwind CSS.
- Strictly adhere to the existing `shadcn/ui` design patterns and Tailwind utility classes.
- Make use of CSS variables defined in our theme for colors instead of hardcoded hex codes.
- Use `pnpm` exclusively for package management. Do NOT use `npm` or `yarn`.

## Documentation Standards
- Public exports and complex functions MUST have JSDoc comments.
- Any changes involving Web Crypto, token exchange, or Microsoft Graph integration must include inline explanatory comments detailing the security rationale.

## Testing Requirements
Before submitting a Pull Request, please ensure:
1. All TypeScript compilation passes without errors via `pnpm tsc -b`.
2. Any new features include relevant unit or integration tests.
3. Security enhancements involving `DOMPurify` include test payloads verifying XSS prevention.
4. The UI works seamlessly in both Desktop (3-pane) and Mobile (stacked) views.

## Adding Features
This project aims to be a lightweight, secure email reader. Features that require complex server-side infrastructure will be rejected. All features must be compatible with statically-hosted environments (GitHub Pages, Cloudflare Pages, Netlify).
