import { describe, it, expect } from "vitest"
import { parseCredentialString } from "./validation"

describe("parseCredentialString", () => {
    it("successfully parses a valid 4-part credential string", () => {
        const input = "test@example.com:password123:eyRefresh123:azure-client-id"
        const result = parseCredentialString(input)

        expect(result.email).toBe("test@example.com")
        expect(result.passwordIgnored).toBe(true)
        expect(result.refreshToken).toBe("eyRefresh123")
        expect(result.clientId).toBe("azure-client-id")
    })

    it("throws an error when string is empty or invalid format", () => {
        expect(() => parseCredentialString("")).toThrow("Invalid credential format. Expected email:password:refresh_token:client_id")
        // Only 3 parts
        expect(() => parseCredentialString("test@example.com:password123:eyRefresh")).toThrow("Invalid credential format. Expected email:password:refresh_token:client_id")
    })

    it("throws an error when email format is invalid", () => {
        expect(() => parseCredentialString("testexample.com:password123:eyRefresh123:azure-client-id")).toThrow("Invalid email format.")
    })

    it("throws an error when token or client ID is too short", () => {
        expect(() => parseCredentialString("test@example.com:password123:short:azure-client-id")).toThrow("Invalid token or client ID length.")
        expect(() => parseCredentialString("test@example.com:password123:eyRefresh123:short")).toThrow("Invalid token or client ID length.")
    })
})
