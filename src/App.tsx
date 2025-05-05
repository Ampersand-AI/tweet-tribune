import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import TweetAnalysis from "@/pages/TweetAnalysis";
import Analytics from "@/pages/Analytics";
import Post from "@/pages/Post";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import SocialCredentials from "@/pages/SocialCredentials";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import AuthCallback from "@/pages/auth/AuthCallback";
import TwitterCallback from "@/pages/auth/TwitterCallback";
import LinkedInCallback from "@/pages/auth/LinkedInCallback";
import NotFound from "@/pages/NotFound";
import MainLayout from "@/components/layout/MainLayout";

const App = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/sign-in" element={<SignIn />} />
                <Route path="/sign-up" element={<SignUp />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/twitter/callback" element={<TwitterCallback />} />
                <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="post" element={<Post />} />
                  <Route path="analysis" element={<TweetAnalysis />} />
                  <Route path="history" element={<History />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="social-credentials" element={<SocialCredentials />} />
                </Route>
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
