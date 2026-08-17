import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/Layout/Sidebar';
import Header from '@/components/Layout/Header';
import Dashboard from '@/pages/Dashboard';
import Organisations from '@/pages/Organisations';
import Visitors from '@/pages/Visitors';
import Visits from '@/pages/Visits';

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/org" element={<Organisations />} />
              <Route path="/visitors" element={<Visitors />} />
              <Route path="/visits" element={<Visits />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;