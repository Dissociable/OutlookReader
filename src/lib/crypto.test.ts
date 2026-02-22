import { describe, it, expect } from "vitest"
import { encryptAccount, decryptAccount } from "./crypto"
import type { ParsedCredential } from "./validation"

describe("Web Crypto Vault functions", () => {
    const mockCred: ParsedCredential = {
        email: "test@example.com",
        passwordIgnored: true,
        refreshToken: "eyRefresh.Token.Data",
        clientId: "azure-client-id"
    }

    const passphrase = "super-secret-master-passphrase"

    it("should successfully encrypt and decrypt an account payload", async () => {
        // Encrypt
        const encrypted = await encryptAccount(mockCred, passphrase)

        expect(encrypted.id).toBeDefined()
        expect(encrypted.cipherText).toBeDefined()
        expect(encrypted.iv).toBeDefined()
        expect(encrypted.salt).toBeDefined()
        expect(encrypted.email).toBe(mockCred.email)
        expect(encrypted.clientId).toBe(mockCred.clientId)

        // Decrypt
        const decrypted = await decryptAccount(encrypted, passphrase)

        expect(decrypted.email).toBe(mockCred.email)
        expect(decrypted.refreshToken).toBe(mockCred.refreshToken)
        expect(decrypted.clientId).toBe(mockCred.clientId)
        expect(decrypted.passwordIgnored).toBe(true)
    })

    it("should fail to decrypt with the wrong passphrase", async () => {
        const encrypted = await encryptAccount(mockCred, passphrase)

        await expect(decryptAccount(encrypted, "wrong-passphrase")).rejects.toThrow("Decryption failed. Invalid passphrase or corrupted vault.")
    })

    it("should produce different ciphertexts for the same payload due to secure IVs/Salts", async () => {
        const encrypted1 = await encryptAccount(mockCred, passphrase)
        const encrypted2 = await encryptAccount(mockCred, passphrase)

        expect(encrypted1.cipherText).not.toBe(encrypted2.cipherText)
        expect(encrypted1.iv).not.toBe(encrypted2.iv)
        expect(encrypted1.salt).not.toBe(encrypted2.salt)
    })
})
