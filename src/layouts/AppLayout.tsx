import { useState, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { Mail, Settings, Shield, WifiOff, Github } from "lucide-react"
import { useVaultStore } from "@/store/vaultStore"

export function AppLayout() {
    const { pathname } = useLocation()
    const { activeAccountId, accounts, setActiveAccount } = useVaultStore()
    const activeAccount = accounts.find(a => a.id === activeAccountId)
    const [isOffline, setIsOffline] = useState(!navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)
        window.addEventListener("online", handleOnline)
        window.addEventListener("offline", handleOffline)
        return () => {
            window.removeEventListener("online", handleOnline)
            window.removeEventListener("offline", handleOffline)
        }
    }, [])

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
                {/* Desktop Sidebar */}
                <Sidebar className="hidden md:flex border-r border-border bg-card">
                    <SidebarHeader className="p-4 flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Mail className="w-6 h-6 text-primary" />
                            <span className="font-semibold text-lg">OutlookReader</span>
                        </div>

                        {/* Account Switcher */}
                        {accounts.length > 0 && (
                            <div className="bg-muted p-2 rounded-md border text-sm flex flex-col gap-1">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Active Account</span>
                                <select
                                    className="w-full bg-transparent border-0 font-medium truncate focus:ring-0 cursor-pointer p-0 text-sm"
                                    value={activeAccountId || ""}
                                    onChange={(e) => setActiveAccount(e.target.value)}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.email}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </SidebarHeader>
                    <SidebarContent className="px-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/inbox"} tooltip="Inbox">
                                    <Link to="/inbox">
                                        <Mail />
                                        <span>Inbox</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive={pathname === "/vault"} tooltip="Vault">
                                    <Link to="/vault">
                                        <Shield />
                                        <span>Vault</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter className="p-4 flex flex-row justify-between items-center bg-muted/20 border-t border-border mt-auto gap-2">
                        <ModeToggle />
                        <div className="flex items-center">
                            <a
                                href="https://github.com/Dissociable/OutlookReader"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <SidebarMenuButton asChild className="w-auto px-2 opacity-50 cursor-not-allowed">
                                <span title="Settings (Coming Soon)"><Settings className="w-4 h-4" /></span>
                            </SidebarMenuButton>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 min-w-0 bg-background h-screen overflow-hidden relative">
                    <header className="flex md:hidden items-center justify-between p-4 border-b border-border bg-card shrink-0">
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            <div className="flex flex-col">
                                <span className="font-semibold leading-none">OutlookReader</span>
                                {activeAccount && <span className="text-[10px] text-muted-foreground mt-1 truncate max-w-[150px]">{activeAccount.email}</span>}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <a
                                href="https://github.com/Dissociable/OutlookReader"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                            >
                                <Github className="w-4 h-4" />
                            </a>
                            <ModeToggle />
                        </div>
                    </header>

                    <main className="flex-1 flex flex-col overflow-hidden relative h-full">
                        {isOffline && (
                            <div className="bg-destructive text-destructive-foreground px-4 py-1.5 text-xs font-medium flex items-center justify-center gap-2 shrink-0 shadow-sm z-50 animate-in slide-in-from-top-2">
                                <WifiOff className="w-3.5 h-3.5" />
                                You are currently offline. Check your internet connection.
                            </div>
                        )}
                        <Outlet />
                    </main>

                    {/* Mobile Bottom Nav */}
                    <nav className="md:hidden flex border-t border-border bg-card pb-safe shrink-0">
                        <Link to="/inbox" className={`flex-1 flex flex-col items-center justify-center py-3 ${pathname === '/inbox' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Mail className="w-5 h-5 mb-1" />
                            <span className="text-[10px] uppercase font-medium">Inbox</span>
                        </Link>
                        <Link to="/vault" className={`flex-1 flex flex-col items-center justify-center py-3 ${pathname === '/vault' ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Shield className="w-5 h-5 mb-1" />
                            <span className="text-[10px] uppercase font-medium">Vault</span>
                        </Link>
                    </nav>
                </div>
            </div>
        </SidebarProvider>
    )
}
