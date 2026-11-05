// src/components/collector/AddCustomerModal.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import { OSOGBO_CLUSTERS } from '../../utils/zoneValidator';
import {
  X,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  MapPin,
  Lock,
  DollarSign,
  Share2,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export interface HouseholdCustomer {
  id?: string;
  customer_code: string;
  full_name: string;
  phone: string;
  address: string;
  cluster_zone: string;
  monthly_tariff: number;
  permanent_password: string;
  collector_id?: string;
  collector_name?: string;
  payment_status: 'UP_TO_DATE' | 'DEBTOR' | 'PAID_IN_ADVANCE';
  balance_due: number;
  months_overdue?: number;
  advance_months?: number;
  last_payment_date?: string;
  notes?: string;
  created_at?: string;
}

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerAdded?: (newCustomer: HouseholdCustomer) => void;
  defaultCluster?: string;
}

/**
 * Generate a unique customer tracking code: KL-[ZONE_PREFIX]-[RANDOM_4_DIGITS]
 * e.g., KL-OKF-8492
 */
export const generateCustomerCode = (zoneName: string): string => {
  const prefixMap: Record<string, string> = {
    'oke-fia': 'OKF',
    'okefia': 'OKF',
    'sabo': 'SAB',
    'alekuwodo': 'ALK',
    'gra': 'GRA',
    'ogo-oluwa': 'OGO',
    'station road': 'STR',
    'old garage': 'OLD',
    'agowande': 'AGW',
  };

  const clean = (zoneName || '')
    .toLowerCase()
    .replace(/\bzone\b/g, '')
    .trim();

  const prefix = prefixMap[clean] || clean.substring(0, 3).toUpperCase() || 'OKF';
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `KL-${prefix}-${random4}`;
};

export default function AddCustomerModal({
  isOpen,
  onClose,
  onCustomerAdded,
  defaultCluster,
}: AddCustomerModalProps) {
  const { user } = useAuthStore();
  const { registeredCollectors } = useClusterStore();

  const activeCollector =
    (registeredCollectors && registeredCollectors[0]) ||
    user || {
      id: 'COL-1001',
      companyName: 'Osogbo Central Cleaners Ltd',
      collectorName: 'Osogbo Central Cleaners Ltd',
      phone: '08012345678',
      Area: 'Oke-Fia',
      cluster: 'Oke-Fia Zone',
      bankName: 'First Bank of Nigeria',
      accountNumber: '0123456789',
    };

  const initialCluster =
    defaultCluster ||
    activeCollector.cluster ||
    `${activeCollector.Area || 'Oke-Fia'} Zone`;

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [clusterZone, setClusterZone] = useState(initialCluster);
  const [monthlyTariff, setMonthlyTariff] = useState('4000');
  const [password, setPassword] = useState('Kole#2026');
  const [notes, setNotes] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdCustomer, setCreatedCustomer] = useState<HouseholdCustomer | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setAddress('');
    setClusterZone(initialCluster);
    setMonthlyTariff('4000');
    setPassword('Kole#2026');
    setNotes('');
    setErrorMessage(null);
    setCreatedCustomer(null);
    setCopiedCode(false);
    setCopiedPassword(false);
    setCopiedAll(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();
    const cleanTariff = Number(monthlyTariff) || 4000;
    const cleanPassword = password.trim() || 'Kole#2026';

    if (!cleanName || !cleanPhone || !cleanAddress) {
      setErrorMessage('Please fill in the client full name, phone number, and street address.');
      return;
    }

    setIsSubmitting(true);

    const generatedCode = generateCustomerCode(clusterZone);

    const newHousehold: HouseholdCustomer = {
      customer_code: generatedCode,
      full_name: cleanName,
      phone: cleanPhone,
      address: cleanAddress,
      cluster_zone: clusterZone,
      monthly_tariff: cleanTariff,
      permanent_password: cleanPassword,
      collector_id: activeCollector.id || 'COL-1001',
      collector_name: activeCollector.companyName || activeCollector.collectorName || 'KóLẹ̀ Fleet Operator',
      payment_status: 'UP_TO_DATE',
      balance_due: 0,
      months_overdue: 0,
      advance_months: 0,
      last_payment_date: new Date().toISOString(),
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Insert record into Supabase households table
      if (supabase?.from) {
        const { error: dbError } = await supabase.from('households').insert([newHousehold]);
        if (dbError) {
          console.warn('[AddCustomerModal] Supabase households insert notice:', dbError);
        }
      }

      // 2. Cache in local storage for instant offline availability
      try {
        if (typeof localStorage !== 'undefined') {
          const raw = localStorage.getItem('kole-households-ledger');
          const current: HouseholdCustomer[] = raw ? JSON.parse(raw) : [];
          localStorage.setItem('kole-households-ledger', JSON.stringify([newHousehold, ...current]));
        }
      } catch (cacheErr) {
        console.warn('[AddCustomerModal] Local storage sync notice:', cacheErr);
      }

      setIsSubmitting(false);
      setCreatedCustomer(newHousehold);

      if (onCustomerAdded) {
        onCustomerAdded(newHousehold);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      console.error('[AddCustomerModal] Submission error:', err);
      setErrorMessage(err?.message || 'An error occurred while registering the client.');
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'password' | 'all') => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === 'password') {
        setCopiedPassword(true);
        setTimeout(() => setCopiedPassword(false), 2000);
      } else {
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 2000);
      }
    }
  };

  const handleShareWhatsApp = () => {
    if (!createdCustomer) return;

    let cleanPhone = createdCustomer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = `234${cleanPhone.slice(1)}`;
    } else if (!cleanPhone.startsWith('234')) {
      cleanPhone = `234${cleanPhone}`;
    }

    const message =
      `🎉 *Welcome to KÓLẸ̀ Municipal Waste Services!*\n\n` +
      `Your household has been registered for weekly municipal waste clearance.\n\n` +
      `📌 *Account Details:*\n` +
      `• *Client Name:* ${createdCustomer.full_name}\n` +
      `• *Customer ID:* ${createdCustomer.customer_code}\n` +
      `• *Login Phone:* ${createdCustomer.phone}\n` +
      `• *Permanent Password:* ${createdCustomer.permanent_password}\n` +
      `• *House Address:* ${createdCustomer.address}\n` +
      `• *Cluster Zone:* ${createdCustomer.cluster_zone}\n` +
      `• *Monthly Tariff:* ₦${createdCustomer.monthly_tariff.toLocaleString()}/mo\n` +
      `• *Payment Status:* UP TO DATE (₦0.00 Due)\n\n` +
      `🌐 Sign in anytime at: https://app.kole.com.ng\n` +
      `Assigned Fleet Operator: ${activeCollector.companyName || 'Osogbo Central Cleaners'}`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const allSummaryText = createdCustomer
    ? `KÓLẸ̀ CLIENT CREDENTIALS\nName: ${createdCustomer.full_name}\nCustomer ID: ${createdCustomer.customer_code}\nPhone: ${createdCustomer.phone}\nPassword: ${createdCustomer.permanent_password}\nAddress: ${createdCustomer.address} (${createdCustomer.cluster_zone})\nMonthly Tariff: ₦${createdCustomer.monthly_tariff.toLocaleString()}/mo\nPortal: https://app.kole.com.ng`
    : '';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 text-slate-100">
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          <X size={18} />
        </button>

        {!createdCustomer ? (
          /* ============================================================ */
          /* FORM VIEW: Assisted Client Registration                      */
          /* ============================================================ */
          <div className="space-y-5">
            {/* Modal Header */}
            <div className="space-y-1 pr-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <UserPlus size={11} /> Assisted Client Onboarding
              </div>
              <h2 className="text-lg font-black text-white">Register Household / Client</h2>
              <p className="text-xs text-slate-400">
                Create permanent client credentials, assign to your operating zone, and issue a unique KóLẹ̀ tracking code.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Full Name */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Client Full Name / Household Head *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alh. Rasheed Adeleke / Madam Folake"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Phone & Cluster Zone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Client Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="tel"
                      required
                      placeholder="08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Assigned Cluster Zone *
                  </label>
                  <select
                    value={clusterZone}
                    onChange={(e) => setClusterZone(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {OSOGBO_CLUSTERS.map((c) => (
                      <option key={c.name} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* House Address */}
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Street Address & Landmark *
                </label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Plot 14, Ayetoro St, Near Testing Ground Junction"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Monthly Tariff & Permanent Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Monthly Tariff (₦) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-500">₦</span>
                    <input
                      type="number"
                      required
                      min="1000"
                      step="500"
                      value={monthlyTariff}
                      onChange={(e) => setMonthlyTariff(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {['4000', '6000', '8000', '10000'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setMonthlyTariff(amt)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                          monthlyTariff === amt
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        ₦{Number(amt).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Permanent Client Password *
                  </label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Permanent password client uses to login.
                  </p>
                </div>
              </div>

              {/* Collector Assignment Preview */}
              <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Assigned Collector:</span>
                </div>
                <span className="font-bold text-white truncate max-w-[200px]">
                  {activeCollector.companyName || 'Osogbo Central Cleaners'}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/3 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  {isSubmitting ? (
                    <span>Registering Client...</span>
                  ) : (
                    <>
                      <span>Complete Client Onboarding</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ============================================================ */
          /* SUCCESS STATE: Code Issued & Permanent Login Details         */
          /* ============================================================ */
          <div className="space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={34} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Client Successfully Registered
              </span>
              <h2 className="text-xl font-black text-white pt-1">
                {createdCustomer.full_name}
              </h2>
              <p className="text-xs text-slate-400">
                Tracking code generated. Share these credentials with the client to access their KóLẹ̀ account.
              </p>
            </div>

            {/* Credential Cards */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 text-left space-y-3 text-xs">
              {/* Customer Tracking Code */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Unique Customer Code
                  </span>
                  <p className="text-base font-black text-emerald-400 font-mono tracking-wider">
                    {createdCustomer.customer_code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdCustomer.customer_code, 'code')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedCode ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Login Phone */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">Login Phone</span>
                  <p className="font-bold text-white">{createdCustomer.phone}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Username</span>
              </div>

              {/* Permanent Password */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    Permanent Password
                  </span>
                  <p className="font-mono font-bold text-amber-300 tracking-wider">
                    {createdCustomer.permanent_password}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdCustomer.permanent_password, 'password')}
                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  {copiedPassword ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Tariff & Zone */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-slate-500">Monthly Tariff:</span>
                  <p className="font-bold text-white">
                    ₦{createdCustomer.monthly_tariff.toLocaleString()} / mo
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Assigned Zone:</span>
                  <p className="font-bold text-emerald-400 truncate">
                    {createdCustomer.cluster_zone}
                  </p>
                </div>
              </div>
            </div>

            {/* Sharing Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                <Share2 size={15} />
                <span>Send Login Credentials via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(allSummaryText, 'all')}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-700"
              >
                {copiedAll ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedAll ? 'All Details Copied to Clipboard!' : 'Copy Complete Details as Text'}</span>
              </button>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2.5 text-emerald-400 hover:text-emerald-300 font-bold text-xs cursor-pointer"
                >
                  + Onboard Another Client
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
                >
                  View in Customer Ledger →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

