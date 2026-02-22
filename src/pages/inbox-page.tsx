import { useEffect, useState } from "react"
import { useGraph } from "@/hooks/useGraph"
import { useVaultStore } from "@/store/vaultStore"
import type { InboxResponse } from "@/lib/graph"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCcw, MailX, Inbox, Search } from "lucide-react"
import { isToday } from "date-fns"
import { Link, Outlet, useParams, useLocation } from "react-router-dom"

export function InboxPage() {
    const { isLocked, activeAccountId, accounts } = useVaultStore()
    const { getInbox, hasActiveAccount } = useGraph()
    const { id: selectedMessageId } = useParams()
    const location = useLocation()

    const [data, setData] = useState<InboxResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")

    const filteredMessages = data?.messages.filter(msg => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return msg.subject.toLowerCase().includes(q) || msg.from.toLowerCase().includes(q)
    })

    const loadInbox = async (nextLink?: string) => {
        setLoading(true)
        setError(null)
        try {
            const resp = await getInbox(nextLink)
            if (resp) {
                if (nextLink && data) {
                    setData({ messages: [...data.messages, ...resp.messages], nextLink: resp.nextLink })
                } else {
                    setData(resp)
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to load inbox")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isLocked && hasActiveAccount) {
            loadInbox()
        } else {
            setData(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLocked, activeAccountId, hasActiveAccount])

    // CSS media queries handle responsiveness natively now.

    if (isLocked || !hasActiveAccount || accounts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-muted/10 w-full">
                {isLocked ? <ShieldIcon /> : <MailX className="w-12 h-12 text-muted-foreground opacity-50 mb-4" />}
                <h2 className="text-2xl font-semibold mt-4 tracking-tight">{isLocked ? "Vault is Locked" : "No Active Account"}</h2>
                <p className="text-muted-foreground mt-2 max-w-sm">
                    {isLocked ? "Please unlock your vault in the sidebar to view your inbox." : "Import or select an account from the vault to view emails."}
                </p>
            </div>
        )
    }

    return (
        <div className="flex w-full h-full overflow-hidden bg-background">
            {/* Inbox List (Pane 2) */}
            <div className={`flex flex-col shrink-0 border-r border-border/50 bg-background/95 w-full lg:w-[320px] xl:w-[380px] transition-all duration-300 ${selectedMessageId ? "hidden lg:flex" : "flex"}`}>
                <header className="flex flex-col p-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10 shrink-0 gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight leading-none">Inbox</h1>
                            <span className="text-[10px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">
                                {data?.messages.length || 0} messages
                            </span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => loadInbox()} disabled={loading} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    {data && data.messages.length > 0 && (
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Search sender or subject..."
                                className="w-full bg-background/60 pl-9 h-8 text-xs rounded-full border-border/60 focus-visible:ring-1"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {error && (
                        <div className="m-4 p-3 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {loading && !data && (
                        <div className="p-2 space-y-1">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-3 rounded-xl border border-transparent">
                                    <div className="flex justify-between mb-2">
                                        <Skeleton className="h-4 w-1/2" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
                                    <Skeleton className="h-4 w-3/4 mb-2" />
                                    <Skeleton className="h-3 w-full" />
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && data?.messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                            <Inbox className="w-10 h-10 opacity-20 mb-3" />
                            <p className="text-sm font-medium">All caught up!</p>
                        </div>
                    )}

                    <div className="p-2 space-y-0.5">
                        {filteredMessages?.map((msg) => {
                            const isSelected = selectedMessageId === msg.id
                            const date = new Date(msg.receivedDateTime)
                            const timeString = isToday(date) ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString([], { month: 'short', day: 'numeric' })

                            return (
                                <Link to={`/inbox/${msg.id}`} key={msg.id} className="block group">
                                    <div className={`relative p-3 rounded-xl transition-all duration-200 border ${isSelected ? 'bg-primary/10 border-primary/20 shadow-sm' : 'bg-transparent border-transparent hover:bg-accent/50'}`}>

                                        {/* Unread Indicator */}
                                        {!msg.isRead && (
                                            <div className="absolute left-2 top-4 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                                        )}

                                        <div className="flex flex-col pl-3">
                                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                                <span className={`text-sm truncate font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                                    {msg.from}
                                                </span>
                                                <span className={`text-[10px] whitespace-nowrap font-medium ${isSelected ? 'text-primary/70' : 'text-muted-foreground'}`}>
                                                    {timeString}
                                                </span>
                                            </div>

                                            <span className={`text-sm truncate mb-1 ${!msg.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                {msg.subject}
                                            </span>

                                            <span className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                                {msg.bodyPreview}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {data?.nextLink && (
                        <div className="p-4 flex justify-center border-t border-border/10 mt-2">
                            <Button variant="secondary" size="sm" onClick={() => loadInbox(data.nextLink)} disabled={loading} className="w-full max-w-[200px] rounded-full text-xs font-semibold h-8">
                                {loading ? "Loading..." : "Load Older Messages"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Detail (Pane 3) */}
            {selectedMessageId ? (
                <div className="flex-1 flex-col h-full bg-background/50 relative flex min-w-0 z-10 w-full overflow-hidden">
                    <Outlet key={location.pathname} />
                </div>
            ) : (
                <div className="flex-1 hidden lg:flex flex-col items-center justify-center h-full bg-muted/5 min-w-0 z-10 w-full">
                    <div className="text-center p-8 max-w-sm">
                        <MailX className="w-16 h-16 text-muted-foreground opacity-20 mx-auto mb-6" />
                        <h3 className="text-xl font-semibold tracking-tight text-foreground/80">No message selected</h3>
                        <p className="text-sm text-muted-foreground mt-2">Select a message from the inbox on the left to read its contents.</p>
                    </div>
                </div>
            )}
        </div>
    )
}

function ShieldIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground opacity-50"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
    )
}
