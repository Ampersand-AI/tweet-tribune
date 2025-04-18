import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute state:', { user, loading, error });
  console.log('ProtectedRoute children:', children);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            An error occurred while checking authentication: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to signin');
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  console.log('User authenticated, rendering protected content');
  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
};

export default ProtectedRoute; 