import React, { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';

export default function CampaignManager() {
    const [campaigns, setCampaigns] = useState([
        {
            id: 1,
            title: 'Osogbo Clean City Campaign 2026',
            badge: 'Public Awareness',
            description: 'Sort your recyclable plastics before pickup for extra community credits!',
        },
        {
            id: 2,
            title: 'Flood Prevention Notice',
            badge: 'Safety Alert',
            description: 'Avoid disposing waste in open gutters during heavy rain sessions.',
        },
    ]);

    const [newCampaign, setNewCampaign] = useState({ title: '', badge: 'Public Awareness', description: '' });

    const handleAddCampaign = (e) => {
        e.preventDefault();
        if (!newCampaign.title) return;
        setCampaigns([...campaigns, { id: Date.now(), ...newCampaign }]);
        setNewCampaign({ title: '', badge: 'Public Awareness', description: '' });
    };

    const handleDelete = (id) => {
        setCampaigns(campaigns.filter((c) => c.id !== id));
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div>
                <h2 className="text-lg font-black text-slate-800">Public Awareness Campaign Manager</h2>
                <p className="text-xs text-slate-500">Publish educational banners to Customer Hero Carousel & Collector Feeds.</p>
            </div>

            <form onSubmit={handleAddCampaign} className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                        label="Campaign Title"
                        placeholder="e.g., Plastic Recycling Drive"
                        value={newCampaign.title}
                        onChange={(e) => setNewCampaign({ ...newCampaign, title: e.target.value })}
                        required
                    />
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Category Badge</label>
                        <select
                            value={newCampaign.badge}
                            onChange={(e) => setNewCampaign({ ...newCampaign, badge: e.target.value })}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-brand-primary"
                        >
                            <option value="Public Awareness">Public Awareness</option>
                            <option value="Safety Alert">Safety Alert</option>
                            <option value="Community Update">Community Update</option>
                        </select>
                    </div>
                </div>

                <Input
                    label="Banner Description / Body"
                    placeholder="Brief message to display on user dashboards..."
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    required
                />

                <Button type="submit" size="sm" className="flex items-center gap-1.5">
                    <Plus size={16} /> Publish Campaign Banner
                </Button>
            </form>

            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-700">Active Published Banners ({campaigns.length})</h3>
                {campaigns.map((c) => (
                    <div key={c.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-emerald-100 text-brand-primary text-[10px] font-bold rounded-full uppercase">
                                {c.badge}
                            </span>
                            <h4 className="text-sm font-black text-slate-800">{c.title}</h4>
                            <p className="text-xs text-slate-500">{c.description}</p>
                        </div>
                        <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}