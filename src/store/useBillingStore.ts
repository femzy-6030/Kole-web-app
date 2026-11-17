// src/store/useBillingStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MonthlyInvoice, PaymentRecord, ProcessPaymentPayload, ClientAdvancePaymentPayload } from '../types/billing';

// Seeded Invoices for current and previous cycles (November 2026 Base)
export const DEFAULT_MONTHLY_INVOICES: MonthlyInvoice[] = [
  // 1. Alh. Rasheed Adeleke (KL-OKF-1024) - Up to date
  {
    id: 'INV-202611-1001',
    client_id: 'HH-1001',
    customer_code: 'KL-OKF-1024',
    client_name: 'Alh. Rasheed Adeleke',
    phone_number: '08034567891',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-11-01',
    amount_due: 4000,
    amount_paid: 4000,
    status: 'paid',
    due_date: '2026-11-10',
    paid_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    cluster_id: 1,
    cluster_name: 'Oke-Fia Zone',
    created_at: '2026-11-01T08:00:00Z',
  },

  // 2. Mrs. Folashade Arowolo (KL-OKF-3819) - Debtor (2 Months Overdue)
  {
    id: 'INV-202610-1002',
    client_id: 'HH-1002',
    customer_code: 'KL-OKF-3819',
    client_name: 'Mrs. Folashade Arowolo',
    phone_number: '08123456789',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-10-01',
    amount_due: 4000,
    amount_paid: 0,
    status: 'unpaid',
    due_date: '2026-10-10',
    cluster_id: 1,
    cluster_name: 'Oke-Fia Zone',
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'INV-202611-1002',
    client_id: 'HH-1002',
    customer_code: 'KL-OKF-3819',
    client_name: 'Mrs. Folashade Arowolo',
    phone_number: '08123456789',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-11-01',
    amount_due: 4000,
    amount_paid: 0,
    status: 'unpaid',
    due_date: '2026-11-10',
    cluster_id: 1,
    cluster_name: 'Oke-Fia Zone',
    created_at: '2026-11-01T08:00:00Z',
  },

  // 3. Mallam Haruna Bello (KL-SAB-4921) - Up to date
  {
    id: 'INV-202611-1003',
    client_id: 'HH-1003',
    customer_code: 'KL-SAB-4921',
    client_name: 'Mallam Haruna Bello',
    phone_number: '08055667788',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-11-01',
    amount_due: 4000,
    amount_paid: 4000,
    status: 'paid',
    due_date: '2026-11-10',
    paid_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    cluster_id: 2,
    cluster_name: 'Sabo Zone',
    created_at: '2026-11-01T08:00:00Z',
  },

  // 4. Engr. Tunde Bakare (KL-ALK-5892) - Debtor (2 Months Overdue)
  {
    id: 'INV-202610-1004',
    client_id: 'HH-1004',
    customer_code: 'KL-ALK-5892',
    client_name: 'Engr. Tunde Bakare',
    phone_number: '08099887766',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-10-01',
    amount_due: 6000,
    amount_paid: 0,
    status: 'unpaid',
    due_date: '2026-10-10',
    cluster_id: 3,
    cluster_name: 'Alekuwodo Zone',
    created_at: '2026-10-01T08:00:00Z',
  },
  {
    id: 'INV-202611-1004',
    client_id: 'HH-1004',
    customer_code: 'KL-ALK-5892',
    client_name: 'Engr. Tunde Bakare',
    phone_number: '08099887766',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-11-01',
    amount_due: 6000,
    amount_paid: 0,
    status: 'unpaid',
    due_date: '2026-11-10',
    cluster_id: 3,
    cluster_name: 'Alekuwodo Zone',
    created_at: '2026-11-01T08:00:00Z',
  },

  // 5. Chief Bamidele Ojo (KL-GRA-7104) - Paid in Advance
  {
    id: 'INV-202611-1005',
    client_id: 'HH-1005',
    customer_code: 'KL-GRA-7104',
    client_name: 'Chief Bamidele Ojo',
    phone_number: '08022334455',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-11-01',
    amount_due: 8000,
    amount_paid: 8000,
    status: 'paid',
    due_date: '2026-11-10',
    paid_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    cluster_id: 4,
    cluster_name: 'GRA Zone',
    created_at: '2026-11-01T08:00:00Z',
  },
  {
    id: 'INV-202612-1005',
    client_id: 'HH-1005',
    customer_code: 'KL-GRA-7104',
    client_name: 'Chief Bamidele Ojo',
    phone_number: '08022334455',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-12-01',
    amount_due: 8000,
    amount_paid: 8000,
    status: 'overpaid_credit',
    due_date: '2026-12-10',
    paid_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    cluster_id: 4,
    cluster_name: 'GRA Zone',
    created_at: '2026-11-01T08:00:00Z',
  },

  // 6. Default Resident Client User (USR-9021 / 08012345678)
  {
    id: 'INV-202611-9021',
    client_id: 'USR-9021',
    customer_code: 'KL-OKF-9021',
    client_name: 'Resident Customer',
    phone_number: '08012345678',
    collector_id: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    billing_month: '2026-11-01',
    amount_due: 2500,
    amount_paid: 0,
    status: 'unpaid',
    due_date: '2026-11-20',
    cluster_id: 1,
    cluster_name: 'Oke-Fia Central Zone',
    created_at: '2026-11-01T08:00:00Z',
  },
];

export const DEFAULT_PAYMENTS_HISTORY: PaymentRecord[] = [
  {
    id: 'PAY-891024',
    invoice_id: 'INV-202611-1001',
    client_id: 'HH-1001',
    customer_code: 'KL-OKF-1024',
    client_name: 'Alh. Rasheed Adeleke',
    collected_by: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    payment_method: 'cash_collector',
    payment_type: 'current_month',
    amount_paid: 4000,
    target_months: ['2026-11-01'],
    receipt_number: 'REC-KL-891024',
    notes: 'In-person cash collection during morning route pickup.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'PAY-710401',
    invoice_id: 'INV-202611-1005',
    client_id: 'HH-1005',
    customer_code: 'KL-GRA-7104',
    client_name: 'Chief Bamidele Ojo',
    collected_by: 'COL-1001',
    collector_name: 'Osogbo Central Cleaners Ltd',
    payment_method: 'cash_collector',
    payment_type: 'advance_payment',
    amount_paid: 16000,
    target_months: ['2026-11-01', '2026-12-01'],
    receipt_number: 'REC-KL-710401',
    notes: '2-month prepayment received in cash at estate bay.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

interface BillingStoreState {
  invoices: MonthlyInvoice[];
  payments: PaymentRecord[];

  // Selectors & Lookups
  getInvoicesForClient: (customerCodeOrId: string, phone?: string) => MonthlyInvoice[];
  getPaymentsForClient: (customerCodeOrId: string, phone?: string) => PaymentRecord[];
  getInvoicesForCollector: (collectorId: string) => MonthlyInvoice[];

  // Mutations
  processCollectorPayment: (payload: ProcessPaymentPayload) => PaymentRecord;
  processClientOnlinePayment: (payload: ClientAdvancePaymentPayload) => PaymentRecord;
  addInvoice: (invoice: MonthlyInvoice) => void;
  syncHouseholdInvoices: (customerCode: string, monthlyTariff: number, balanceDue: number) => void;
}

export const useBillingStore = create<BillingStoreState>()(
  persist(
    (set, get) => ({
      invoices: DEFAULT_MONTHLY_INVOICES,
      payments: DEFAULT_PAYMENTS_HISTORY,

      getInvoicesForClient: (customerCodeOrId: string, phone?: string) => {
        const cleanId = (customerCodeOrId || '').toLowerCase().trim();
        const cleanPhone = (phone || '').replace(/\D/g, '');

        return get().invoices.filter((inv) => {
          const matchCode = inv.customer_code.toLowerCase() === cleanId;
          const matchId = inv.client_id.toLowerCase() === cleanId;
          const matchPhone = cleanPhone && (inv.phone_number || '').replace(/\D/g, '').includes(cleanPhone);
          return matchCode || matchId || matchPhone;
        }).sort((a, b) => b.billing_month.localeCompare(a.billing_month));
      },

      getPaymentsForClient: (customerCodeOrId: string, phone?: string) => {
        const cleanId = (customerCodeOrId || '').toLowerCase().trim();
        const cleanPhone = (phone || '').replace(/\D/g, '');

        return get().payments.filter((pay) => {
          const matchCode = pay.customer_code.toLowerCase() === cleanId;
          const matchId = pay.client_id.toLowerCase() === cleanId;
          const matchPhone = cleanPhone && (pay.client_name || '').toLowerCase().includes(cleanId);
          return matchCode || matchId || matchPhone;
        }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      },

      getInvoicesForCollector: (collectorId: string) => {
        return get().invoices.filter(
          (inv) => !collectorId || inv.collector_id === collectorId
        );
      },

      processCollectorPayment: (payload: ProcessPaymentPayload) => {
        const receiptNumber = `REC-KL-${Math.floor(100000 + Math.random() * 900000)}`;
        const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
        const nowIso = new Date().toISOString();

        const newPayment: PaymentRecord = {
          id: paymentId,
          client_id: payload.clientId || payload.customerCode,
          customer_code: payload.customerCode,
          client_name: payload.clientName,
          collected_by: payload.collectorId,
          collector_name: payload.collectorName,
          payment_method: payload.paymentMethod,
          payment_type: payload.paymentType,
          amount_paid: payload.amount,
          target_months: payload.targetMonths,
          receipt_number: receiptNumber,
          notes: payload.notes || `Collector payment recorded via ${payload.paymentMethod === 'cash_collector' ? 'Cash Override' : 'Digital Channel'}.`,
          created_at: nowIso,
        };

        // 1. Update Invoices
        const updatedInvoices = get().invoices.map((inv) => {
          const isTargetCustomer =
            inv.customer_code.toLowerCase() === payload.customerCode.toLowerCase() ||
            (payload.clientId && inv.client_id === payload.clientId);

          if (!isTargetCustomer) return inv;

          // If debt clearance, mark unpaid invoices as paid
          if (payload.paymentType === 'debt_clearance' && inv.status === 'unpaid') {
            return {
              ...inv,
              status: 'paid' as const,
              amount_paid: inv.amount_due,
              paid_at: nowIso,
              updated_at: nowIso,
            };
          }

          // If target month matches, mark paid
          if (payload.targetMonths.some((m) => inv.billing_month.startsWith(m.slice(0, 7)))) {
            return {
              ...inv,
              status: payload.paymentType === 'advance_payment' ? ('overpaid_credit' as const) : ('paid' as const),
              amount_paid: inv.amount_due,
              paid_at: nowIso,
              updated_at: nowIso,
            };
          }

          return inv;
        });

        // If advance payment for future months not yet in invoices, create future month invoice records
        if (payload.paymentType === 'advance_payment' && payload.targetMonths.length > 0) {
          payload.targetMonths.forEach((targetMonth) => {
            const exists = updatedInvoices.some(
              (inv) =>
                (inv.customer_code.toLowerCase() === payload.customerCode.toLowerCase() ||
                  inv.client_id === payload.clientId) &&
                inv.billing_month.startsWith(targetMonth.slice(0, 7))
            );
            if (!exists) {
              updatedInvoices.push({
                id: `INV-${targetMonth.slice(0, 7).replace('-', '')}-${payload.customerCode.slice(-4)}`,
                client_id: payload.clientId || payload.customerCode,
                customer_code: payload.customerCode,
                client_name: payload.clientName,
                collector_id: payload.collectorId,
                collector_name: payload.collectorName,
                billing_month: targetMonth,
                amount_due: Math.round(payload.amount / payload.targetMonths.length),
                amount_paid: Math.round(payload.amount / payload.targetMonths.length),
                status: 'overpaid_credit',
                due_date: `${targetMonth.slice(0, 7)}-10`,
                paid_at: nowIso,
                created_at: nowIso,
              });
            }
          });
        }

        // 2. Synchronize with localStorage households ledger
        try {
          if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem('kole-households-ledger');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const updatedHouseholds = parsed.map((h: any) => {
                  if (h.customer_code?.toLowerCase() === payload.customerCode.toLowerCase()) {
                    let newStatus = 'UP_TO_DATE';
                    let newBalance = 0;
                    let advanceCount = 0;

                    if (payload.paymentType === 'debt_clearance') {
                      newStatus = 'UP_TO_DATE';
                      newBalance = 0;
                    } else if (payload.paymentType === 'advance_payment') {
                      newStatus = 'PAID_IN_ADVANCE';
                      advanceCount = payload.targetMonths.length;
                    }

                    return {
                      ...h,
                      payment_status: newStatus,
                      balance_due: newBalance,
                      months_overdue: 0,
                      advance_months: advanceCount,
                      last_payment_date: nowIso,
                    };
                  }
                  return h;
                });
                localStorage.setItem('kole-households-ledger', JSON.stringify(updatedHouseholds));
              }
            }
          }
        } catch (syncErr) {
          console.warn('[BillingStore] Failed syncing local household ledger:', syncErr);
        }

        // 3. Commit state
        set((state) => ({
          invoices: updatedInvoices,
          payments: [newPayment, ...state.payments],
        }));

        return newPayment;
      },

      processClientOnlinePayment: (payload: ClientAdvancePaymentPayload) => {
        const receiptNumber = `REC-KL-${Math.floor(100000 + Math.random() * 900000)}`;
        const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
        const now = new Date();
        const nowIso = now.toISOString();

        // Generate target months based on monthsCount
        const targetMonths: string[] = [];
        for (let i = 0; i < payload.monthsCount; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
          targetMonths.push(d.toISOString().slice(0, 10));
        }

        const totalTariff = payload.baseTariff * payload.monthsCount;
        const platformFee = 200;
        const gatewayFee = Math.round((totalTariff + platformFee) * 0.015 + 100);
        const totalCharged = totalTariff + platformFee + gatewayFee;

        const newPayment: PaymentRecord = {
          id: paymentId,
          client_id: payload.clientId || payload.customerCode,
          customer_code: payload.customerCode,
          collected_by: payload.collectorId || 'COL-1001',
          payment_method: 'paystack_online',
          payment_type: payload.monthsCount > 1 ? 'advance_payment' : 'current_month',
          amount_paid: totalTariff,
          base_tariff: totalTariff,
          platform_fee: platformFee,
          gateway_fee: gatewayFee,
          total_charged: totalCharged,
          target_months: targetMonths,
          receipt_number: receiptNumber,
          notes: `Paystack online payment verified. Reference: ${payload.reference}`,
          created_at: nowIso,
        };

        const updatedInvoices = get().invoices.map((inv) => {
          if (inv.customer_code.toLowerCase() === payload.customerCode.toLowerCase()) {
            return {
              ...inv,
              status: 'paid' as const,
              amount_paid: inv.amount_due,
              paid_at: nowIso,
            };
          }
          return inv;
        });

        // Add advance month invoices if needed
        targetMonths.forEach((targetMonth) => {
          const exists = updatedInvoices.some(
            (inv) =>
              inv.customer_code.toLowerCase() === payload.customerCode.toLowerCase() &&
              inv.billing_month.startsWith(targetMonth.slice(0, 7))
          );
          if (!exists) {
            updatedInvoices.push({
              id: `INV-${targetMonth.slice(0, 7).replace('-', '')}-${payload.customerCode.slice(-4)}`,
              client_id: payload.clientId || payload.customerCode,
              customer_code: payload.customerCode,
              collector_id: payload.collectorId || 'COL-1001',
              billing_month: targetMonth,
              amount_due: payload.baseTariff,
              amount_paid: payload.baseTariff,
              status: 'overpaid_credit',
              due_date: `${targetMonth.slice(0, 7)}-10`,
              paid_at: nowIso,
              created_at: nowIso,
            });
          }
        });

        // Sync with localStorage households
        try {
          if (typeof localStorage !== 'undefined') {
            const raw = localStorage.getItem('kole-households-ledger');
            if (raw) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const updatedHouseholds = parsed.map((h: any) => {
                  if (h.customer_code?.toLowerCase() === payload.customerCode.toLowerCase()) {
                    return {
                      ...h,
                      payment_status: payload.monthsCount > 1 ? 'PAID_IN_ADVANCE' : 'UP_TO_DATE',
                      balance_due: 0,
                      months_overdue: 0,
                      advance_months: Math.max(0, payload.monthsCount - 1),
                      last_payment_date: nowIso,
                    };
                  }
                  return h;
                });
                localStorage.setItem('kole-households-ledger', JSON.stringify(updatedHouseholds));
              }
            }
          }
        } catch {}

        set((state) => ({
          invoices: updatedInvoices,
          payments: [newPayment, ...state.payments],
        }));

        return newPayment;
      },

      addInvoice: (invoice: MonthlyInvoice) => {
        set((state) => ({
          invoices: [invoice, ...state.invoices],
        }));
      },

      syncHouseholdInvoices: (customerCode: string, monthlyTariff: number, balanceDue: number) => {
        const currentMonth = '2026-11-01';
        const exists = get().invoices.some(
          (inv) =>
            inv.customer_code.toLowerCase() === customerCode.toLowerCase() &&
            inv.billing_month === currentMonth
        );

        if (!exists) {
          const status = balanceDue > 0 ? 'unpaid' : 'paid';
          const newInv: MonthlyInvoice = {
            id: `INV-202611-${customerCode.replace(/[^0-9]/g, '').slice(-4) || '1099'}`,
            client_id: customerCode,
            customer_code: customerCode,
            collector_id: 'COL-1001',
            collector_name: 'Osogbo Central Cleaners Ltd',
            billing_month: currentMonth,
            amount_due: monthlyTariff || 4000,
            amount_paid: balanceDue > 0 ? 0 : monthlyTariff,
            status: status,
            due_date: '2026-11-20',
            created_at: new Date().toISOString(),
          };
          set((state) => ({ invoices: [newInv, ...state.invoices] }));
        }
      },
    }),
    {
      name: 'kole-billing-ledger',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);

