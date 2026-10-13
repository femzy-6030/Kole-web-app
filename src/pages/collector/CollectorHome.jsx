import React, { useState } from 'react';
import CollectorNavbar from '../../components/layout/CollectorNavbar';
import AreahiftModal from '../../components/collector/AreahiftModal';
import CollectorFeedHeader from '../../components/awareness/CollectorFeedHeader';
import ProofUploadModal from '../../components/collector/ProofUploadModal';
import Button from '../../components/common/Button';
import { CheckCircle } from 'lucide-react';

export default function CollectorHome() {
    const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'wallet'
    const [activeArea, setActiveArea] = useState('Oke-Fia');
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [activeProofJobId, setActiveProofJobId] = useState(null);

    // Mock Area Jobs
    const [jobs, setJobs] = useState([
        {
            id: 'KL-904102',
            address: 'Oke-Fia Junction, Near Station Road',
            Area: 'Oke-Fia',
            volume: 'Medium (3-5 Bags)',
            status: 'PENDING',
            customerPaid: 0.0,
            fixedFee: 0.0,
            collectorNet: 0.0,
        },
        {
            id: 'KL-904108',
            address: 'Alekuwodo Road, Osogbo',
            Area: 'Oke-Fia',
            volume: 'Small (1-2 Bags)',
            status: 'IN_TRANSIT',
            customerPaid: 0.0,
            fixedFee: 0.0,
            collectorNet: 0.0,
        },
    ]);

    const [wallet, setWallet] = useState({
        availableBalance: 0.0,
        pendingBalance: 0.0,
        completedJobsCount: 0,
    });

    const handleClaimJob = (jobId) => {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'IN_TRANSIT' } : j));
    };

    const handleCompleteJobWithProof = (jobId, photoUrl) => {
        setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'COMPLETED', proofUrl: photoUrl } : j));
        setWallet(prev => ({
            ...prev,
            completedJobsCount: prev.completedJobsCount + 1,
        }));
        setActiveProofJobId(null);
    };

    return (
        <div className="min-h-screen bg-slate-100 pb-12">

            <CollectorNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                activeArea={activeArea}
                onChangeArea={() => setShowShiftModal(true)}
            />

            {showShiftModal && (
                <AreahiftModal
                    currentArea={activeArea}
                    onConfirmArea={(newArea) => {
                        setActiveArea(newArea);
                        setShowShiftModal(false);
                    }}
                    onClose={() => setShowShiftModal(false)}
                />
            )}

            {activeProofJobId && (
                <ProofUploadModal
                    jobId={activeProofJobId}
                    onCompleteJob={handleCompleteJobWithProof}
                    onClose={() => setActiveProofJobId(null)}
                />
            )}

            <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">

                {/* JOBS TAB */}
                {activeTab === 'jobs' && (
                    <>
                        <CollectorFeedHeader AreaName={activeArea} />

                        <div className="flex items-center justify-between pt-2">
                            <div>
                                <h2 className="text-base font-black text-slate-800">Area Pickup Feed</h2>
                                <p className="text-[11px] text-slate-500">Showing requests for <strong>{activeArea}</strong>[cite: 1, 2].</p>
                            </div>
                            <span className="text-xs bg-emerald-100 text-brand-primary px-2.5 py-1 rounded-full font-bold">
                                {jobs.filter(j => j.Area === activeArea).length} Active
                            </span>
                        </div>

                        <div className="space-y-3">
                            {jobs.filter(j => j.Area === activeArea).map((job) => (
                                <div key={job.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-black text-brand-primary">#{job.id}</span>
                                            <p className="text-xs font-bold text-slate-800 mt-0.5">{job.address}</p>
                                        </div>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${job.status === 'COMPLETED' ? 'bg-emerald-100 text-brand-primary' :
                                            job.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' :
                                                'bg-slate-100 text-slate-600'
                                            }`}>
                                            {job.status}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                                        <span>Volume: <strong>{job.volume}</strong></span>
                                        <span>Payout: <strong className="text-brand-primary">₦{job.collectorNet.toFixed(2)}</strong></span>
                                    </div>

                                    {job.status === 'PENDING' && (
                                        <Button
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleClaimJob(job.id)}
                                        >
                                            Accept Job
                                        </Button>
                                    )}

                                    {job.status === 'IN_TRANSIT' && (
                                        <Button
                                            size="sm"
                                            className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                                            onClick={() => setActiveProofJobId(job.id)}
                                        >
                                            Upload Proof & Complete
                                        </Button>
                                    )}

                                    {job.status === 'COMPLETED' && (
                                        <div className="flex items-center gap-1 text-xs text-brand-primary font-bold">
                                            <CheckCircle size={14} />
                                            <span>Completed & Proof Uploaded</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* WALLET TAB */}
                {activeTab === 'wallet' && (
                    <div className="space-y-4">
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-md space-y-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Available Earnings</span>
                            <div className="text-3xl font-black text-brand-accent">₦{wallet.availableBalance.toFixed(2)}</div>

                            <div className="flex justify-between border-t border-slate-800 pt-3 text-xs text-slate-300">
                                <span>Completed Pickups: <strong>{wallet.completedJobsCount}</strong></span>
                                <span>Pending Settlement: <strong>₦{wallet.pendingBalance.toFixed(2)}</strong></span>
                            </div>

                            <Button className="w-full bg-brand-primary hover:bg-brand-hover text-white">
                                Request Payout Transfer
                            </Button>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                            <h3 className="text-xs font-black uppercase text-slate-700">Fee Breakdown Policy</h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Net earnings reflect: <br />
                                <code className="text-brand-primary font-bold">Customer Fee − Platform Fixed Service Fee</code>[cite: 1, 2]
                            </p>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}