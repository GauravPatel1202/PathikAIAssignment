import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Layers, Target, DollarSign, FileText, Link } from 'lucide-react';
import { createAdGroup, updateAdGroup } from '../api';
import toast from 'react-hot-toast';
import { AdGroup, AdGroupFormData, Campaign } from '../types';

interface AdGroupFormProps {
  campaign: Campaign;
  adGroup?: AdGroup | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const initialFormData: AdGroupFormData = {
  name: '',
  target_audience: '',
  keywords: '',
  cpc_bid: undefined,
  cpm_bid: undefined,
  ad_headline: '',
  ad_headline_2: '',
  ad_headline_3: '',
  ad_description: '',
  ad_description_2: '',
  final_url: '',
  display_url: ''
};

export default function AdGroupForm({ campaign, adGroup, onCancel, onSuccess }: AdGroupFormProps) {
  const [formData, setFormData] = useState<AdGroupFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const isEditing = !!adGroup;

  useEffect(() => {
    if (adGroup) {
      setFormData({
        name: adGroup.name,
        target_audience: adGroup.target_audience || '',
        keywords: adGroup.keywords || '',
        cpc_bid: adGroup.cpc_bid,
        cpm_bid: adGroup.cpm_bid,
        ad_headline: adGroup.ad_headline || '',
        ad_headline_2: adGroup.ad_headline_2 || '',
        ad_headline_3: adGroup.ad_headline_3 || '',
        ad_description: adGroup.ad_description || '',
        ad_description_2: adGroup.ad_description_2 || '',
        final_url: adGroup.final_url || '',
        display_url: adGroup.display_url || ''
      });
    }
  }, [adGroup]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Ad group name is required');
      return;
    }

    setLoading(true);
    
    try {
      if (isEditing && adGroup) {
        await updateAdGroup(adGroup.id, formData);
        toast.success('Ad group updated successfully!');
      } else {
        await createAdGroup(campaign.id, formData);
        toast.success('Ad group created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to save ad group');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndicator = (stepNum: number, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      onClick={() => setStep(stepNum)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        step === stepNum
          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
          : 'text-text-secondary hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );

  return (
    <div className="animate-fade-in pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={onCancel}
          className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          Back to Ad Groups
        </button>
        
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
            <Layers size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Edit Ad Group' : 'Create New Ad Group'}
            </h1>
            <p className="text-text-secondary text-sm">Campaign: {campaign.name}</p>
          </div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {getStepIndicator(1, 'Basic Info', <Layers size={16} />)}
        {getStepIndicator(2, 'Targeting', <Target size={16} />)}
        {getStepIndicator(3, 'Bidding', <DollarSign size={16} />)}
        {getStepIndicator(4, 'Ad Creative', <FileText size={16} />)}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Layers size={20} className="text-purple-400" />
              Basic Information
            </h2>
            
            <div className="form-group">
              <label className="form-label">
                Ad Group Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Brand Keywords - USA"
                className="form-input"
                required
              />
              <p className="text-xs text-text-muted mt-1">Choose a descriptive name for easy identification</p>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="btn btn-primary">
                Next: Targeting
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Targeting */}
        {step === 2 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target size={20} className="text-blue-400" />
              Targeting Options
            </h2>

            <div className="form-group">
              <label className="form-label">Target Audience</label>
              <input
                type="text"
                name="target_audience"
                value={formData.target_audience}
                onChange={handleChange}
                placeholder="e.g., In-market: Software buyers"
                className="form-input"
              />
              <p className="text-xs text-text-muted mt-1">Define your target audience segment</p>
            </div>

            <div className="form-group">
              <label className="form-label">Keywords</label>
              <textarea
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="Enter keywords separated by commas (e.g., marketing software, crm tool, sales automation)"
                className="form-input min-h-[120px]"
                rows={4}
              />
              <p className="text-xs text-text-muted mt-1">
                Keywords trigger your ads. Use commas to separate multiple keywords.
              </p>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn btn-primary">
                Next: Bidding
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Bidding */}
        {step === 3 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign size={20} className="text-green-400" />
              Bidding Strategy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Max CPC Bid ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    type="number"
                    name="cpc_bid"
                    value={formData.cpc_bid ?? ''}
                    onChange={handleChange}
                    placeholder="2.50"
                    className="form-input pl-8"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">Maximum cost per click</p>
              </div>

              <div className="form-group">
                <label className="form-label">Max CPM Bid ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <input
                    type="number"
                    name="cpm_bid"
                    value={formData.cpm_bid ?? ''}
                    onChange={handleChange}
                    placeholder="10.00"
                    className="form-input pl-8"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-text-muted mt-1">Maximum cost per 1000 impressions</p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Tip:</strong> Start with a moderate bid and adjust based on performance data.
              </p>
            </div>

            <div className="flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="btn btn-secondary">
                Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn btn-primary">
                Next: Ad Creative
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Ad Creative */}
        {step === 4 && (
          <div className="card p-6 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText size={20} className="text-orange-400" />
              Ad Creative
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form Fields */}
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Headline 1</label>
                  <input
                    type="text"
                    name="ad_headline"
                    value={formData.ad_headline}
                    onChange={handleChange}
                    placeholder="Get Started Today"
                    className="form-input"
                    maxLength={30}
                  />
                  <p className="text-xs text-text-muted mt-1">{formData.ad_headline?.length || 0}/30 characters</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Headline 2</label>
                  <input
                    type="text"
                    name="ad_headline_2"
                    value={formData.ad_headline_2}
                    onChange={handleChange}
                    placeholder="Free Trial Available"
                    className="form-input"
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Headline 3</label>
                  <input
                    type="text"
                    name="ad_headline_3"
                    value={formData.ad_headline_3}
                    onChange={handleChange}
                    placeholder="Trusted by 10,000+"
                    className="form-input"
                    maxLength={30}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description 1</label>
                  <textarea
                    name="ad_description"
                    value={formData.ad_description}
                    onChange={handleChange}
                    placeholder="Discover how our solution can transform your business..."
                    className="form-input"
                    rows={2}
                    maxLength={90}
                  />
                  <p className="text-xs text-text-muted mt-1">{formData.ad_description?.length || 0}/90 characters</p>
                </div>

                <div className="form-group">
                  <label className="form-label">Description 2</label>
                  <textarea
                    name="ad_description_2"
                    value={formData.ad_description_2}
                    onChange={handleChange}
                    placeholder="Sign up now and get exclusive benefits..."
                    className="form-input"
                    rows={2}
                    maxLength={90}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label flex items-center gap-2">
                    <Link size={14} />
                    Final URL
                  </label>
                  <input
                    type="url"
                    name="final_url"
                    value={formData.final_url}
                    onChange={handleChange}
                    placeholder="https://example.com/landing-page"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display URL Path</label>
                  <input
                    type="text"
                    name="display_url"
                    value={formData.display_url}
                    onChange={handleChange}
                    placeholder="example.com/products"
                    className="form-input"
                  />
                </div>
              </div>

              {/* Ad Preview */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-text-secondary">Ad Preview</h3>
                <div className="bg-white rounded-xl p-4 shadow-xl">
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Ad • {formData.display_url || 'example.com'}</p>
                    <h4 className="text-blue-600 text-lg font-medium leading-tight">
                      {formData.ad_headline || 'Your Headline Here'} | {formData.ad_headline_2 || 'Second Headline'}
                    </h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {formData.ad_description || 'Your ad description will appear here. Write compelling copy to attract clicks.'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-slate-900/50 border border-white/10 rounded-lg p-4">
                  <p className="text-xs text-text-muted mb-2">📱 Mobile Preview</p>
                  <div className="bg-white rounded-lg p-3 max-w-[280px]">
                    <p className="text-[10px] text-gray-500 mb-1">Ad</p>
                    <h4 className="text-blue-600 text-sm font-medium">
                      {formData.ad_headline || 'Headline'}
                    </h4>
                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                      {formData.ad_description || 'Description text...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t border-white/10">
              <button type="button" onClick={() => setStep(3)} className="btn btn-secondary">
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    Saving...
                  </span>
                ) : (
                  <>
                    <Save size={18} />
                    {isEditing ? 'Update Ad Group' : 'Create Ad Group'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
