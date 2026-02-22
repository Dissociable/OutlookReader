# Security Policy

## Supported Versions
Only the latest version of OutlookReader is supported with security updates.

## Reporting a Vulnerability
Please DO NOT open public issues for security vulnerabilities. Instead, send an email to the project maintainers or use GitHub Security Advisories feature to report vulnerabilities privately. We will respond as soon as possible.

## Threat Model & Static-Host Limitations
OutlookReader is a pure static-host web application that runs entirely inside your browser. Because there is no backend server:
- **Encryption-at-Rest**: Account credentials and refresh tokens are encrypted locally using AES-GCM via Web Crypto API before being stored in your browser's IndexedDB/LocalStorage.
- **In-Memory Danger**: Decrypted credentials exist exclusively in your browser's memory.
- **XSS Risk**: Any Cross-Site Scripting (XSS) vulnerability can potentially expose your decrypted tokens. We strictly use `DOMPurify` to sanitize HTML emails and enforce a strict Content Security Policy (CSP).
- **Client-Side Storage**: If a malicious actor gains access to your physical machine, the safety of your encrypted vault relies entirely on the strength of your master passphrase.

## Secure Usage Guidance
If you are using a shared or public computer, **ALWAYS** initialize the vault using the **Session-only (Ephemeral) mode**. This ensures credentials are kept strictly in memory and are destroyed immediately when you close the tab.
