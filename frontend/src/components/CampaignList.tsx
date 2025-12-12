import { useState, useEffect, MouseEvent } from 'react';
import { Plus, Rocket, CheckCircle, DollarSign, LayoutGrid, List as ListIcon, BarChart3, PauseCircle, TrendingUp } from 'lucide-react';
import { getCampaigns, publishCampaign, pauseCampaign } from '../api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Campaign } from '../types';

interface CampaignListProps {
  onNewCampaign: () => void;
}

export default function CampaignList({ onNewCampaign }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null); 
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); 

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await getCampaigns();
      setCampaigns(response.data);
    } catch {
      toast.error("Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (id: string, e?: MouseEvent) => {
    if(e) e.stopPropagation();
    setProcessing(id);
    const promise = publishCampaign(id);
    
    toast.promise(promise, {
      loading: 'Connecting to Google Ads...',
      success: 'Campaign Published Successfully!',
      error: (err: any) => `Failed: ${err.response?.data?.error || 'Unknown error'}`
    });

    try {
      await promise;
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
      fetchCampaigns();
    } catch {
       // Handled by toast
    } finally {
      setProcessing(null);
    }
  };

   const handleDisable = async (id: string, e?: MouseEvent) => {
    if(e) e.stopPropagation();
    setProcessing(id);
    
    // We reuse the pause endpoint as "Disable" for this assignment
    const promise = pauseCampaign(id);
    toast.promise(promise, {
      loading: 'Disabling campaign...',
      success: 'Campaign Disabled',
      error: 'Failed to disable campaign'
    });

    try {
      await promise;
      fetchCampaigns();
    } catch {
      // Handled by toast
    } finally {
        setProcessing(null);
    }
  };

  // Stats
  const totalSpend = campaigns.reduce((acc, c) => acc + (c.daily_budget || 0), 0);
  const activeCount = campaigns.filter(c => c.status === 'PUBLISHED').length;
  
  // Calculate Avg ROAS for active campaigns
  const activeCampaigns = campaigns.filter(c => c.roas !== undefined && c.roas > 0);
  const avgRoas = activeCampaigns.length > 0 
    ? (activeCampaigns.reduce((acc, c) => acc + (c.roas || 0), 0) / activeCampaigns.length).toFixed(2)
    : '0.00';

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-text-secondary">Loading your workspace...</p>
    </div>
  );

  return (
    <div className="animate-fade-in pb-20">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatsCard 
          icon={<BarChart3 />} 
          title="Total Campaigns" 
          value={campaigns.length} 
          sub="All time"
        />
        <StatsCard 
          icon={<CheckCircle className="text-success" />} 
          title="Active (Published)" 
          value={activeCount} 
          sub="Running on Google Ads"
        />
        <StatsCard 
          icon={<DollarSign className="text-warning" />} 
          title="Total Daily Budget" 
          value={`$${totalSpend.toLocaleString()}`} 
          sub="Projected daily spend"
        />
         <StatsCard 
          icon={<TrendingUp className="text-blue-400" />} 
          title="Avg. ROAS" 
          value={`${avgRoas}x`} 
          sub="Return on Ad Spend"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Campaigns</h2>
          <p className="text-text-secondary text-sm">Manage and track your Google Ads campaigns</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="bg-slate-800/50 p-1 rounded-lg border border-white/10 flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                 onClick={() => setViewMode('list')}
                 className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <ListIcon size={18} />
              </button>
           </div>
           
           <button onClick={onNewCampaign} className="btn btn-primary">
            <Plus size={18} /> New Campaign
           </button>
        </div>
      </div>

      {/* Content */}
      {campaigns.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-2 border-slate-700 bg-slate-900/20">
          <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
             <Rocket size={32} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No campaigns yet</h3>
          <p className="text-text-secondary mb-6">Create your first campaign to get started with Google Ads.</p>
          <button onClick={onNewCampaign} className="btn btn-primary">Create Campaign</button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((camp, i) => (
                  <CampaignCard 
                    key={camp.id} 
                    campaign={camp} 
                    onPublish={handlePublish}
                    onDisable={handleDisable}
                    processingId={processing}
                    index={i}
                  />
                ))}
             </div>
          ) : (
            <div className="card overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-800/50 text-xs uppercase text-text-secondary">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Budget</th>
                      <th className="p-4">Clicks</th>
                      <th className="p-4">Cost</th>
                      <th className="p-4">ROAS</th>
                      <th className="p-4">Google ID</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {campaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{camp.name}</td>
                        <td className="p-4">
                           <StatusBadge status={camp.status} />
                        </td>
                        <td className="p-4 text-text-secondary">${camp.daily_budget}</td>
                        <td className="p-4 text-text-secondary">{camp.clicks?.toLocaleString() || '-'}</td>
                        <td className="p-4 text-text-secondary">{camp.cost ? `$${camp.cost}` : '-'}</td>
                        <td className="p-4">
                           {camp.roas ? (
                              <span className={`font-mono font-bold ${camp.roas >= 4 ? 'text-green-400' : camp.roas >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {camp.roas}x
                              </span>
                           ) : '-'}
                        </td>
                        <td className="p-4 font-mono text-xs text-text-secondary">
                          {camp.google_campaign_id || '-'}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                           {camp.status === 'DRAFT' && (
                              <button 
                                onClick={(e) => handlePublish(camp.id, e)}
                                disabled={processing === camp.id}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                              >
                                {processing === camp.id ? '...' : 'Publish'}
                              </button>
                           )}
                           {camp.status === 'PUBLISHED' && (
                              <button 
                                onClick={(e) => handleDisable(camp.id, e)}
                                disabled={processing === camp.id}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                {processing === camp.id ? '...' : 'Disable'}
                              </button>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  sub: string;
}

function StatsCard({ icon, title, value, sub }: StatsCardProps) {
  return (
    <div className="card p-6 flex items-start gap-4">
       <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-slate-300">
         {icon}
       </div>
       <div>
          <p className="text-sm text-text-secondary font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-white">{value}</h3>
          <p className="text-xs text-text-muted mt-1">{sub}</p>
       </div>
    </div>
  )
}

interface CampaignCardProps {
  campaign: Campaign;
  onPublish: (id: string, e?: MouseEvent) => void;
  onDisable: (id: string, e?: MouseEvent) => void;
  processingId: string | null;
  index: number;
}

function CampaignCard({ campaign, onPublish, onDisable, processingId, index }: CampaignCardProps) {
  const isProcessing = processingId === campaign.id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card p-5 flex flex-col h-full group hover:-translate-y-1 relative overflow-hidden"
    >
      {/* Background Glow for High ROAS */}
      {campaign.roas && campaign.roas > 5 && (
         <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/10 blur-3xl rounded-full pointer-events-none"></div>
      )}

      <div className="flex justify-between items-start mb-4">
         <div className="bg-blue-500/10 p-2 rounded-lg">
            <Rocket size={20} className="text-blue-400" />
         </div>
         <StatusBadge status={campaign.status} />
      </div>

      <h3 className="font-semibold text-lg mb-1 truncate text-white group-hover:text-blue-400 transition-colors">
        {campaign.name}
      </h3>
      <p className="text-text-secondary text-sm mb-4 line-clamp-2">
        {campaign.objective} • {campaign.campaign_type}
      </p>

      {/* Mini Stats Grid */}
      {campaign.status !== 'DRAFT' && (
        <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-900/40 p-2 rounded-lg border border-white/5">
           <div className="text-center">
              <p className="text-[10px] text-text-muted uppercase mb-0.5">Clicks</p>
              <p className="font-bold text-sm">{campaign.clicks?.toLocaleString() || 0}</p>
           </div>
           <div className="text-center border-l border-white/5">
              <p className="text-[10px] text-text-muted uppercase mb-0.5">Cost</p>
              <p className="font-bold text-sm">${campaign.cost || 0}</p>
           </div>
           <div className="text-center border-l border-white/5">
              <p className="text-[10px] text-text-muted uppercase mb-0.5">ROAS</p>
              <p className={`font-bold text-sm ${campaign.roas && campaign.roas >= 3 ? 'text-green-400' : 'text-white'}`}>
                 {campaign.roas || 0}x
              </p>
           </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
         <div className="mr-2">
            <p className="text-xs text-text-muted">Daily Budget</p>
            <p className="font-medium font-mono">${campaign.daily_budget}</p>
         </div>
         
         <div className="flex gap-2">
           {campaign.status === 'DRAFT' && (
             <button 
               onClick={(e) => onPublish(campaign.id, e)}
               disabled={isProcessing}
               className="btn btn-primary text-xs py-2 px-4 shadow-none min-w-[80px]"
             >
               {isProcessing ? '...' : 'Publish'}
             </button>
           )}
           {campaign.status === 'PUBLISHED' && (
             <button 
               onClick={(e) => onDisable(campaign.id, e)}
               disabled={isProcessing}
               className="btn btn-secondary text-xs py-2 px-3 shadow-none border-red-500/30 text-red-400 hover:bg-red-500/10 min-w-[80px]"
             >
                {isProcessing ? '...' : <> <PauseCircle size={14} /> Disable </>}
             </button>
           )}
           {campaign.status === 'PAUSED' && (
             <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Disabled</span>
           )}
         </div>
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  let styleClass = 'status-draft';
  let dotColor = 'bg-slate-400';

  if (status === 'PUBLISHED') {
    styleClass = 'status-published';
    dotColor = 'bg-green-400';
  } else if (status === 'PAUSED') {
    styleClass = 'status-draft'; 
    dotColor = 'bg-yellow-500';
  }

  return (
    <span className={`status-badge ${styleClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  )
}
