// src/components/organization/InternalEnvironmentalServiceLog.jsx
import React from 'react';
import {
    ShieldCheck,
    Printer,
    Download,
    X,
    Building2,
    Calendar,
    MapPin,
    Truck,
    CheckCircle2,
    Check,
    FileText,
    Award
} from 'lucide-react';
import Logo from '../common/Logo';

export default function InternalEnvironmentalServiceLog({
    isOpen = true,
    onClose,
    contractData,
}) {
    if (!isOpen || !contractData) return null;

    const facilityName = contractData.facilityName || 'Oroki Innovation Hub';
    const category = contractData.category || 'Corporate Office / Tech Hub';
    const cluster = contractData.cluster || 'Oke-Fia Zone';
    const reference = contractData.paymentRef || contractData.reference || `KL-ORG-${Date.now()}`;
    const amountFormatted = contractData.amountFormatted || '₦15,584';
    const officerName = contractData.officerName || 'Mr. Lukman Adeoti';
    const assignedCollector = contractData.assignedCollector || 'Osogbo Central Cleaners Ltd';
    const wasteTypes = contractData.wasteTypes || ['Cardboard & Packaging', 'E-Waste & Electronics'];
    const stagingBay = contractData.stagingBay || 'Rear loading dock near generator house';
    const frequency = contractData.frequency || 'Weekly Evacuation';
    const timeSlot = contractData.timeSlot || 'Morning (8 AM - 11 AM)';
    
    const paidDate = contractData.paidAt
        ? new Date(contractData.paidAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 text-xs space-y-6 my-auto relative print:border-none print:shadow-none print:p-0 print:max-w-none">
                
                {/* Print Control Toolbar (Hidden during Print) */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Award size={15} className="text-emerald-600" />
                        Verified Environmental Clearance Document
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                            <Printer size={14} /> Print / Save as PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* OFFICIAL AUDIT DOCUMENT BODY */}
                <div className="space-y-6 print:space-y-4">
                    
                    {/* Header Bar */}
                    <div className="flex items-start justify-between border-b-2 border-emerald-700 pb-4">
                        <div className="space-y-1">
                            <Logo className="h-9 w-auto" />
                            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                                Internal Environmental Service Log
                            </h1>
                            <p className="text-[10px] font-bold text-emerald-800 tracking-wide">
                                Institutional Waste Evacuation & Clearance Audit
                            </p>
                            <p className="text-[9.5px] text-slate-500">
                                In compliance with KÓLẸ̀ Terms & Conditions Section 1.6 (Commercial Compliance Standard)
                            </p>
                        </div>

                        <div className="text-right space-y-1">
                            <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                                <ShieldCheck size={12} className="text-emerald-700" /> VERIFIED LOG
                            </div>
                            <p className="font-mono text-[10px] text-slate-500 block">
                                Ref: <strong className="text-slate-900">{reference}</strong>
                            </p>
                            <p className="text-[9.5px] text-slate-400">
                                Issued: {paidDate}
                            </p>
                        </div>
                    </div>

                    {/* Facility Identification & Operational Cluster */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="space-y-2">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">
                                1. Client Facility Identification
                            </span>
                            <div>
                                <h3 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                    <Building2 size={15} className="text-emerald-700" /> {facilityName}
                                </h3>
                                <p className="text-slate-600 font-medium text-[11px] mt-0.5">
                                    Industry Category: <strong className="text-slate-800">{category}</strong>
                                </p>
                                <p className="text-slate-600 font-medium text-[11px]">
                                    Facility Officer: {officerName}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">
                                2. Operating Cluster & Staging Details
                            </span>
                            <div>
                                <p className="text-slate-800 font-bold text-[11px] flex items-center gap-1.5">
                                    <MapPin size={14} className="text-emerald-700" /> {cluster}, Osogbo
                                </p>
                                <p className="text-slate-600 font-medium text-[10.5px] mt-0.5">
                                    Designated Staging: <span className="text-slate-800 font-semibold">{stagingBay}</span>
                                </p>
                                <p className="text-slate-600 font-medium text-[10.5px]">
                                    Sanitation Operator: <strong className="text-emerald-800">{assignedCollector}</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Waste Stream Manifest */}
                    <div className="space-y-2">
                        <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-400 block">
                            3. Certified Waste Streams & Dispatch Schedule
                        </span>
                        
                        <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
                            <div className="flex flex-wrap gap-1.5">
                                {wasteTypes.map((stream, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-900 font-bold rounded-lg border border-emerald-200 text-[10.5px]"
                                    >
                                        <Check size={11} strokeWidth={3} className="text-emerald-700" /> {stream}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10.5px]">
                                <p className="text-slate-600">
                                    <strong>Evacuation Frequency:</strong> {frequency}
                                </p>
                                <p className="text-slate-600">
                                    <strong>Preferred Window:</strong> {timeSlot}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Settlement & Legal Certification Notice */}
                    <div className="bg-emerald-950 text-white p-4 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-emerald-800">
                            <span className="font-bold text-emerald-300">Financial Clearance Status</span>
                            <span className="font-black text-white bg-emerald-800 px-2.5 py-0.5 rounded text-[10px]">
                                CONFIRMED SETTLEMENT ({amountFormatted})
                            </span>
                        </div>
                        <p className="text-[10px] text-emerald-200 leading-relaxed">
                            <strong>Statutory Verification:</strong> All municipal pass-through charges, gate processing fees, and operator logistics allocations for this facility have been remitted. This service log acts as authorized administrative evidence of compliance with Osogbo municipal sanitation and non-dumping standards.
                        </p>
                    </div>

                    {/* Sign-Off & Official Stamp Footer */}
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px]">
                        <div>
                            <p className="font-bold text-slate-800">KÓLẸ̀ Environmental Technologies Ltd</p>
                            <p className="text-slate-400">Digital Dispatch Authorization & Traceability Engine</p>
                            <p className="text-slate-400">Validity: 30 Calendar Days from {paidDate}</p>
                        </div>

                        <div className="border border-emerald-300 bg-emerald-50/70 p-2.5 rounded-xl text-center space-y-0.5">
                            <CheckCircle2 size={18} className="text-emerald-700 mx-auto" />
                            <span className="block font-black text-emerald-900 text-[9px] uppercase tracking-wider">
                                Certified Seal
                            </span>
                            <span className="block text-[8px] text-emerald-700 font-mono">
                                KL-OPS-APPROVED
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

