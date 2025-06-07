import { Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from './components/ui/toaster';
import { usePageTracking, usePerformanceMonitoring } from './hooks/useAnalytics';

function App() {
  usePageTracking();
  usePerformanceMonitoring();

  return (
    <QueryProvider>
      <AuthProvider>
        <div className="App">
          <Outlet />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
