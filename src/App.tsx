import { Outlet } from 'react-router-dom';
import ProvidersLayout from './layouts/ProvidersLayout';

function App() {
  return (
    <ProvidersLayout>
      <div className="App">
        <Outlet />
      </div>
    </ProvidersLayout>
  );
}

export default App;
