import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import TweetAnalysis from "@/pages/TweetAnalysis";
import Analytics from "@/pages/Analytics";
import Schedule from "@/pages/Schedule";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import SocialCredentials from "@/pages/SocialCredentials";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { cn } from "@/lib/utils";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            <div className="relative">
              <Sidebar />
              <main className="pl-16 lg:pl-64 min-h-screen">
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/sign-in" element={<SignIn />} />
                    <Route path="/sign-up" element={<SignUp />} />
                    <Route
                      path="/"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <Dashboard />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analysis"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <TweetAnalysis />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <Analytics />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/schedule"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <Schedule />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <History />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <Settings />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/social-credentials"
                      element={
                        <ProtectedRoute>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="p-6"
                          >
                            <SocialCredentials />
                          </motion.div>
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </AnimatePresence>
              </main>
            </div>
          </div>
          <Toaster position="top-right" richColors />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
