export interface ParsedCredential {
  email: string
  passwordIgnored: true
  refreshToken: string
  clientId: string
}

export function parseCredentialString(raw: string): ParsedCredential {
  const parts = raw.trim().split(":")
  if (parts.length !== 4) {
    throw new Error("Invalid credential format. Expected email:password:refresh_token:client_id")
  }

  const [email, , refreshToken, clientId] = parts

  if (!email.includes("@")) {
    throw new Error("Invalid email format.")
  }

  if (refreshToken.length < 10 || clientId.length < 10) {
    throw new Error("Invalid token or client ID length.")
  }

  return {
    email,
    passwordIgnored: true,
    refreshToken,
    clientId
  }
}
