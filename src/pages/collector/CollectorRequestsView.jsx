// src/pages/collector/CollectorRequestsView.jsx
import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import Button from '../../components/common/Button';
import {
    Truck,
    Zap,
    MapPin,
    Clock,
    Phone,
    CheckCircle2,
    Navigation,
    DollarSign,
    Image,
    Send,
    Filter,
    AlertCircle,
    Eye,
    X,
    Camera
} from 'lucide-react';

export default function CollectorRequestsView() {
    const { activeRequests, user } = useAuthStore();
    const { activeClusters } = useClusterStore();

    const [selectedCluster, setSelectedCluster] = useState('All');
    const [selectedPriority, setSelectedPriority] = useState('All'); // 'All' | 'SOS' | 'SCHEDULED'
    const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'IN_TRANSIT' | 'COMPLETED'
    
    // Local state for bids and statuses
    const [ticketBids, setTicketBids] = useState({});
    const [ticketStatuses, setTicketStatuses] = useState({});
    const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
    const [bidModalTicket, setBidModalTicket] = useState(null);
    const [bidForm, setBidForm] = useState({
        quoteAmount: '2100',
        etaMinutes: '15',
        unitAssigned: 'Compactor Unit #1',
    });

    // Seeded realistic requests if activeRequests is empty
    const defaultTickets = [
        {
            requestId: 'KL-904102',
            title: 'Critical Doorstep SOS Clearance',
            planKey: 'one-time',
            priority: 'CRITICAL_SOS',
            amount: '₦1,500',
            numericAmount: 1500,
            customerName: 'Olayinka Oluwafemi',
            phone: '08012345678',
            location: {
                area: 'Oke-Fia',
                streetAddress: 'Oke-Fia Roundabout, Near FCMB Bank',
                stagingInstructions: 'Four tied heavy bags behind front black gate.',
            },
            wastePhoto: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=600&q=80',
            createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            status: 'PENDING_DISPATCH',
        },
        {
            requestId: 'KL-904108',
            title: 'Weekly Scheduled Evacuation',
            planKey: 'weekly',
            priority: 'SCHEDULED',
            amount: '₦2,100',
            numericAmount: 2100,
            customerName: 'Aisha Adeleke',
            phone: '08123456789',
            location: {
                area: 'Station Road',
                streetAddress: 'Plot 14, Station Road Service Lane',
                stagingInstructions: 'Blue wheelie bin positioned outside curb.',
            },
            wastePhoto: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            status: 'PENDING_DISPATCH',
        },
        {
            requestId: 'KL-904115',
            title: 'Household Monthly Pass Collection',
            planKey: 'monthly',
            priority: 'SCHEDULED',
            amount: '₦8,400',
            numericAmount: 8400,
            customerName: 'Engr. Babatunde Gbadamosi',
            phone: '08098765432',
            location: {
                area: 'Sabo',
                streetAddress: 'Sabo Market Junction, Osogbo',
                stagingInstructions: 'Main compound perimeter gate.',
            },
            wastePhoto: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            status: 'IN_TRANSIT',
        },
    ];

    // Combine store requests with fallback defaults
    const allTickets = [
        ...(activeRequests || []),
        ...defaultTickets.filter(
            (def) => !(activeRequests || []).some((r) => r.requestId === def.requestId)
        ),
    ];

    // Filter tickets
    const filteredTickets = allTickets.filter((ticket) => {
        const area = ticket.area || ticket.location?.area || 'Oke-Fia';
        const isSOS = ticket.priority === 'CRITICAL_SOS' || ticket.title?.includes('SOS');
        const status = ticketStatuses[ticket.requestId] || ticket.status || 'PENDING_DISPATCH';

        if (selectedCluster !== 'All' && area.toLowerCase() !== selectedCluster.toLowerCase()) {
            return false;
        }

        if (selectedPriority === 'SOS' && !isSOS) return false;
        if (selectedPriority === 'SCHEDULED' && isSOS) return false;

        if (selectedStatus === 'PENDING' && status !== 'PENDING_DISPATCH') return false;
        if (selectedStatus === 'IN_TRANSIT' && status !== 'IN_TRANSIT') return false;
        if (selectedStatus === 'COMPLETED' && status !== 'COMPLETED') return false;

        return true;
    });

    const handleOpenBidModal = (ticket) => {
        setBidModalTicket(ticket);
        setBidForm({
            quoteAmount: ticket.numericAmount ? String(ticket.numericAmount) : '2100',
            etaMinutes: '15',
            unitAssigned: 'Compactor Unit #1',
        });
    };

    const handleSubmitBid = (e) => {
        e.preventDefault();
        if (!bidModalTicket) return;

        const id = bidModalTicket.requestId;
        setTicketBids((prev) => ({
            ...prev,
            [id]: {
                amount: `₦${Number(bidForm.quoteAmount).toLocaleString()}`,
                eta: `${bidForm.etaMinutes} mins`,
                unit: bidForm.unitAssigned,
                submittedAt: new Date().toISOString(),
            },
        }));

        setTicketStatuses((prev) => ({
            ...prev,
            [id]: 'IN_TRANSIT',
        }));

        setBidModalTicket(null);
    };

    const handleUpdateStatus = (id, newStatus) => {
        setTicketStatuses((prev) => ({
            ...prev,
            [id]: newStatus,
        }));
    };

    return (
        <div className="space-y-6 text-xs font-sans">
            {/* Top Stat Ribbon & Filter Controls */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                                <Truck size={18} />
                            </span>
                            <h2 className="text-base font-black text-white">Live Dispatch Bay</h2>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                            Real-time household clearance requests & SOS photo bidding stream
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-black text-[11px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            {filteredTickets.length} Visible Tickets
                        </span>
                    </div>
                </div>

                {/* Filter Controls Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800 text-[11px]">
                    {/* Cluster Filter */}
                    <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                        <MapPin size={14} className="text-emerald-400 shrink-0" />
                        <span className="text-slate-400 font-bold shrink-0">Cluster:</span>
                        <select
                            value={selectedCluster}
                            onChange={(e) => setSelectedCluster(e.target.value)}
                            className="w-full bg-transparent text-emerald-300 font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="All" className="bg-slate-900 text-white">All Operating Clusters</option>
                            <option value="Oke-Fia" className="bg-slate-900 text-white">Oke-Fia Zone</option>
                            <option value="Station Road" className="bg-slate-900 text-white">Station Road Zone</option>
                            <option value="Sabo" className="bg-slate-900 text-white">Sabo Zone</option>
                            <option value="Alekuwodo" className="bg-slate-900 text-white">Alekuwodo Zone</option>
                            <option value="GRA" className="bg-slate-900 text-white">GRA Zone</option>
                            <option value="Agowande" className="bg-slate-900 text-white">Agowande Zone</option>
                        </select>
                    </div>

                    {/* Priority Filter */}
                    <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                        <Zap size={14} className="text-rose-400 shrink-0" />
                        <span className="text-slate-400 font-bold shrink-0">Priority:</span>
                        <select
                            value={selectedPriority}
                            onChange={(e) => setSelectedPriority(e.target.value)}
                            className="w-full bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="All" className="bg-slate-900 text-white">All Requests</option>
                            <option value="SOS" className="bg-slate-900 text-white">Emergency SOS Only</option>
                            <option value="SCHEDULED" className="bg-slate-900 text-white">Scheduled Passes</option>
                        </select>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
                        <Clock size={14} className="text-amber-400 shrink-0" />
                        <span className="text-slate-400 font-bold shrink-0">Status:</span>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full bg-transparent text-slate-200 font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="ALL" className="bg-slate-900 text-white">All Statuses</option>
                            <option value="PENDING" className="bg-slate-900 text-white">Pending Dispatch</option>
                            <option value="IN_TRANSIT" className="bg-slate-900 text-white">In Transit</option>
                            <option value="COMPLETED" className="bg-slate-900 text-white">Completed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tickets Grid / Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket, index) => {
                        const currentStatus = ticketStatuses[ticket.requestId] || ticket.status || 'PENDING_DISPATCH';
                        const isEmergency = ticket.priority === 'CRITICAL_SOS' || ticket.title?.includes('SOS');
                        const bid = ticketBids[ticket.requestId];
                        const area = ticket.area || ticket.location?.area || 'Oke-Fia';
                        const address = ticket.address || ticket.location?.streetAddress || 'Oke-Fia Junction';
                        const staging = ticket.pickupBay || ticket.location?.stagingInstructions || 'Front gate entrance';

                        return (
                            <div
                                key={ticket.requestId || index}
                                className={`bg-white rounded-3xl p-5 border transition-all shadow-sm space-y-4 relative ${
                                    isEmergency
                                        ? 'border-rose-300 ring-2 ring-rose-500/10'
                                        : 'border-slate-200/80 hover:border-slate-300'
                                }`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-black text-slate-900 text-xs">
                                                {ticket.requestId}
                                            </span>
                                            {isEmergency && (
                                                <span className="text-[9px] bg-rose-100 text-rose-700 font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200">
                                                    <Zap size={10} className="fill-rose-700" /> INSTANT SOS
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-700 mt-1">{ticket.title}</p>
                                    </div>

                                    {/* Status Pill */}
                                    <span
                                        className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                            currentStatus === 'COMPLETED'
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : currentStatus === 'IN_TRANSIT'
                                                ? 'bg-sky-100 text-sky-800 animate-pulse'
                                                : 'bg-amber-100 text-amber-800'
                                        }`}
                                    >
                                        {currentStatus.replace('_', ' ')}
                                    </span>
                                </div>

                                {/* Customer & Location Details */}
                                <div className="grid grid-cols-2 gap-3 text-[11px]">
                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-bold uppercase text-[9px]">Cluster & Street</p>
                                        <p className="font-black text-slate-800 flex items-center gap-1">
                                            <MapPin size={12} className="text-emerald-600 shrink-0" />
                                            <span className="truncate">{area} Zone</span>
                                        </p>
                                        <p className="text-slate-500 text-[10px] truncate">{address}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-slate-400 font-bold uppercase text-[9px]">Resident Line</p>
                                        <p className="font-black text-slate-800 flex items-center gap-1">
                                            <Phone size={12} className="text-slate-500 shrink-0" />
                                            <span>{ticket.phone || '08012345678'}</span>
                                        </p>
                                        <p className="text-slate-500 text-[10px] truncate">{ticket.customerName || 'Resident'}</p>
                                    </div>
                                </div>

                                {/* Staging Bay Instruction Note */}
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Staging Bay Instructions</p>
                                    <p className="text-[11px] font-medium text-slate-700">{staging}</p>
                                </div>

                                {/* Waste Photo Thumbnail (For SOS Quote Bidding) */}
                                {ticket.wastePhoto && (
                                    <div className="flex items-center justify-between p-2.5 bg-slate-100/70 rounded-2xl border border-slate-200">
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={ticket.wastePhoto}
                                                alt="Staged Waste"
                                                onClick={() => setPreviewPhotoUrl(ticket.wastePhoto)}
                                                className="w-12 h-12 object-cover rounded-xl border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity"
                                            />
                                            <div>
                                                <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                                                    <Camera size={12} className="text-emerald-600" />
                                                    Staged Waste Photo
                                                </p>
                                                <p className="text-slate-400 text-[10px]">Tap to inspect volume</p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setPreviewPhotoUrl(ticket.wastePhoto)}
                                            className="px-2.5 py-1 text-[10px] font-bold bg-white text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50"
                                        >
                                            View Photo
                                        </button>
                                    </div>
                                )}

                                {/* Active Bid Details (if submitted) */}
                                {bid && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-[11px]">
                                        <div>
                                            <p className="font-black text-emerald-900">Active Operator Bid</p>
                                            <p className="text-emerald-700 text-[10px]">{bid.unit} • ETA: {bid.eta}</p>
                                        </div>
                                        <span className="font-black text-emerald-800 text-sm">{bid.amount}</span>
                                    </div>
                                )}

                                {/* Action Buttons Container */}
                                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
                                    {currentStatus === 'PENDING_DISPATCH' && (
                                        <>
                                            {isEmergency ? (
                                                <Button
                                                    onClick={() => handleOpenBidModal(ticket)}
                                                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                                                >
                                                    <Zap size={13} /> Bid SOS Quote & Dispatch
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleUpdateStatus(ticket.requestId, 'IN_TRANSIT')}
                                                    className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5"
                                                >
                                                    <Truck size={13} /> Claim Scheduled Pickup
                                                </Button>
                                            )}
                                        </>
                                    )}

                                    {currentStatus === 'IN_TRANSIT' && (
                                        <>
                                            <a
                                                href={`https://maps.google.com/?q=${encodeURIComponent(`${address}, Osogbo, Nigeria`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-200"
                                            >
                                                <Navigation size={13} className="text-emerald-600" /> GPS Route
                                            </a>
                                            <Button
                                                onClick={() => handleUpdateStatus(ticket.requestId, 'COMPLETED')}
                                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                                            >
                                                <CheckCircle2 size={13} /> Complete Clearance
                                            </Button>
                                        </>
                                    )}

                                    {currentStatus === 'COMPLETED' && (
                                        <div className="w-full text-center py-1 text-emerald-700 font-bold flex items-center justify-center gap-1">
                                            <CheckCircle2 size={14} /> Waste Successfully Cleared & Disposed
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200/80 p-8 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                            <Truck size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm">No Matching Tickets in Dispatch Queue</h3>
                        <p className="text-slate-400 text-xs max-w-sm mx-auto">
                            No requests match the selected cluster filter ({selectedCluster}) or priority. New household dispatches will stream in live.
                        </p>
                    </div>
                )}
            </div>

            {/* Photo Lightbox Preview Modal */}
            {previewPhotoUrl && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 p-4 rounded-3xl max-w-lg w-full space-y-3 relative border border-slate-800">
                        <button
                            onClick={() => setPreviewPhotoUrl(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                        >
                            <X size={20} />
                        </button>
                        <h3 className="text-sm font-black text-white">Staged Waste Verification</h3>
                        <img
                            src={previewPhotoUrl}
                            alt="Staged Waste Full"
                            className="w-full h-72 object-cover rounded-2xl border border-slate-800"
                        />
                        <p className="text-slate-400 text-[11px] text-center">
                            Inspect volume size to calibrate secondary truck dispatch or hydraulic compacting requirement.
                        </p>
                    </div>
                </div>
            )}

            {/* SOS Photo Quote Bid Modal */}
            {bidModalTicket && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setBidModalTicket(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={18} />
                        </button>

                        <div>
                            <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200 flex items-center gap-1 w-fit">
                                <Zap size={11} /> Priority SOS Quote Bidding
                            </span>
                            <h3 className="text-base font-black text-slate-800 mt-2">
                                Submit Quote for {bidModalTicket.requestId}
                            </h3>
                            <p className="text-slate-500 text-[11px]">
                                Location: <span className="font-bold text-slate-700">{bidModalTicket.location?.area} Zone</span> ({bidModalTicket.location?.streetAddress})
                            </p>
                        </div>

                        <form onSubmit={handleSubmitBid} className="space-y-3.5">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Instant Quote Bid (₦)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-3 font-bold text-slate-400">₦</span>
                                    <input
                                        type="number"
                                        required
                                        min="1000"
                                        step="100"
                                        value={bidForm.quoteAmount}
                                        onChange={(e) => setBidForm({ ...bidForm, quoteAmount: e.target.value })}
                                        className="w-full pl-8 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Est. Arrival (Minutes)</label>
                                    <input
                                        type="number"
                                        required
                                        min="5"
                                        max="60"
                                        value={bidForm.etaMinutes}
                                        onChange={(e) => setBidForm({ ...bidForm, etaMinutes: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Assigned Unit</label>
                                    <select
                                        value={bidForm.unitAssigned}
                                        onChange={(e) => setBidForm({ ...bidForm, unitAssigned: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800"
                                    >
                                        <option value="Compactor Unit #1">Compactor Unit #1</option>
                                        <option value="Compactor Unit #2">Compactor Unit #2</option>
                                        <option value="Tipper Truck #3">Tipper Truck #3</option>
                                    </select>
                                </div>
                            </div>

                            <Button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md">
                                Submit Quote & Activate En Route
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
