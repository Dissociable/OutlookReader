import { HashRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { AppLayout } from "./layouts/AppLayout"
import { Toaster } from "@/components/ui/sonner"
import { VaultManager } from "./pages/vault-page"
import { InboxPage } from "./pages/inbox-page"
import { MessageDetailPage } from "./pages/message-detail-page"

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="outlookreader-theme">
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/vault" replace />} />
            <Route path="/vault" element={<div className="p-4 md:p-8 h-full overflow-y-auto w-full"><VaultManager /></div>} />
            <Route path="/inbox" element={<InboxPage />}>
              <Route path=":id" element={<MessageDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
