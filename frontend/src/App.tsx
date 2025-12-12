import { useState } from 'react';
import CampaignList from './components/CampaignList';
import CampaignForm from './components/CampaignForm';
import { LayoutDashboard } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

function App() {
  const [view, setView] = useState('list'); // 'list' | 'form'

  return (
    <div>
      <div className="bg-gradient-mesh"></div>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      />
      
      <header className="glass-header sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div 
             className="flex items-center gap-3 cursor-pointer group" 
             onClick={() => setView('list')}
          >
             <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg text-white shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <LayoutDashboard size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold tracking-tight">Pathik AI</h1>
                <p className="text-xs text-text-secondary font-medium">Ads Manager</p>
             </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             <div className="text-xs font-mono bg-white/5 py-1 px-3 rounded-full border border-white/5 text-text-muted">
               Google Ads API: <span className="text-green-400">Connected</span>
             </div>
             <button className="p-2 relative group md:hidden">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                 GA
               </div>
            </button>
            
            <div className="hidden md:flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
               <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
                 GA
               </div>
               <div className="text-xs">
                 <p className="font-medium">My Ad Account</p>
                 <p className="text-text-muted text-[10px]">123-456-7890</p>
               </div>
               <div className="w-2 h-2 rounded-full bg-green-500 ml-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 relative z-0">
        {view === 'list' && (
          <CampaignList onNewCampaign={() => setView('form')} />
        )}
        
        {view === 'form' && (
          <CampaignForm 
            onCancel={() => setView('list')} 
            onSuccess={() => setView('list')} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
