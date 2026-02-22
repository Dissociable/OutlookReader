import type { ParsedCredential } from "./validation"

export interface TokenResponse {
    accessToken: string
    expiresIn: number
    refreshToken?: string
}

export interface InboxMessage {
    id: string
    subject: string
    from: string
    bodyPreview: string
    receivedDateTime: string
    isRead: boolean
}

export interface InboxResponse {
    messages: InboxMessage[]
    nextLink?: string
}

export interface MessageDetail {
    id: string
    subject: string
    from: string
    toRecipients: string[]
    bodyPreview: string
    bodyHtmlRaw: string
    bodyHtmlSanitized?: string // populated by UI
}

const GRAPH_BASE = import.meta.env.VITE_GRAPH_BASE_URL || "https://graph.microsoft.com/v1.0"
const USE_PROXY = import.meta.env.VITE_USE_OAUTH_PROXY === "true" || (import.meta.env.DEV && import.meta.env.VITE_USE_OAUTH_PROXY !== "false")
const TOKEN_URL = USE_PROXY ? "/api/token" : (import.meta.env.VITE_TOKEN_URL || "https://login.microsoftonline.com/common/oauth2/v2.0/token")

/**
 * Exchanges the refresh token for a new access token.
 * Warning: This endpoint must allow SPA/CORS for the specific Client ID.
 */
export async function exchangeRefreshToken(account: ParsedCredential): Promise<TokenResponse> {
    const body = new URLSearchParams()
    body.append("client_id", account.clientId)
    body.append("grant_type", "refresh_token")
    body.append("refresh_token", account.refreshToken)
    // Ensure we request offline_access to get another refresh token if possible
    body.append("scope", "https://graph.microsoft.com/.default offline_access")

    const res = await fetch(TOKEN_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(`Token exchange failed: ${err.error_description || res.statusText}`)
    }

    const data = await res.json()
    return {
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        refreshToken: data.refresh_token, // typically the same for SPAs unless revoked/rolled
    }
}

/**
 * Helper to fetch with an access token, returning the JSON response.
 */
async function graphFetch(url: string, accessToken: string) {
    const res = await fetch(url, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            Prefer: "outlook.body-content-type=\"html\"" // Ask for HTML bodies in details
        },
    })

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("UNAUTHORIZED_ACCESS_TOKEN")
        }
        if (res.status === 429) {
            const retryAfter = res.headers.get("Retry-After") || 5
            throw new Error(`GRAPH_RATE_LIMIT:${retryAfter}`)
        }
        throw new Error(`Graph API Error: ${res.statusText || res.status}`)
    }

    return res.json()
}

export async function fetchInbox(accessToken: string, nextLink?: string): Promise<InboxResponse> {
    // Inbox query: Get messages, top 20, select specific fields, sort by date descending
    const defaultUrl = `${GRAPH_BASE}/me/messages?$select=id,subject,from,bodyPreview,receivedDateTime,isRead&$top=20&$orderby=receivedDateTime DESC`
    const url = nextLink || defaultUrl

    const data = await graphFetch(url, accessToken)

    const messages: InboxMessage[] = data.value.map((msg: any) => ({
        id: msg.id,
        subject: msg.subject || "(No Subject)",
        from: msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || "Unknown Sender",
        bodyPreview: msg.bodyPreview || "",
        receivedDateTime: msg.receivedDateTime,
        isRead: msg.isRead,
    }))

    return {
        messages,
        nextLink: data["@odata.nextLink"],
    }
}

export async function fetchMessageDetail(accessToken: string, messageId: string): Promise<MessageDetail> {
    const url = `${GRAPH_BASE}/me/messages/${messageId}?$select=id,subject,from,toRecipients,bodyPreview,body`
    const msg = await graphFetch(url, accessToken)

    return {
        id: msg.id,
        subject: msg.subject || "(No Subject)",
        from: msg.from?.emailAddress?.name || msg.from?.emailAddress?.address || "Unknown Sender",
        toRecipients: msg.toRecipients?.map((r: any) => r.emailAddress?.address || "") || [],
        bodyPreview: msg.bodyPreview || "",
        bodyHtmlRaw: msg.body?.content || "",
    }
}
