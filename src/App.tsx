import { Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/toaster';
import { LoadingScreen } from './components/ui/loading';

function App() {
  // O AuthProvider já está no main.tsx, então usamos o hook aqui
  const { loading } = useAuth();

  // Enquanto o AuthContext verifica a sessão, mostramos uma tela de loading global
  if (loading) {
    return <LoadingScreen message="Carregando sessão..." />;
  }

  // Após a verificação, o restante da aplicação é renderizado
  return (
    <div className="App">
      <Outlet />
      <Toaster />
    </div>
  );
}

export default App;
