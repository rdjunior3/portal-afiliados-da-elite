import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DebugInfoProps {
  show?: boolean;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ show = false }) => {
  const { user, session, loading, profile } = useAuth();

  if (!show) return null;

  const urlInfo = {
    href: window.location.href,
    origin: window.location.origin,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  };

  const authInfo = {
    hasUser: !!user,
    hasSession: !!session,
    hasProfile: !!profile,
    loading,
    userId: user?.id,
    email: user?.email,
    provider: user?.app_metadata?.provider,
    role: profile?.role
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg max-w-md max-h-96 overflow-auto text-xs z-50">
      <h3 className="font-bold text-orange-400 mb-2">🔍 Debug Info</h3>
      
      <div className="mb-3">
        <h4 className="font-semibold text-green-400">URL Info:</h4>
        <pre className="text-gray-300">{JSON.stringify(urlInfo, null, 1)}</pre>
      </div>
      
      <div className="mb-3">
        <h4 className="font-semibold text-blue-400">Auth State:</h4>
        <pre className="text-gray-300">{JSON.stringify(authInfo, null, 1)}</pre>
      </div>
      
      {session && (
        <div>
          <h4 className="font-semibold text-purple-400">Session Info:</h4>
          <pre className="text-gray-300">
            {JSON.stringify({
              expires_at: session.expires_at,
              token_type: session.token_type,
              user_metadata: session.user?.user_metadata,
              app_metadata: session.user?.app_metadata
            }, null, 1)}
          </pre>
        </div>
      )}
    </div>
  );
}; 