import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useGraph } from "@/hooks/useGraph"
import type { MessageDetail } from "@/lib/graph"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import DOMPurify from "dompurify"

export function MessageDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { getMessageDetail } = useGraph()
    const [message, setMessage] = useState<MessageDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<"html" | "source">("html")

    useEffect(() => {
        if (!id) return
        let isMounted = true

        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const msg = await getMessageDetail(id)
                if (isMounted) setMessage(msg)
            } catch (err: any) {
                if (isMounted) setError(err.message || "Failed to load message")
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        load()

        return () => { isMounted = false }
    }, [id, getMessageDetail])

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-background w-full">
                <header className="px-6 py-4 border-b border-border/50 flex items-center gap-4 h-16 shrink-0 bg-background/50 backdrop-blur-md">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="lg:hidden"><ArrowLeft className="w-5 h-5" /></Button>
                    <Skeleton className="w-1/2 max-w-[300px] h-6" />
                </header>
                <div className="p-8 space-y-6 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-4">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="w-48 h-4" />
                            <Skeleton className="w-32 h-3" />
                        </div>
                    </div>
                    <Skeleton className="w-full h-[60vh] rounded-xl" />
                </div>
            </div>
        )
    }

    if (error || !message) {
        return (
            <div className="flex flex-col h-full bg-background p-6 items-center justify-center text-center w-full">
                <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive max-w-md w-full">
                    <h3 className="font-semibold mb-2">Message Unavailable</h3>
                    <p className="text-sm opacity-90 mb-6">{error || "Message not found"}</p>
                    <Button variant="outline" onClick={() => navigate(-1)} className="w-full"><ArrowLeft className="w-4 h-4 mr-2" /> Return to Inbox</Button>
                </div>
            </div>
        )
    }

    // Purify HTML
    const cleanHtml = DOMPurify.sanitize(message.bodyHtmlRaw, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target']
    })

    // Basic initials for avatar
    const initials = message.from.substring(0, 2).toUpperCase()

    return (
        <div className="flex flex-col h-full bg-background w-full shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.1)] z-20">
            {/* Mobile-only back header */}
            <div className="lg:hidden flex items-center sticky top-0 z-20 p-2 border-b border-border/50 bg-background/80 backdrop-blur-xl shrink-0 h-14">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0 gap-1 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" /> Back to Inbox
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar relative w-full h-full bg-background/50">
                <div className="max-w-4xl mx-auto w-full">
                    {/* Header Area */}
                    <div className="px-6 py-8 md:px-10 md:py-10 border-b border-border/30">
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight text-foreground mb-6">
                            {message.subject}
                        </h1>

                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-lg shrink-0">
                                {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                    <span className="truncate text-base font-semibold text-foreground">
                                        {message.from}
                                    </span>
                                </div>
                                {message.toRecipients.length > 0 && (
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <span className="font-medium text-foreground/70">To:</span>
                                        <span className="truncate">{message.toRecipients.join(", ")}</span>
                                    </div>
                                )}
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex bg-muted/40 p-1 rounded-lg shrink-0 self-start sm:self-center ml-auto">
                                <Button
                                    variant={viewMode === "html" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs px-3 shadow-none"
                                    onClick={() => setViewMode("html")}
                                >
                                    Rich Text
                                </Button>
                                <Button
                                    variant={viewMode === "source" ? "secondary" : "ghost"}
                                    size="sm"
                                    className="h-7 text-xs px-3 shadow-none"
                                    onClick={() => setViewMode("source")}
                                >
                                    Raw Source
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Body content */}
                    <div className="px-6 py-8 md:px-10 pb-20">
                        {viewMode === "html" ? (
                            <div
                                className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                             prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                             prose-p:leading-relaxed prose-headings:font-semibold
                             break-words"
                                dangerouslySetInnerHTML={{ __html: cleanHtml }}
                            />
                        ) : (
                            <div className="bg-muted/30 p-4 rounded-xl border border-border/50 overflow-x-auto text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
                                {message.bodyHtmlRaw}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
