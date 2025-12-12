import { useState, useEffect } from 'react';
import { Plus, Layers, ArrowLeft, Edit2, Trash2, PlayCircle, PauseCircle, ExternalLink, Target, DollarSign } from 'lucide-react';
import { getAdGroups, deleteAdGroup, pauseAdGroup, enableAdGroup } from '../api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AdGroup, Campaign } from '../types';

interface AdGroupListProps {
  campaign: Campaign;
  onBack: () => void;
  onNewAdGroup: () => void;
  onEditAdGroup: (adGroup: AdGroup) => void;
}

export default function AdGroupList({ campaign, onBack, onNewAdGroup, onEditAdGroup }: AdGroupListProps) {
  const [adGroups, setAdGroups] = useState<AdGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchAdGroups();
  }, [campaign.id]);

  const fetchAdGroups = async () => {
    try {
      setLoading(true);
      const response = await getAdGroups(campaign.id);
      setAdGroups(response.data);
    } catch {
      toast.error("Failed to fetch ad groups");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad group?')) return;
    
    setProcessing(id);
    try {
      await deleteAdGroup(id);
      toast.success('Ad group deleted');
      fetchAdGroups();
    } catch {
      toast.error('Failed to delete ad group');
    } finally {
      setProcessing(null);
    }
  };

  const handleToggleStatus = async (adGroup: AdGroup) => {
    setProcessing(adGroup.id);
    try {
      if (adGroup.status === 'ENABLED') {
        await pauseAdGroup(adGroup.id);
        toast.success('Ad group paused');
      } else {
        await enableAdGroup(adGroup.id);
        toast.success('Ad group enabled');
      }
      fetchAdGroups();
    } catch {
      toast.error('Failed to update ad group status');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-text-secondary">Loading ad groups...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-20">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          Back to Campaigns
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                <Layers size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-text-muted uppercase tracking-wider">Campaign</p>
                <h2 className="text-2xl font-bold">{campaign.name}</h2>
              </div>
            </div>
            <p className="text-text-secondary text-sm">
              Manage ad groups for this campaign • {campaign.objective} • ${campaign.daily_budget}/day
            </p>
          </div>
          
          <button onClick={onNewAdGroup} className="btn btn-primary">
            <Plus size={18} /> New Ad Group
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <Layers className="text-blue-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Total Ad Groups</p>
            <p className="text-2xl font-bold">{adGroups.length}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg">
            <PlayCircle className="text-green-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Active</p>
            <p className="text-2xl font-bold">{adGroups.filter(ag => ag.status === 'ENABLED').length}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <PauseCircle className="text-yellow-400" size={20} />
          </div>
          <div>
            <p className="text-sm text-text-secondary">Paused</p>
            <p className="text-2xl font-bold">{adGroups.filter(ag => ag.status === 'PAUSED').length}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      {adGroups.length === 0 ? (
        <div className="card text-center py-20 border-dashed border-2 border-slate-700 bg-slate-900/20">
          <div className="inline-block p-4 rounded-full bg-slate-800 mb-4">
            <Layers size={32} className="text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No ad groups yet</h3>
          <p className="text-text-secondary mb-6">Create your first ad group to organize your ads within this campaign.</p>
          <button onClick={onNewAdGroup} className="btn btn-primary">Create Ad Group</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {adGroups.map((adGroup, i) => (
              <motion.div
                key={adGroup.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.05 }}
                className="card p-5 flex flex-col group hover:-translate-y-1 relative"
              >
                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-purple-500/10 p-2 rounded-lg">
                    <Layers size={18} className="text-purple-400" />
                  </div>
                  <StatusBadge status={adGroup.status} />
                </div>

                {/* Name */}
                <h3 className="font-semibold text-lg mb-2 truncate group-hover:text-purple-400 transition-colors">
                  {adGroup.name}
                </h3>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {adGroup.cpc_bid && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <DollarSign size={14} />
                      <span>CPC: ${adGroup.cpc_bid}</span>
                    </div>
                  )}
                  {adGroup.target_audience && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Target size={14} />
                      <span className="truncate">{adGroup.target_audience}</span>
                    </div>
                  )}
                </div>

                {/* Keywords Preview */}
                {adGroup.keywords && (
                  <div className="mb-4">
                    <p className="text-xs text-text-muted mb-1">Keywords</p>
                    <div className="flex flex-wrap gap-1">
                      {adGroup.keywords.split(',').slice(0, 3).map((kw, idx) => (
                        <span key={idx} className="text-xs bg-slate-700/50 px-2 py-0.5 rounded-full text-text-secondary">
                          {kw.trim()}
                        </span>
                      ))}
                      {adGroup.keywords.split(',').length > 3 && (
                        <span className="text-xs text-text-muted">+{adGroup.keywords.split(',').length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Ad Preview */}
                {adGroup.ad_headline && (
                  <div className="bg-slate-900/40 p-3 rounded-lg border border-white/5 mb-4">
                    <p className="text-xs text-text-muted mb-1">Ad Preview</p>
                    <p className="text-blue-400 text-sm font-medium truncate">{adGroup.ad_headline}</p>
                    {adGroup.ad_description && (
                      <p className="text-xs text-text-secondary truncate mt-1">{adGroup.ad_description}</p>
                    )}
                    {adGroup.final_url && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                        <ExternalLink size={10} />
                        <span className="truncate">{adGroup.display_url || adGroup.final_url}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditAdGroup(adGroup)}
                      className="p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(adGroup.id)}
                      disabled={processing === adGroup.id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(adGroup)}
                    disabled={processing === adGroup.id}
                    className={`btn text-xs py-2 px-3 ${
                      adGroup.status === 'ENABLED'
                        ? 'btn-secondary border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                        : 'btn-primary'
                    }`}
                  >
                    {processing === adGroup.id ? '...' : (
                      adGroup.status === 'ENABLED' ? (
                        <><PauseCircle size={14} /> Pause</>
                      ) : (
                        <><PlayCircle size={14} /> Enable</>
                      )
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let styleClass = 'status-badge';
  let dotColor = 'bg-slate-400';
  let label = status;

  if (status === 'ENABLED') {
    styleClass += ' status-published';
    dotColor = 'bg-green-400';
    label = 'Active';
  } else if (status === 'PAUSED') {
    styleClass += ' status-draft';
    dotColor = 'bg-yellow-500';
  } else if (status === 'REMOVED') {
    styleClass += ' status-draft';
    dotColor = 'bg-red-500';
  }

  return (
    <span className={styleClass}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
}
