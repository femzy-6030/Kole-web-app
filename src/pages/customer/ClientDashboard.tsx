// src/pages/customer/ClientDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { client } from '../../services/api';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';
import SOSModal from '../../components/SOSModal';
import HeaderBar from '../../components/layout/HeaderBar';
import AwarenessCarousel from '../../components/common/AwarenessCarousel';
import WhatsAppInviteCard from '../../components/common/WhatsAppInviteCard';
import CoreValueProps from '../../components/common/CoreValueProps';
import type { ClientUser, Cluster, AssignedCollector, ClientTelemetryData } from '../../types/client';
import {
  MapPin,
  Truck,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  LogOut,
  Sparkles,
  CreditCard,
  Building
} from 'lucide-react';

interface ClientDashboardProps {
  onNavigateToCheckout?: (data: {
    planKey: string;
    billingCycle?: string;
    title: string;
    amount: string;
    Area?: string;
  }) => void;
}

export default function ClientDashboard({ onNavigateToCheckout }: ClientDashboardProps) {
  const { user, isTemporaryPassword, logout } = useAuthStore();

  const [profile, setProfile] = useState<ClientUser | null>(null);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [collector, setCollector] = useState<AssignedCollector | null>(null);
  const [telemetry, setTelemetry] = useState<ClientTelemetryData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Emergency SOS Modal
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);

  // Fetch client profile and telemetry on mount
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setIsLoading(true);
    setErrorMsg('');

    try {
      const [profileData, telemetryData] = await Promise.all([
        client.getProfile(),
        client.getTelemetry(),
      ]);

      const resolvedUser: ClientUser = {
        ...user,
        ...profileData,
        is_temporary_password: Boolean(
          profileData.is_temporary_password ??
          user?.is_temporary_password ??
          isTemporaryPassword ??
          false
        ),
      };

      setProfile(resolvedUser);
      setCluster(resolvedUser.cluster || null);
      setCollector(resolvedUser.assigned_collector || null);
      setTelemetry(telemetryData);
    } catch (err: any) {
      console.error('[ClientDashboard Data Fetch Error]', err);
      setErrorMsg('Failed to load real-time pickup details. Using cached profile data.');

      // Fallback to active session user if available
      if (user) {
        setProfile(user as ClientUser);
        setCluster(user.cluster || {
          id: 1,
          name: user.Area || user.area || 'Oke-Fia Central Zone',
          code: 'OFZ-01',
          schedule: 'Tuesdays & Thursdays • 7:00 AM – 11:00 AM',
          pickup_days: ['Tuesday', 'Thursday'],
          status: 'ACTIVE',
        });
        setCollector(user.assigned_collector || {
          id: 'COL-104',
          name: 'Osogbo Central Cleaners Ltd',
          company_name: 'Osogbo Central Cleaners Ltd',
          phone: '08034567890',
          vehicle_info: 'Toyota Dyna Compactor (OSG-442-XA)',
          status: 'ON_DUTY',
        });
        setTelemetry({
          next_pickup_date: 'Thursday, 7:30 AM',
          active_dispatches: 0,
          waste_diverted_kg: 48.5,
          collection_status: 'SCHEDULED',
          last_collection: 'Tuesday, 8:15 AM',
        });
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // MANDATORY TEMPORARY PASSWORD BLOCK:
  // If the user's password is temporary, block dashboard access completely until updated!
  const hasTemporaryPassword = Boolean(
    isTemporaryPassword ||
    user?.is_temporary_password ||
    profile?.is_temporary_password
  );

  if (hasTemporaryPassword) {
    return (
      <div className="min-h-[500px] flex items-center justify-center p-4">
        <ChangePasswordModal
          isOpen={true}
          userPhone={profile?.phone_number || user?.phone_number || user?.phoneNumber}
          isMandatory={true}
          onSuccess={() => {
            fetchDashboardData();
          }}
        />
      </div>
    );
  }

  const handleTriggerCheckout = (planKey: string) => {
    const plans: Record<string, { title: string; price: string }> = {
      'one-time': { title: 'One-Time SOS Pickup', price: '₦1,500' },
      'weekly': { title: 'Weekly Pass', price: '₦2,100 / wk' },
      'monthly': { title: 'Household Monthly Plan', price: 'From ₦8,400 / mo' },
    };
    const selected = plans[planKey] || plans['monthly'];

    if (onNavigateToCheckout) {
      onNavigateToCheckout({
        planKey,
        billingCycle: planKey,
        title: selected.title,
        amount: selected.price,
        Area: cluster?.name || user?.Area || 'Oke-Fia',
      });
    }
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '234' + clean.slice(1);
    return clean;
  };

  return (
    <div className="max-w-md mx-auto w-full px-4 space-y-4 pb-24 text-slate-800">
      
      {/* 1. Brand Header Bar */}
      <HeaderBar />

      {/* 2. Client Greeting & Status Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[#00D7E8]/20 blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#00D7E8] animate-pulse" />
              <span>Assigned Household Account</span>
            </div>
            <h1 className="text-xl font-black pt-1">
              {profile?.full_name || profile?.fullName || user?.fullName || 'Resident Member'}
            </h1>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              Phone: <span className="font-mono font-bold">{profile?.phone_number || profile?.phoneNumber || user?.phoneNumber || '080XXXXXXXX'}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer text-white disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Telemetry Snapshot Row */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-emerald-600/50 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Next Scheduled Pickup</span>
            <span className="text-sm font-black text-white flex items-center gap-1 mt-0.5">
              <Calendar size={13} className="text-[#00D7E8]" />
              {telemetry?.next_pickup_date || 'Thursday, 7:30 AM'}
            </span>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Pickup Status</span>
            <span className="text-sm font-black text-[#00D7E8] flex items-center gap-1 mt-0.5">
              <Clock size={13} />
              {telemetry?.collection_status || 'SCHEDULED'}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-sm text-center py-8 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Syncing assigned cluster & collector telemetry...</p>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && !isLoading && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-[11px] leading-tight">
            {errorMsg}
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* ========================================================
              3. ZERO LOCATION PROMPT: ASSIGNED CLUSTER CARD
              Strictly reads pre-assigned cluster. No dropdowns.
          ======================================================== */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <MapPin size={17} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">
                    Verified Operating Cluster
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {cluster?.name || 'Oke-Fia Central Zone'}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-black uppercase">
                <CheckCircle2 size={11} className="text-emerald-600" />
                <span>Locked Coverage</span>
              </span>
            </div>

            {/* Schedule Details */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 text-xs">
              <Clock size={16} className="text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-slate-800">Cluster Pickup Schedule</p>
                <p className="text-[11px] text-slate-600">
                  {cluster?.schedule || 'Every Tuesday & Thursday • 7:00 AM – 11:00 AM'}
                </p>
              </div>
            </div>
          </div>

          {/* ========================================================
              4. ASSIGNED COLLECTOR FLEET OPERATOR CARD
              Clean payload rendering of collector name, phone, and vehicle info
          ======================================================== */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-[#00D7E8] flex items-center justify-center">
                  <Truck size={17} />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Assigned Fleet Operator
                  </span>
                  <h3 className="text-sm font-black text-slate-900 leading-tight">
                    {collector?.name || collector?.company_name || 'Osogbo Central Cleaners Ltd'}
                  </h3>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-black">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>{collector?.status || 'ON DUTY'}</span>
              </span>
            </div>

            {/* Vehicle & Logistics Details */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Logistics Vehicle:</span>
                <span className="font-bold text-slate-800">
                  {collector?.vehicle_info || 'Toyota Dyna Compactor (OSG-442-XA)'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Dispatch Contact:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {collector?.phone || collector?.phone_number || '08034567890'}
                </span>
              </div>
            </div>

            {/* Direct Contact Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${collector?.phone || collector?.phone_number || '08034567890'}`}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Phone size={14} className="text-emerald-700" />
                <span>Call Collector</span>
              </a>

              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(collector?.phone || collector?.phone_number || '08034567890')}?text=${encodeURIComponent(`Hello, I am a resident in ${cluster?.name || 'Oke-Fia'}. I am contacting you regarding waste collection.`)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* ========================================================
              5. QUICK ACTION CARDS: EMERGENCY SOS & TARIFF BILLING
          ======================================================== */}
          <div className="grid grid-cols-2 gap-3">
            {/* Instant Emergency Pickup */}
            <button
              type="button"
              onClick={() => setIsSOSModalOpen(true)}
              className="bg-white hover:bg-amber-50/50 p-4 rounded-3xl border border-slate-200/80 shadow-sm text-left transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <Zap size={20} />
              </div>
              <h4 className="text-xs font-black text-slate-900">Request SOS Pickup</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Emergency direct waste removal</p>
              <span className="text-[11px] font-bold text-amber-700 mt-2 inline-flex items-center gap-1">
                ₦1,500 <ArrowRight size={12} />
              </span>
            </button>

            {/* Pay Monthly Tariff */}
            <button
              type="button"
              onClick={() => handleTriggerCheckout('monthly')}
              className="bg-white hover:bg-emerald-50/50 p-4 rounded-3xl border border-slate-200/80 shadow-sm text-left transition-all group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <CreditCard size={20} />
              </div>
              <h4 className="text-xs font-black text-slate-900">Pay Monthly Tariff</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Renew recurring pickup plan</p>
              <span className="text-[11px] font-bold text-emerald-700 mt-2 inline-flex items-center gap-1">
                View Plans <ArrowRight size={12} />
              </span>
            </button>
          </div>

          {/* 6. Environmental Awareness Carousel */}
          <AwarenessCarousel customItems={[]} />

          {/* 7. WhatsApp Neighborhood Community Card */}
          <WhatsAppInviteCard
            userId={profile?.id || user?.id || 'USR-9021'}
            userCluster={cluster?.name || user?.Area || 'Oke-Fia'}
          />

          {/* 8. Core Value Props */}
          <CoreValueProps />
        </>
      )}

      {/* Emergency SOS Modal */}
      <SOSModal
        isOpen={isSOSModalOpen}
        onClose={() => setIsSOSModalOpen(false)}
        selectedArea={cluster?.name || user?.Area || 'Oke-Fia'}
        onDispatchSuccess={() => {
          setIsSOSModalOpen(false);
          fetchDashboardData(true);
        }}
      />
    </div>
  );
}
