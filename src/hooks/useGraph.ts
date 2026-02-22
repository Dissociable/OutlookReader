import { useState, useCallback } from "react"
import { useVaultStore } from "@/store/vaultStore"
import {
    fetchInbox,
    fetchMessageDetail,
    exchangeRefreshToken,
    type InboxResponse,
    type MessageDetail,
} from "@/lib/graph"
import { toast } from "sonner"
let globalRefreshPromise: Promise<string | null> | null = null

export function useGraph() {
    const { activeAccountId, decryptedAccounts } = useVaultStore()
    const [activeAccessToken, setActiveAccessToken] = useState<string | null>(null)

    // Retrieves the valid access token, refreshing if necessary
    const getValidToken = useCallback(async (forceRefresh = false): Promise<string | null> => {
        if (!activeAccountId) return null
        const account = decryptedAccounts[activeAccountId]
        if (!account) return null

        // If we already have a session token, return it (optimistic path)
        if (!forceRefresh && activeAccessToken) return activeAccessToken

        if (globalRefreshPromise) {
            const token = await globalRefreshPromise
            if (token) setActiveAccessToken(token)
            return token
        }

        globalRefreshPromise = exchangeRefreshToken(account).then(resp => {
            return resp.accessToken
        }).catch(err => {
            console.error("Token exchange failed", err)
            return null
        })

        const token = await globalRefreshPromise
        globalRefreshPromise = null

        if (token) {
            setActiveAccessToken(token)
        } else {
            toast.error("Session expired. Please re-authenticate your account.")
        }
        return token
    }, [activeAccountId, decryptedAccounts, activeAccessToken])

    // Wrapper for any graph fetch that handles 401 token expiration
    const graphCallWithRetry = useCallback(
        async <T>(fetcherFn: (token: string) => Promise<T>): Promise<T | null> => {
            let token = await getValidToken()
            if (!token) return null

            try {
                return await fetcherFn(token)
            } catch (err: any) {
                if (err.message === "UNAUTHORIZED_ACCESS_TOKEN") {
                    // Token expired mid-session.
                    // Pass `true` to forceRefresh because the closure `activeAccessToken` is still populated.
                    setActiveAccessToken(null)
                    token = await getValidToken(true)
                    if (!token) return null

                    return await fetcherFn(token)
                }

                if (err.message && err.message.startsWith("GRAPH_RATE_LIMIT")) {
                    const retrySecs = err.message.split(":")[1]
                    toast.error(`Microsoft Graph Rate Limit Hit. Please wait ${retrySecs} seconds.`)
                    throw err
                }

                toast.error(err.message || "Failed to fetch from Microsoft Graph")
                throw err
            }
        },
        [getValidToken]
    )

    const getInbox = useCallback(
        async (nextLink?: string): Promise<InboxResponse | null> => {
            return graphCallWithRetry((token) => fetchInbox(token, nextLink))
        },
        [graphCallWithRetry]
    )

    const getMessageDetail = useCallback(
        async (messageId: string): Promise<MessageDetail | null> => {
            return graphCallWithRetry((token) => fetchMessageDetail(token, messageId))
        },
        [graphCallWithRetry]
    )

    const resetSession = useCallback(() => {
        setActiveAccessToken(null)
    }, [])

    return {
        getInbox,
        getMessageDetail,
        resetSession,
        hasActiveAccount: !!activeAccountId
    }
}
