import { useState } from "react"
import { useVaultStore } from "@/store/vaultStore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Lock, Unlock, KeyRound, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

export function VaultManager() {
    const { hasVault, isLocked, accounts, initializeVault, unlockVault, lockVault, addAccount, removeAccount } = useVaultStore()
    const [passphrase, setPassphrase] = useState("")
    const [isEphemeral, setIsEphemeral] = useState(false)
    const [newCreds, setNewCreds] = useState("")
    const [loading, setLoading] = useState(false)

    const handleUnlock = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const success = await unlockVault(passphrase)
        setLoading(false)
        if (success) {
            toast.success("Vault unlocked")
        } else {
            toast.error("Incorrect passphrase or corrupted vault")
        }
    }

    const handleInit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (passphrase.length < 4) {
            return toast.error("Passphrase must be at least 4 characters")
        }
        await initializeVault(passphrase, isEphemeral)
        toast.success(isEphemeral
            ? "Ephemeral vault initialized. Data will clear when tab closes."
            : "Vault initialized. You can now add accounts.")
    }

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newCreds.includes(":")) return toast.error("Invalid credential format")
        if (isLocked) return toast.error("Unlock vault first")

        setLoading(true)
        try {
            await addAccount(newCreds, passphrase)
            setNewCreds("")
            toast.success("Account securely encrypted and stored")
        } catch (err: any) {
            toast.error(err.message || "Failed to add account")
        } finally {
            setLoading(false)
        }
    }

    if (isLocked) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-4 md:p-8 relative z-10 overflow-hidden">
                {/* Decorative background effects */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 opacity-70 pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[80px] -z-10 bg-blend-multiply opacity-50 pointer-events-none" />

                <Card className="w-full max-w-sm border-white/10 dark:border-white/5 shadow-2xl bg-background/60 backdrop-blur-2xl overflow-hidden relative">
                    {/* Inner subtle glow line */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

                    <CardHeader className="text-center space-y-3 pb-6 pt-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-primary/20 shadow-inner">
                            {hasVault ? <Shield className="w-8 h-8 text-primary drop-shadow-sm" /> : <KeyRound className="w-8 h-8 text-primary drop-shadow-sm" />}
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">{hasVault ? "Encrypted Vault" : "Initialize Vault"}</CardTitle>
                        <CardDescription className="text-sm font-medium opacity-80 leading-relaxed px-2">
                            {hasVault
                                ? "Enter your master passphrase to decrypt and access your accounts."
                                : "Create a master passphrase. This will be used to encrypt all your credentials locally."}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={hasVault ? handleUnlock : handleInit} className="px-6 pb-8 space-y-6">
                        <div className="relative group">
                            <Input
                                type="password"
                                placeholder="Master Passphrase"
                                value={passphrase}
                                onChange={(e) => setPassphrase(e.target.value)}
                                className="bg-background/40 border-border/50 h-14 text-center text-lg tracking-widest placeholder:tracking-normal placeholder:text-muted-foreground/40 shadow-inner transition-all focus:bg-background/80 focus:ring-1 focus:border-primary/50 rounded-xl"
                                autoFocus
                            />
                            {/* subtle focus ring effect underneath standard input */}
                            <div className="absolute inset-0 -z-10 bg-primary/5 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>

                        {!hasVault && (
                            <div className="flex items-center space-x-2 px-1">
                                <input
                                    type="checkbox"
                                    id="ephemeral"
                                    className="w-4 h-4 rounded border-border/50 bg-background/50 text-primary focus:ring-primary/50"
                                    checked={isEphemeral}
                                    onChange={(e) => setIsEphemeral(e.target.checked)}
                                />
                                <label
                                    htmlFor="ephemeral"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground"
                                >
                                    Session-only mode (Ephemeral)
                                </label>
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-primary/25 transition-all duration-300"
                            disabled={loading || !passphrase}
                        >
                            {loading ? "Processing..." : (hasVault ? <><Unlock className="w-5 h-5 mr-2" /> Unlock Vault</> : <><KeyRound className="w-5 h-5 mr-2" /> Create Vault</>)}
                        </Button>
                    </form>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full h-full p-4 md:p-8 overflow-y-auto bg-background/50 relative z-10 hidden-scrollbar">
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />

            <div className="max-w-3xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/40">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shrink-0">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Vault Manager</h1>
                            <p className="text-sm text-muted-foreground mt-0.5">Your accounts are currently decrypted in memory.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => {
                        lockVault()
                        setPassphrase("")
                        toast.info("Vault locked securely")
                    }} className="shrink-0 rounded-full h-9 px-4 hidden sm:flex">
                        <Lock className="w-4 h-4 mr-2" />
                        Lock Vault
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => {
                        lockVault()
                        setPassphrase("")
                        toast.info("Vault locked securely")
                    }} className="shrink-0 sm:hidden rounded-full">
                        <Lock className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Active Accounts List */}
                    <div className="md:col-span-3 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold tracking-tight">Stored Accounts</h2>
                            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {accounts.length} Total
                            </span>
                        </div>

                        <Card className="border-border/50 shadow-sm overflow-hidden bg-background/60 backdrop-blur-sm">
                            {accounts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                                    <KeyRound className="w-10 h-10 opacity-20 mb-3" />
                                    <p className="text-sm font-medium">No accounts in vault</p>
                                    <p className="text-xs opacity-70 mt-1">Import a credential string to get started.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {accounts.map(acc => (
                                        <div key={acc.id} className="flex items-center justify-between p-4 flex-wrap gap-4 hover:bg-accent/30 transition-colors">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs shrink-0">
                                                    {acc.email.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-medium text-sm truncate">{acc.email}</span>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => removeAccount(acc.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Add Account Sidebar */}
                    <div className="md:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold tracking-tight">Add Account</h2>
                        <Card className="border-border/50 shadow-sm bg-background/60 backdrop-blur-sm">
                            <form onSubmit={handleAddAccount}>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground font-medium mb-2">
                                            Format: <code className="text-[10px] bg-muted px-1 py-0.5 rounded text-foreground">email:password:refresh_token:client_id</code>
                                        </p>
                                        <Input
                                            type="text"
                                            placeholder="Paste credential string..."
                                            value={newCreds}
                                            onChange={(e) => setNewCreds(e.target.value)}
                                            disabled={loading}
                                            className="font-mono text-xs h-10 bg-background/50 border-border/50 shadow-inner"
                                        />
                                    </div>
                                    <Button type="submit" disabled={loading || !newCreds} className="w-full h-10 rounded-xl shadow-sm">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Import & Encrypt
                                    </Button>
                                </CardContent>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
