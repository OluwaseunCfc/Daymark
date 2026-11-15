
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="app-layout">

      <Sidebar />

      <main className="main-layout">

        <Topbar />

        <Dashboard />

      </main>

    </div>
  );
}

export default App;
