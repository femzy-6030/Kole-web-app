// src/components/collector/ProcessPaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { useBillingStore } from '../../store/useBillingStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { HouseholdCustomer } from './AddCustomerModal';
import type { PaymentType, PaymentMethod, PaymentRecord } from '../../types/billing';
import {
  CreditCard,
  Banknote,
  CheckCircle2,
  AlertCircle,
  X,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  Download,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock
} from 'lucide-react';

interface ProcessPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: HouseholdCustomer | null;
  onPaymentSuccess?: (receipt: PaymentRecord) => void;
}

export default function ProcessPaymentModal({
  isOpen,
  onClose,
  customer,
  onPaymentSuccess,
}: ProcessPaymentModalProps) {
  const { user } = useAuthStore();
  const { processCollectorPayment } = useBillingStore();

  const [paymentType, setPaymentType] = useState<PaymentType>('current_month');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_collector');
  const [advanceMonthsCount, setAdvanceMonthsCount] = useState<number>(1);
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [generatedReceipt, setGeneratedReceipt] = useState<PaymentRecord | null>(null);

  // Auto-configure initial state based on customer's status when opened
  useEffect(() => {
    if (!customer) return;

    setGeneratedReceipt(null);
    setErrorMsg('');
    setNotes('');

    if (customer.payment_status === 'DEBTOR' && customer.balance_due > 0) {
      setPaymentType('debt_clearance');
      setAmount(customer.balance_due);
    } else {
      setPaymentType('current_month');
      setAmount(customer.monthly_tariff || 4000);
    }
    setPaymentMethod('cash_collector');
    setAdvanceMonthsCount(1);
  }, [customer, isOpen]);

  if (!isOpen || !customer) return null;

  const monthlyTariff = customer.monthly_tariff || 4000;
  const balanceDue = customer.balance_due || 0;

  // Compute target month labels based on action
  const getTargetMonths = (): string[] => {
    const now = new Date();
    if (paymentType === 'debt_clearance') {
      const months: string[] = [];
      const overdueCount = Math.max(1, customer.months_overdue || Math.ceil(balanceDue / monthlyTariff));
      for (let i = overdueCount; i >= 1; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toISOString().slice(0, 10));
      }
      return months;
    }

    if (paymentType === 'current_month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      return [d.toISOString().slice(0, 10)];
    }

    // Advance payment
    const months: string[] = [];
    for (let i = 1; i <= advanceMonthsCount; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(d.toISOString().slice(0, 10));
    }
    return months;
  };

  const handleTypeChange = (type: PaymentType) => {
    setPaymentType(type);
    setErrorMsg('');
    if (type === 'debt_clearance') {
      setAmount(balanceDue > 0 ? balanceDue : monthlyTariff);
    } else if (type === 'current_month') {
      setAmount(monthlyTariff);
    } else if (type === 'advance_payment') {
      setAmount(monthlyTariff * advanceMonthsCount);
    }
  };

  const handleAdvanceCountChange = (count: number) => {
    const clamped = Math.max(1, Math.min(12, count));
    setAdvanceMonthsCount(clamped);
    if (paymentType === 'advance_payment') {
      setAmount(monthlyTariff * clamped);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (amount <= 0) {
      setErrorMsg('Please specify a valid payment amount greater than ₦0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const collectorId = user?.id || 'COL-1001';
      const collectorName = user?.companyName || user?.fullName || 'Osogbo Central Cleaners Ltd';

      const receipt = processCollectorPayment({
        customerCode: customer.customer_code,
        clientId: customer.id,
        clientName: customer.full_name,
        collectorId,
        collectorName,
        paymentType,
        paymentMethod,
        amount,
        targetMonths: getTargetMonths(),
        notes: notes.trim(),
      });

      setGeneratedReceipt(receipt);
      if (onPaymentSuccess) {
        onPaymentSuccess(receipt);
      }
    } catch (err: any) {
      console.error('[ProcessPaymentModal Error]', err);
      setErrorMsg(err?.message || 'Failed to process payment. Please verify input and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareReceiptWhatsApp = () => {
    if (!generatedReceipt) return;
    let cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1);
    else if (!cleanPhone.startsWith('234')) cleanPhone = '234' + cleanPhone;

    const message =
      `📄 *KÓLẸ̀ OFFICIAL PAYMENT RECEIPT*\n` +
      `Receipt No: *${generatedReceipt.receipt_number}*\n` +
      `Customer: *${customer.full_name} (${customer.customer_code})*\n` +
      `Amount Paid: *₦${generatedReceipt.amount_paid.toLocaleString()}*\n` +
      `Payment Type: *${generatedReceipt.payment_type.replace('_', ' ').toUpperCase()}*\n` +
      `Channel: *${generatedReceipt.payment_method === 'cash_collector' ? 'Cash Collected by Operator' : 'Digital Override'}*\n` +
      `Collector: *${generatedReceipt.collector_name || 'Fleet Operator'}*\n` +
      `Date: *${new Date(generatedReceipt.created_at).toLocaleDateString()}*\n\n` +
      `Thank you for keeping Osogbo clean! Your account is updated.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl">
              <Banknote size={24} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                Collector Override & Debt Settlement
              </span>
              <h3 className="text-lg font-black text-white pt-1">
                Process Customer Payment
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* ======================================================== */}
        {/* SUCCESS RECEIPT VIEW (Rendered after successful payment) */}
        {/* ======================================================== */}
        {generatedReceipt ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
              <h4 className="text-base font-black text-white">Payment Recorded Successfully!</h4>
              <p className="text-xs text-slate-300">
                Customer account balances and monthly invoices have been updated in real-time.
              </p>
            </div>

            {/* Electronic Receipt Card */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">Receipt Ref:</span>
                <span className="font-bold text-emerald-400">{generatedReceipt.receipt_number}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Client:</span>
                <span className="font-bold text-white">{customer.full_name} ({customer.customer_code})</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-emerald-400 text-sm">₦{generatedReceipt.amount_paid.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Payment Channel:</span>
                <span className="font-bold text-slate-300">
                  {generatedReceipt.payment_method === 'cash_collector' ? 'Cash Override (Collector)' : 'Digital Transfer'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Settlement Type:</span>
                <span className="font-bold uppercase text-slate-300">
                  {generatedReceipt.payment_type.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Recorded By:</span>
                <span className="text-slate-300">{generatedReceipt.collector_name || 'Fleet Operator'}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleShareReceiptWhatsApp}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <MessageSquare size={15} />
                <span>Send WhatsApp Receipt</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Done / Close</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* FORM VIEW: SELECT PAYMENT DETAILS                       */
          /* ======================================================== */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Customer Summary Card */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-sm">{customer.full_name}</span>
                <span className="font-mono text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {customer.customer_code}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Cluster: {customer.cluster_zone}</span>
                <span>Tariff: ₦{monthlyTariff.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Current Balance Due:</span>
                <span className={`font-bold ${balanceDue > 0 ? 'text-rose-400 font-black' : 'text-emerald-400'}`}>
                  {balanceDue > 0 ? `₦${balanceDue.toLocaleString()} (Overdue)` : '₦0.00 (Up to Date)'}
                </span>
              </div>
            </div>

            {/* Error Message Banner */}
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs">
                <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 text-[11px] leading-tight">{errorMsg}</div>
              </div>
            )}

            {/* 1. Payment Action Type Selector */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                Payment Option <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Clear Existing Debt */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('debt_clearance')}
                  disabled={balanceDue <= 0}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    paymentType === 'debt_clearance'
                      ? 'border-rose-500 bg-rose-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[11px] font-bold">Clear Debt</span>
                  <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">
                    {balanceDue > 0 ? `₦${balanceDue.toLocaleString()}` : 'No Debt'}
                  </span>
                </button>

                {/* Pay Current Month */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('current_month')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentType === 'current_month'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[11px] font-bold">Current Month</span>
                  <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                    ₦{monthlyTariff.toLocaleString()}
                  </span>
                </button>

                {/* Prepay Advance Month(s) */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('advance_payment')}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    paymentType === 'advance_payment'
                      ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block text-[11px] font-bold">Prepay Advance</span>
                  <span className="text-[10px] text-sky-400 font-mono mt-0.5 block">
                    {advanceMonthsCount} Month(s)
                  </span>
                </button>
              </div>
            </div>

            {/* Advance Months Counter (If Advance selected) */}
            {paymentType === 'advance_payment' && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Number of Advance Months</span>
                  <span className="text-[10px] text-slate-400">₦{monthlyTariff.toLocaleString()} per month</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleAdvanceCountChange(advanceMonthsCount - 1)}
                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-sm text-white">
                    {advanceMonthsCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdvanceCountChange(advanceMonthsCount + 1)}
                    className="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Target Months Display */}
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-400" />
                Target Period:
              </span>
              <div className="flex flex-wrap gap-1">
                {getTargetMonths().map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 bg-slate-800 text-emerald-400 font-mono font-bold rounded text-[10px]"
                  >
                    {new Date(m).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Payment Channel (Cash Override vs Digital) */}
            <div className="space-y-1.5">
              <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">
                Payment Channel <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_collector')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'cash_collector'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <Banknote size={18} className={paymentMethod === 'cash_collector' ? 'text-emerald-400' : 'text-slate-500'} />
                  <div>
                    <span className="block text-xs font-bold">Cash Override</span>
                    <span className="text-[10px] text-slate-400">Physical In-Person Cash</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('paystack_online')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    paymentMethod === 'paystack_online'
                      ? 'border-sky-500 bg-sky-500/10 text-white font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard size={18} className={paymentMethod === 'paystack_online' ? 'text-sky-400' : 'text-slate-500'} />
                  <div>
                    <span className="block text-xs font-bold">Digital / POS</span>
                    <span className="text-[10px] text-slate-400">Direct Bank Transfer</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Payment Amount Input */}
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1.5 block">
                Amount to Record (₦) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 font-bold text-slate-400 text-sm">₦</span>
                <input
                  type="number"
                  min={100}
                  step={100}
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value) || 0)}
                  required
                  className="w-full pl-8 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl font-mono font-bold text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* 4. Notes / Audit Reason */}
            <div>
              <label className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1.5 block">
                Collector Note / Physical Receipt Ref (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cash collected at residence during Tuesday morning pickup"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting || amount <= 0}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Processing & Syncing Ledger...
                </span>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  <span>Confirm ₦{amount.toLocaleString()} & Generate Electronic Receipt</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

