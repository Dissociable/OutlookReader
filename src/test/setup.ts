import '@testing-library/jest-dom'

// Polyfill Web Crypto API for node/jsdom environment if necessary
if (typeof crypto === 'undefined' || !crypto.subtle) {
    import('crypto').then(({ webcrypto }) => {
        Object.defineProperty(globalThis, 'crypto', {
            value: webcrypto,
            configurable: true
        })
    })
}
