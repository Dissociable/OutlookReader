import type { ParsedCredential } from "./validation"

export interface EncryptedAccountRecord {
  id: string
  email: string
  clientId: string
  cipherText: string // base64
  iv: string // base64
  salt: string // base64
  createdAt: number
  updatedAt: number
}

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// Convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

const getPasswordKey = async (password: string): Promise<CryptoKey> => {
  const enc = new TextEncoder()
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  )
}

const deriveKey = async (passwordKey: CryptoKey, salt: Uint8Array): Promise<CryptoKey> => {
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

export async function encryptAccount(
  record: ParsedCredential,
  passphrase: string
): Promise<EncryptedAccountRecord> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16))
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const passwordKey = await getPasswordKey(passphrase)
  const aesKey = await deriveKey(passwordKey, salt)

  const enc = new TextEncoder()
  const encodedContent = enc.encode(JSON.stringify(record))

  const encryptedContent = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    aesKey,
    encodedContent
  )

  return {
    id: window.crypto.randomUUID(),
    email: record.email,
    clientId: record.clientId,
    cipherText: bufferToBase64(encryptedContent),
    iv: bufferToBase64(iv.buffer),
    salt: bufferToBase64(salt.buffer),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

export async function decryptAccount(
  record: EncryptedAccountRecord,
  passphrase: string
): Promise<ParsedCredential> {
  const salt = new Uint8Array(base64ToBuffer(record.salt))
  const iv = new Uint8Array(base64ToBuffer(record.iv))
  const cipherText = base64ToBuffer(record.cipherText)

  const passwordKey = await getPasswordKey(passphrase)
  const aesKey = await deriveKey(passwordKey, salt)

  try {
    const decryptedContent = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      aesKey,
      cipherText
    )

    const dec = new TextDecoder()
    const jsonStr = dec.decode(decryptedContent)
    return JSON.parse(jsonStr) as ParsedCredential
  } catch (e) {
    throw new Error("Decryption failed. Invalid passphrase or corrupted vault.")
  }
}
