import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { decryptAccount, encryptAccount, type EncryptedAccountRecord } from "@/lib/crypto"
import { parseCredentialString, type ParsedCredential } from "@/lib/validation"

interface VaultState {
    isLocked: boolean
    hasVault: boolean
    isEphemeral: boolean
    accounts: EncryptedAccountRecord[]
    activeAccountId: string | null

    // Decrypted session state (never persisted)
    decryptedAccounts: Record<string, ParsedCredential>

    // Actions
    initializeVault: (passphrase: string, ephemeral?: boolean) => Promise<boolean>
    unlockVault: (passphrase: string) => Promise<boolean>
    lockVault: () => void
    addAccount: (credentialString: string, passphrase: string) => Promise<void>
    removeAccount: (accountId: string) => void
    setActiveAccount: (accountId: string) => void
}

export const useVaultStore = create<VaultState>()(
    persist(
        (set, get) => ({
            isLocked: true,
            hasVault: false,
            isEphemeral: false,
            accounts: [],
            activeAccountId: null,
            decryptedAccounts: {},

            initializeVault: async (_passphrase: string, ephemeral = false) => {
                // Just sets flags, actual encryption happens when adding accounts
                // We verify the passphrase by attempting to decrypt when unlocking later
                // For initialization, we just start fresh or consider it unlocked if empty
                set({ isLocked: false, hasVault: true, isEphemeral: ephemeral })
                return true
            },

            unlockVault: async (passphrase: string) => {
                const { accounts } = get()
                if (accounts.length === 0) {
                    set({ isLocked: false })
                    return true
                }

                try {
                    const decrypted: Record<string, ParsedCredential> = {}
                    for (const acc of accounts) {
                        decrypted[acc.id] = await decryptAccount(acc, passphrase)
                    }
                    set({ isLocked: false, decryptedAccounts: decrypted })
                    return true
                } catch (e) {
                    return false
                }
            },

            lockVault: () => {
                // Secure memory wipe of decrypted accounts
                set({ isLocked: true, decryptedAccounts: {}, activeAccountId: null })
            },

            addAccount: async (credentialString: string, passphrase: string) => {
                if (get().isLocked) throw new Error("Vault is locked")

                const parsed = parseCredentialString(credentialString)
                const encrypted = await encryptAccount(parsed, passphrase)

                set((state) => ({
                    hasVault: true,
                    accounts: [...state.accounts, encrypted],
                    decryptedAccounts: { ...state.decryptedAccounts, [encrypted.id]: parsed },
                    activeAccountId: encrypted.id
                }))
            },

            removeAccount: (accountId: string) => {
                set((state) => {
                    const newAccounts = state.accounts.filter(a => a.id !== accountId)
                    const newDecrypted = { ...state.decryptedAccounts }
                    delete newDecrypted[accountId]
                    return {
                        accounts: newAccounts,
                        decryptedAccounts: newDecrypted,
                        activeAccountId: state.activeAccountId === accountId
                            ? (newAccounts.length > 0 ? newAccounts[0].id : null)
                            : state.activeAccountId,
                        hasVault: newAccounts.length > 0
                    }
                })
            },

            setActiveAccount: (accountId: string) => set({ activeAccountId: accountId })
        }),
        {
            name: "outlookreader-vault",
            // Only persist encrypted records and flags, NEVER the decrypted session state
            partialize: (state) => ({
                hasVault: state.hasVault,
                isEphemeral: state.isEphemeral,
                accounts: state.accounts,
                activeAccountId: state.activeAccountId
            }),
            storage: createJSONStorage(() => ({
                getItem: (name: string) => {
                    return sessionStorage.getItem(name) || localStorage.getItem(name)
                },
                setItem: (name: string, value: string) => {
                    try {
                        const parsed = JSON.parse(value)
                        if (parsed?.state?.isEphemeral) {
                            sessionStorage.setItem(name, value)
                            // Clean up local storage if it previously existed
                            localStorage.removeItem(name)
                        } else {
                            localStorage.setItem(name, value)
                            sessionStorage.removeItem(name)
                        }
                    } catch {
                        localStorage.setItem(name, value)
                    }
                },
                removeItem: (name: string) => {
                    localStorage.removeItem(name)
                    sessionStorage.removeItem(name)
                }
            }))
        }
    )
)
