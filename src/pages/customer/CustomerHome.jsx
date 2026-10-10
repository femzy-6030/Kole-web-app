// src/pages/customer/CustomerHome.jsx
import React, { useState } from 'react';
import CustomerNavbar from '../../components/layout/CustomerNavbar';
import BottomNav from '../../components/layout/BottomNav';
import HeroAwarenessCarousel from '../../components/awareness/HeroAwarenessCarousel';
import PickupRequestFlow from './PickupRequestFlow';
import PaymentsView from '../../components/customer/PaymentsView';
import ProfileView from '../../components/customer/ProfileView';
import { useJobStore } from '../../store/useJobStore';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../../components/common/Button';
import { Plus, Truck } from 'lucide-react';

export default function CustomerHome() {
    const [activeTab, setActiveTab] = useState('home'); // 'home' | 'payments' | 'me'
    const [isCreatingRequest, setIsCreatingRequest] = useState(false);
    const { user } = useAuthStore();
    const { jobs, addJob } = useJobStore();

    const customerJobs = jobs.filter((j) => j.cluster === (user?.cluster || 'Oke-Fia'));

    const handleRequestCreated = (newJobData) => {
        addJob(newJobData);
        setIsCreatingRequest(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-24">
            <CustomerNavbar />

            <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">

                {/* HOME TAB */}
                {activeTab === 'home' && (
                    <>
                        <HeroAwarenessCarousel />

                        {!isCreatingRequest ? (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-4">
                                <div className="w-14 h-14 bg-emerald-50 text-brand-primary rounded-2xl flex items-center justify-center mx-auto">
                                    <Truck size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-800">Need Immediate Waste Pickup?</h2>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Dispatch an emergency collector directly to your doorstep in <strong>{user?.cluster || 'Oke-Fia'}</strong>.
                                    </p>
                                </div>
                                <Button onClick={() => setIsCreatingRequest(true)} className="w-full py-4 text-sm font-black">
                                    <Plus size={18} className="mr-2" /> Request SOS Waste Pickup
                                </Button>
                            </div>
                        ) : (
                            <PickupRequestFlow
                                onCancel={() => setIsCreatingRequest(false)}
                                onRequestCreated={handleRequestCreated}
                            />
                        )}

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider">Your Pickup Requests</h3>
                                <span className="text-xs font-bold text-brand-primary">{customerJobs.length} Total</span>
                            </div>

                            {customerJobs.length === 0 ? (
                                <div className="bg-white rounded-2xl p-6 text-center text-xs text-slate-400 border border-slate-200">
                                    No pickup requests submitted yet.
                                </div>
                            ) : (
                                customerJobs.map((job) => (
                                    <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="text-xs font-black text-brand-primary">#{job.id}</span>
                                                <p className="text-xs font-bold text-slate-800">{job.address}</p>
                                            </div>
                                            <span
                                                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${job.status === 'COMPLETED'
                                                        ? 'bg-emerald-100 text-brand-primary'
                                                        : job.status === 'IN_TRANSIT'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                            >
                                                {job.status}
                                            </span>
                                        </div>

                                        {job.proofUrl && (
                                            <div className="mt-2">
                                                <p className="text-[10px] font-bold text-slate-500 mb-1">Collector Photo Proof:</p>
                                                <img src={job.proofUrl} alt="Completion Proof" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === 'payments' && <PaymentsView jobs={customerJobs} />}

                {/* ME / PROFILE TAB */}
                {activeTab === 'me' && <ProfileView />}

            </main>

            {/* Fixed Bottom App Navigation Bar */}
            <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
    );
}