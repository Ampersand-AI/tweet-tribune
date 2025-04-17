import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './app/context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRoutes from './app/routes';
import { ThemeProvider } from './app/context/ThemeContext';
import { ThemeProvider as NextThemeProvider } from 'next-themes';

function App() {
  return (
    <ErrorBoundary>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <AppRoutes />
              <Toaster position="top-right" />
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </NextThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
