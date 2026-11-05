// src/components/collector/CollectorCustomerLedger.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuthStore } from '../../store/useAuthStore';
import { useClusterStore } from '../../store/useClusterStore';
import AddCustomerModal, { HouseholdCustomer } from './AddCustomerModal';
import { OSOGBO_CLUSTERS } from '../../utils/zoneValidator';
import {
  Users,
  Search,
  Filter,
  Download,
  UserPlus,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  ArrowUpRight,
  RefreshCw,
  FileSpreadsheet,
  Check,
  ChevronDown,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

// Seeded realistic Osogbo household clients for immediate ledger functionality
export const DEFAULT_HOUSEHOLD_CUSTOMERS: HouseholdCustomer[] = [
  {
    id: 'HH-1001',
    customer_code: 'KL-OKF-1024',
    full_name: 'Alh. Rasheed Adeleke',
    phone: '08034567891',
    address: 'Plot 14, Ayetoro St, Near Testing Ground',
    cluster_zone: 'Oke-Fia Zone',
    monthly_tariff: 4000,
    permanent_password: 'Kole#Adeleke1',
    payment_status: 'UP_TO_DATE',
    balance_due: 0,
    months_overdue: 0,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 5).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'HH-1002',
    customer_code: 'KL-OKF-3819',
    full_name: 'Mrs. Folashade Arowolo',
    phone: '08123456789',
    address: '8, Station Road Lane 2, Behind FCMB',
    cluster_zone: 'Oke-Fia Zone',
    monthly_tariff: 4000,
    permanent_password: 'Kole#Arowolo2',
    payment_status: 'DEBTOR',
    balance_due: 8000,
    months_overdue: 2,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 65).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 90).toISOString(),
  },
  {
    id: 'HH-1003',
    customer_code: 'KL-SAB-4921',
    full_name: 'Mallam Haruna Bello',
    phone: '08055667788',
    address: '22, Sabo Market Central Way',
    cluster_zone: 'Sabo Zone',
    monthly_tariff: 4000,
    permanent_password: 'Kole#Haruna3',
    payment_status: 'UP_TO_DATE',
    balance_due: 0,
    months_overdue: 0,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 12).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'HH-1004',
    customer_code: 'KL-ALK-5892',
    full_name: 'Engr. Tunde Bakare',
    phone: '08099887766',
    address: '5, Alekuwodo Expressway, Opp. Conoil',
    cluster_zone: 'Alekuwodo Zone',
    monthly_tariff: 6000,
    permanent_password: 'Kole#Bakare4',
    payment_status: 'DEBTOR',
    balance_due: 12000,
    months_overdue: 2,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 70).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 120).toISOString(),
  },
  {
    id: 'HH-1005',
    customer_code: 'KL-GRA-7104',
    full_name: 'Chief Bamidele Ojo',
    phone: '08022334455',
    address: 'Plot 3, Government Reserve Area, Phase 1',
    cluster_zone: 'GRA Zone',
    monthly_tariff: 8000,
    permanent_password: 'Kole#Bamidele5',
    payment_status: 'PAID_IN_ADVANCE',
    balance_due: 0,
    months_overdue: 0,
    advance_months: 2,
    last_payment_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'HH-1006',
    customer_code: 'KL-OGO-8231',
    full_name: 'Pastor Samuel Ogundele',
    phone: '08133445566',
    address: '11, Gbongan-Osogbo Road, Ogo-Oluwa',
    cluster_zone: 'Ogo-Oluwa Zone',
    monthly_tariff: 4000,
    permanent_password: 'Kole#Samuel6',
    payment_status: 'UP_TO_DATE',
    balance_due: 0,
    months_overdue: 0,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 8).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
  },
  {
    id: 'HH-1007',
    customer_code: 'KL-STR-9142',
    full_name: 'Dr. Kingsley Ebere',
    phone: '08077889900',
    address: '7, Railway Quarters Road, Station Area',
    cluster_zone: 'Station Road Zone',
    monthly_tariff: 6000,
    permanent_password: 'Kole#Kingsley7',
    payment_status: 'DEBTOR',
    balance_due: 6000,
    months_overdue: 1,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 40).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
  },
  {
    id: 'HH-1008',
    customer_code: 'KL-OLD-6218',
    full_name: 'Madam Beatrice Alabi',
    phone: '08166778899',
    address: '19, Old Garage Motor Park Road',
    cluster_zone: 'Old Garage Zone',
    monthly_tariff: 4000,
    permanent_password: 'Kole#Beatrice8',
    payment_status: 'UP_TO_DATE',
    balance_due: 0,
    months_overdue: 0,
    advance_months: 0,
    last_payment_date: new Date(Date.now() - 86400000 * 15).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 75).toISOString(),
  },
];

/**
 * Trigger CSV export download: Kole_Ledger_[CollectorName]_[Date].csv
 */
export const exportLedgerToCSV = (
  customers: HouseholdCustomer[],
  collectorName: string = 'Osogbo_Cleaners'
) => {
  const safeName = collectorName.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `Kole_Ledger_${safeName}_${dateStr}.csv`;

  const headers = [
    'Customer Code',
    'Full Name',
    'Phone Number',
    'House Address',
    'Cluster Zone',
    'Monthly Tariff (NGN)',
    'Balance Due (NGN)',
    'Payment Status',
    'Months Overdue',
    'Advance Months',
    'Registration Date',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = customers.map((c) => [
    escapeCSV(c.customer_code),
    escapeCSV(c.full_name),
    escapeCSV(c.phone),
    escapeCSV(c.address),
    escapeCSV(c.cluster_zone),
    escapeCSV(c.monthly_tariff),
    escapeCSV(c.balance_due),
    escapeCSV(c.payment_status),
    escapeCSV(c.months_overdue || 0),
    escapeCSV(c.advance_months || 0),
    escapeCSV(c.created_at ? new Date(c.created_at).toLocaleDateString() : ''),
  ]);

  const csvContent = [headers.map((h) => `"${h}"`).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function CollectorCustomerLedger() {
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

  const [customers, setCustomers] = useState<HouseholdCustomer[]>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem('kole-households-ledger');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_HOUSEHOLD_CUSTOMERS;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | 'DEBTOR' | 'UP_TO_DATE' | 'PAID_IN_ADVANCE'>('ALL');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('ALL');
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Sync with Supabase on mount
  useEffect(() => {
    let isMounted = true;
    const fetchCustomersFromSupabase = async () => {
      setIsLoading(true);
      try {
        if (supabase?.from) {
          const client: any = supabase;
          const { data, error } = await client.from('households').select('*').order('created_at', { ascending: false });

          if (!error && Array.isArray(data) && data.length > 0) {
            if (isMounted) {
              setCustomers((prev) => {
                // Merge remote households with any seeded ones not in DB
                const existingCodes = new Set(data.map((d: any) => d.customer_code));
                const nonDuplicates = prev.filter((p) => !existingCodes.has(p.customer_code));
                const merged = [...data, ...nonDuplicates];
                try {
                  localStorage.setItem('kole-households-ledger', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          }
        }
      } catch (err) {
        console.warn('[CollectorCustomerLedger] Supabase fetch fallback to local ledger:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCustomersFromSupabase();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered customer dataset
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // 1. Search Query (Code, Name, Phone, Address)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.customer_code.toLowerCase().includes(q) ||
        c.full_name.toLowerCase().includes(q) ||
        c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) ||
        c.address.toLowerCase().includes(q);

      // 2. Status Tab Filter
      const matchesStatus =
        selectedStatusTab === 'ALL' || c.payment_status === selectedStatusTab;

      // 3. Zone Filter
      const matchesZone =
        selectedZoneFilter === 'ALL' ||
        c.cluster_zone.toLowerCase().includes(selectedZoneFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesZone;
    });
  }, [customers, searchQuery, selectedStatusTab, selectedZoneFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = customers.length;
    const upToDate = customers.filter((c) => c.payment_status === 'UP_TO_DATE').length;
    const debtors = customers.filter((c) => c.payment_status === 'DEBTOR');
    const advance = customers.filter((c) => c.payment_status === 'PAID_IN_ADVANCE');

    const totalOverdue = debtors.reduce((sum, c) => sum + (Number(c.balance_due) || 0), 0);

    return {
      total,
      upToDate,
      debtorCount: debtors.length,
      advanceCount: advance.length,
      totalOverdue,
    };
  }, [customers]);

  // Handle Newly Onboarded Customer
  const handleCustomerAdded = (newCustomer: HouseholdCustomer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    setActionSuccessMessage(`Successfully registered ${newCustomer.full_name} (${newCustomer.customer_code})!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  // WhatsApp Direct Billing Nudge
  const handleSendWhatsAppNudge = (customer: HouseholdCustomer) => {
    let cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = `234${cleanPhone.slice(1)}`;
    } else if (!cleanPhone.startsWith('234')) {
      cleanPhone = `234${cleanPhone}`;
    }

    const collectorName = activeCollector.companyName || activeCollector.collectorName || 'KóLẹ̀ Waste Collector';
    const bankName = activeCollector.bankName || 'First Bank of Nigeria';
    const accNo = activeCollector.accountNumber || '0123456789';

    const amountDue = customer.balance_due > 0 ? customer.balance_due : customer.monthly_tariff;

    const message =
      `Hello ${customer.full_name}, this is your assigned KóLẹ̀ waste collector (${collectorName}). ` +
      `Your account balance is ₦${amountDue.toLocaleString()}. Please make payment to:\n\n` +
      `Bank: ${bankName}\n` +
      `Acc No: ${accNo}\n\n` +
      `Kindly send your receipt. Thank you!`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Mark Customer Paid / Toggle Up To Date
  const handleMarkPaid = async (customer: HouseholdCustomer) => {
    const updated = customers.map((c) => {
      if (c.customer_code === customer.customer_code) {
        return {
          ...c,
          payment_status: 'UP_TO_DATE' as const,
          balance_due: 0,
          months_overdue: 0,
          last_payment_date: new Date().toISOString(),
        };
      }
      return c;
    });

    setCustomers(updated);
    try {
      localStorage.setItem('kole-households-ledger', JSON.stringify(updated));
      if (supabase?.from) {
        const client: any = supabase;
        await client
          .from('households')
          .update({
            payment_status: 'UP_TO_DATE',
            balance_due: 0,
            months_overdue: 0,
            last_payment_date: new Date().toISOString(),
          })
          .eq('customer_code', customer.customer_code);
      }
    } catch {}

    setActionSuccessMessage(`Recorded full payment for ${customer.full_name}!`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-100">
      {/* ============================================================ */}
      {/* TOP HEADER & ACTION BAR                                      */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Users size={18} />
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
              Customer Ledger & Billing
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Municipal Client Ledger
          </h2>
          <p className="text-xs text-slate-400">
            Real-time household tracking, payment balances, assisted onboarding, and automated WhatsApp billing nudges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* CSV Export Button */}
          <button
            type="button"
            onClick={() => exportLedgerToCSV(filteredCustomers, activeCollector.companyName)}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-slate-600"
            title="Export filtered ledger as CSV spreadsheet"
          >
            <Download size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Onboard Client Modal Button */}
          <button
            type="button"
            onClick={() => setIsOnboardModalOpen(true)}
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40"
          >
            <UserPlus size={14} />
            <span>+ Onboard Client</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl flex items-center gap-2 text-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-bold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4 SUMMARY METRIC CARDS                                       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold">Total Clients</span>
            <Users size={16} className="text-slate-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white">{metrics.total}</span>
            <span className="text-[10px] text-slate-400 font-mono">Assigned</span>
          </div>
        </div>

        {/* Up to Date */}
        <div className="bg-slate-900 border border-emerald-500/20 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs">
            <span className="font-bold">Up to Date</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400">{metrics.upToDate}</span>
            <span className="text-[10px] text-emerald-500/80 font-bold">₦0.00 Overdue</span>
          </div>
        </div>

        {/* Debtors / Overdue */}
        <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-rose-400 text-xs">
            <span className="font-bold">Debtors / Overdue</span>
            <AlertCircle size={16} className="text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-400">{metrics.debtorCount}</span>
            <span className="text-xs font-mono font-bold text-rose-300">
              ₦{metrics.totalOverdue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Paid in Advance */}
        <div className="bg-slate-900 border border-sky-500/20 p-4 rounded-2xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-sky-400 text-xs">
            <span className="font-bold">Paid in Advance</span>
            <TrendingUp size={16} className="text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-sky-400">{metrics.advanceCount}</span>
            <span className="text-[10px] text-sky-400/80 font-bold">Advance Credit</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FILTER & SEARCH CONTROL BAR                                  */}
      {/* ============================================================ */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search by customer code (KL-...), name, phone, or street address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Cluster Zone Dropdown Filter */}
          <div className="sm:w-60">
            <select
              value={selectedZoneFilter}
              onChange={(e) => setSelectedZoneFilter(e.target.value)}
              className="w-full py-2.5 px-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="ALL">All Cluster Zones ({OSOGBO_CLUSTERS.length})</option>
              {OSOGBO_CLUSTERS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
          {[
            { key: 'ALL', label: 'All Accounts', count: customers.length },
            {
              key: 'DEBTOR',
              label: 'Debtors / Overdue',
              count: customers.filter((c) => c.payment_status === 'DEBTOR').length,
              badgeClass: 'bg-rose-500/20 text-rose-300',
            },
            {
              key: 'UP_TO_DATE',
              label: 'Up to Date',
              count: customers.filter((c) => c.payment_status === 'UP_TO_DATE').length,
              badgeClass: 'bg-emerald-500/20 text-emerald-300',
            },
            {
              key: 'PAID_IN_ADVANCE',
              label: 'Paid in Advance',
              count: customers.filter((c) => c.payment_status === 'PAID_IN_ADVANCE').length,
              badgeClass: 'bg-sky-500/20 text-sky-300',
            },
          ].map((tab) => {
            const isActive = selectedStatusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedStatusTab(tab.key as any)}
                className={`py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : tab.badgeClass || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CUSTOMER LEDGER TABLE & ROWS                                 */}
      {/* ============================================================ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                <th className="py-3.5 px-4">Client ID / Code</th>
                <th className="py-3.5 px-4">Customer Name & Contact</th>
                <th className="py-3.5 px-4">House Address & Zone</th>
                <th className="py-3.5 px-4">Tariff & Balance</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const isDebtor = c.payment_status === 'DEBTOR';
                  const isAdvance = c.payment_status === 'PAID_IN_ADVANCE';
                  const isUpToDate = c.payment_status === 'UP_TO_DATE';

                  return (
                    <tr
                      key={c.customer_code}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Customer ID & Tracking Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                          {c.customer_code}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Password: <span className="font-mono text-slate-400">{c.permanent_password}</span>
                        </div>
                      </td>

                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-xs">{c.full_name}</p>
                        <a
                          href={`tel:${c.phone}`}
                          className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 mt-0.5"
                        >
                          <Phone size={10} />
                          <span>{c.phone}</span>
                        </a>
                      </td>

                      {/* Address & Zone */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="truncate text-slate-200 text-xs" title={c.address}>
                          {c.address}
                        </p>
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <MapPin size={10} className="text-emerald-400" />
                          <span>{c.cluster_zone}</span>
                        </span>
                      </td>

                      {/* Monthly Tariff & Balance Due */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-bold text-white">
                          ₦{c.monthly_tariff.toLocaleString()}
                          <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
                        </p>
                        {isDebtor ? (
                          <p className="text-[11px] font-black text-rose-400 flex items-center gap-0.5 mt-0.5">
                            <TrendingDown size={11} /> Overdue: ₦{c.balance_due.toLocaleString()}
                            {c.months_overdue ? ` (${c.months_overdue}m)` : ''}
                          </p>
                        ) : isAdvance ? (
                          <p className="text-[11px] font-bold text-sky-400 flex items-center gap-0.5 mt-0.5">
                            <TrendingUp size={11} /> Advance Credit ({c.advance_months || 1}m)
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-500 mt-0.5">Balance: ₦0.00</p>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isDebtor && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-300 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                            <AlertCircle size={11} className="text-rose-400" />
                            <span>Debtor</span>
                          </span>
                        )}
                        {isUpToDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <CheckCircle2 size={11} className="text-emerald-400" />
                            <span>Up to Date</span>
                          </span>
                        )}
                        {isAdvance && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                            <Check size={11} className="text-sky-400" />
                            <span>Advance Paid</span>
                          </span>
                        )}
                      </td>

                      {/* Action Buttons: WhatsApp Nudge & Mark Paid */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct WhatsApp Nudge Button */}
                          <button
                            type="button"
                            onClick={() => handleSendWhatsAppNudge(c)}
                            className="py-1.5 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl font-bold text-xs flex items-center gap-1.5 border border-emerald-500/20 transition-all cursor-pointer"
                            title="Send pre-filled WhatsApp billing nudge with your bank details"
                          >
                            <MessageSquare size={13} className="text-emerald-400" />
                            <span className="hidden sm:inline">WhatsApp Nudge</span>
                          </button>

                          {/* Quick Mark Paid Action for Debtors */}
                          {isDebtor && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(c)}
                              className="py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer border border-slate-700"
                              title="Mark account paid and up to date"
                            >
                              Clear Due
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 space-y-2">
                    <Users size={32} className="mx-auto text-slate-600 opacity-60" />
                    <p className="font-bold text-slate-400">No matching clients found in ledger.</p>
                    <p className="text-xs">
                      Try clearing filters or click &quot;+ Onboard Client&quot; to register a new household.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Count */}
        <div className="bg-slate-950/60 p-3 px-4 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredCustomers.length}</strong> of{' '}
            <strong className="text-white">{customers.length}</strong> registered clients
          </span>
          <span className="text-slate-500">KóLẹ̀ Municipal Operations • Osogbo Hub</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ONBOARDING MODAL COMPONENT                                   */}
      {/* ============================================================ */}
      <AddCustomerModal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        onCustomerAdded={handleCustomerAdded}
        defaultCluster={activeCollector.cluster || `${activeCollector.Area || 'Oke-Fia'} Zone`}
      />
    </div>
  );
}
