// src/pages/collector/CollectorAssistancesView.jsx
import React, { useState } from 'react';
import { useClusterStore } from '../../store/useClusterStore';
import Button from '../../components/common/Button';
import {
    LifeBuoy,
    AlertTriangle,
    Truck,
    Wrench,
    Ban,
    DollarSign,
    CheckCircle2,
    Clock,
    Phone,
    MessageSquare,
    Plus,
    X,
    MapPin,
    AlertCircle
} from 'lucide-react';

export default function CollectorAssistancesView() {
    const { assistanceTickets, addAssistanceTicket } = useClusterStore();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
    const [newTicketForm, setNewTicketForm] = useState({
        category: 'Vehicle Breakdown',
        title: '',
        cluster: 'Oke-Fia Zone',
        priority: 'HIGH',
        notes: '',
    });
    const [submittedNotice, setSubmittedNotice] = useState(false);

    const quickCategories = [
        {
            category: 'Vehicle Breakdown',
            label: 'Mechanical Breakdown',
            icon: Wrench,
            color: 'rose',
            desc: 'Hydraulic failure, engine trouble, flat tire',
        },
        {
            category: 'Road Inaccessible',
            label: 'Route Blockage',
            icon: Ban,
            color: 'amber',
            desc: 'Flooded road, gate lock, road construction',
        },
        {
            category: 'Overcapacity Assistance',
            label: 'Secondary Truck Request',
            icon: Truck,
            color: 'sky',
            desc: 'Volume overload, backup compactor required',
        },
        {
            category: 'Settlement Query',
            label: 'Payout Reconciliation',
            icon: DollarSign,
            color: 'emerald',
            desc: 'Paystack automated split payout delay',
        },
    ];

    const handleQuickAction = (cat) => {
        setNewTicketForm({
            category: cat.category,
            title: `${cat.label} at Active Cluster`,
            cluster: 'Oke-Fia Zone',
            priority: cat.category === 'Vehicle Breakdown' ? 'CRITICAL' : 'HIGH',
            notes: '',
        });
        setIsCreateModalOpen(true);
    };

    const handleCreateTicket = (e) => {
        e.preventDefault();
        if (!newTicketForm.title.trim()) return;

        addAssistanceTicket({
            category: newTicketForm.category,
            title: newTicketForm.title.trim(),
            cluster: newTicketForm.cluster,
            priority: newTicketForm.priority,
            notes: newTicketForm.notes.trim() || 'Ticket logged. Awaiting dispatch coordinator response.',
        });

        setIsCreateModalOpen(false);
        setSubmittedNotice(true);
        setTimeout(() => setSubmittedNotice(false), 4000);
    };

    const filteredTickets = (assistanceTickets || []).filter((ticket) => {
        if (selectedCategoryFilter === 'ALL') return true;
        return ticket.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
    });

    const activeTicketsCount = (assistanceTickets || []).filter((t) => t.status !== 'Resolved').length;

    return (
        <div className="space-y-6 text-xs font-sans max-w-5xl mx-auto">
            {/* Top Command Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                <LifeBuoy size={18} />
                            </span>
                            <h2 className="text-base font-black text-white">Cluster Assistance & Operator Support</h2>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                            Real-time emergency breakdown support, route escorts & dispatch logs
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                        >
                            <Plus size={14} /> Log Assistance Request
                        </Button>
                    </div>
                </div>

                {/* Direct Emergency Dispatch Hotline */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
                            <AlertTriangle size={15} />
                        </span>
                        <div>
                            <p className="font-bold text-slate-200">24/7 Osogbo Dispatch Control Coordinator</p>
                            <p className="text-[10px] text-slate-400">Direct phone line: 08012345678 • Average response: &lt; 5 mins</p>
                        </div>
                    </div>

                    <a
                        href="https://api.whatsapp.com/send?phone=2348012345678&text=URGENT%20COLLECTOR%20ASSISTANCE%20REQUEST"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold flex items-center gap-1.5 hover:bg-emerald-600/30 transition-colors"
                    >
                        <MessageSquare size={13} /> WhatsApp Dispatch Hotline
                    </a>
                </div>
            </div>

            {/* Notification Banner */}
            {submittedNotice && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-emerald-800 animate-in fade-in duration-200">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Assistance ticket logged successfully. Osogbo municipal dispatch unit has been notified.</span>
                </div>
            )}

            {/* Quick Assistance Trigger Grid */}
            <div>
                <h3 className="font-black text-slate-800 text-xs mb-3 uppercase tracking-wide">
                    Instant Assistance Triggers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickCategories.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.category}
                                type="button"
                                onClick={() => handleQuickAction(item)}
                                className="bg-white hover:bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-left transition-all shadow-sm space-y-2 cursor-pointer group"
                            >
                                <div className="p-2 bg-slate-100 rounded-xl w-fit group-hover:scale-105 transition-transform text-slate-700">
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <h4 className="font-black text-slate-800 text-xs">{item.label}</h4>
                                    <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Assistance Tickets Log */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="font-black text-slate-800 text-sm">Assistance Logs & Coordinator Responses</h3>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                            {activeTicketsCount} open tickets currently being resolved by municipal coordinators
                        </p>
                    </div>

                    {/* Filter Selector */}
                    <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-slate-400 font-bold">Category:</span>
                        <select
                            value={selectedCategoryFilter}
                            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 font-bold focus:outline-none"
                        >
                            <option value="ALL">All Categories</option>
                            <option value="Vehicle Breakdown">Vehicle Breakdown</option>
                            <option value="Road Inaccessible">Route Blockage</option>
                            <option value="Overcapacity">Secondary Truck</option>
                            <option value="Settlement">Settlement Query</option>
                        </select>
                    </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-3">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-[11px]"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-slate-800 text-xs">{ticket.id}</span>
                                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                            {ticket.category}
                                        </span>
                                        <span className="font-bold text-slate-500 text-[10px] flex items-center gap-1">
                                            <MapPin size={11} className="text-emerald-600" /> {ticket.cluster}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                                ticket.priority === 'CRITICAL'
                                                    ? 'bg-rose-100 text-rose-800'
                                                    : ticket.priority === 'HIGH'
                                                    ? 'bg-amber-100 text-amber-800'
                                                    : 'bg-slate-200 text-slate-700'
                                            }`}
                                        >
                                            {ticket.priority}
                                        </span>

                                        <span
                                            className={`px-2.5 py-0.5 rounded-full font-black text-[10px] ${
                                                ticket.status === 'Resolved'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-sky-100 text-sky-800 animate-pulse'
                                            }`}
                                        >
                                            {ticket.status}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-bold text-slate-800">{ticket.title}</p>
                                    <p className="text-slate-500 text-[10px] mt-0.5">{ticket.notes}</p>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60">
                                    <span className="flex items-center gap-1">
                                        <Clock size={11} /> Logged: {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className="text-emerald-700 font-bold">
                                        Coordinator Active
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-center py-8">No assistance tickets found in this category.</p>
                    )}
                </div>
            </div>

            {/* Create Ticket Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={18} />
                        </button>

                        <div>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                                Dispatch Support Desk
                            </span>
                            <h3 className="text-base font-black text-slate-800 mt-2">
                                Log Operator Assistance Request
                            </h3>
                            <p className="text-slate-500 text-[11px]">
                                Municipal dispatch will route backup equipment or coordinators immediately.
                            </p>
                        </div>

                        <form onSubmit={handleCreateTicket} className="space-y-3.5">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                                <select
                                    value={newTicketForm.category}
                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                                >
                                    <option value="Vehicle Breakdown">Vehicle Breakdown / Mechanical Failure</option>
                                    <option value="Road Inaccessible">Road Blockage / Inaccessible Gate</option>
                                    <option value="Overcapacity Assistance">Overcapacity / Secondary Truck Request</option>
                                    <option value="Settlement Query">Paystack Settlement Discrepancy</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Brief Description / Subject</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Hydraulic arm jammed at Oke-Fia Roundabout"
                                    value={newTicketForm.title}
                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, title: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Operating Cluster</label>
                                    <select
                                        value={newTicketForm.cluster}
                                        onChange={(e) => setNewTicketForm({ ...newTicketForm, cluster: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                                    >
                                        <option value="Oke-Fia Zone">Oke-Fia Zone</option>
                                        <option value="Station Road Zone">Station Road Zone</option>
                                        <option value="Sabo Zone">Sabo Zone</option>
                                        <option value="Alekuwodo Zone">Alekuwodo Zone</option>
                                        <option value="GRA Zone">GRA Zone</option>
                                        <option value="Agowande Zone">Agowande Zone</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Urgency Level</label>
                                    <select
                                        value={newTicketForm.priority}
                                        onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                                    >
                                        <option value="CRITICAL">Critical (Immediate Stop)</option>
                                        <option value="HIGH">High Priority</option>
                                        <option value="MEDIUM">Medium Priority</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Specific Location / Extra Details</label>
                                <textarea
                                    rows={2}
                                    placeholder="Specific landmark, staging gate number, or mechanic needed..."
                                    value={newTicketForm.notes}
                                    onChange={(e) => setNewTicketForm({ ...newTicketForm, notes: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 font-medium"
                                />
                            </div>

                            <Button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
                                Submit to Dispatch Coordinator
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
