// src/types/billing.ts

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'overpaid_credit';
export type PaymentMethod = 'cash_collector' | 'paystack_online';
export type PaymentType = 'debt_clearance' | 'current_month' | 'advance_payment';

export interface MonthlyInvoice {
  id: string; // UUID e.g. "INV-202611-1024"
  client_id: string; // Foreign key to users
  customer_code: string; // e.g. "KL-OKF-1024"
  client_name?: string;
  phone_number?: string;
  collector_id: string; // Foreign key to collectors
  collector_name?: string;
  billing_month: string; // Date / Period e.g. "2026-11-01" or "November 2026"
  amount_due: number; // Decimal e.g. 4000
  amount_paid: number;
  status: InvoiceStatus;
  due_date?: string;
  paid_at?: string;
  cluster_id?: string | number;
  cluster_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentRecord {
  id: string; // UUID e.g. "PAY-782109"
  invoice_id?: string; // Foreign key to monthly_invoices
  client_id: string; // Foreign key to users
  customer_code: string;
  client_name?: string;
  collected_by: string; // Foreign key to collectors
  collector_name?: string;
  payment_method: PaymentMethod; // cash_collector or paystack_online
  payment_type: PaymentType; // debt_clearance, current_month, advance_payment
  amount_paid: number;
  base_tariff?: number;
  platform_fee?: number; // e.g. ₦200
  gateway_fee?: number; // Paystack fee if user-bearing
  total_charged?: number;
  target_months: string[]; // e.g. ["2026-11-01", "2026-12-01"]
  receipt_number: string; // e.g. "REC-KL-89102"
  notes?: string;
  created_at: string;
}

export interface ProcessPaymentPayload {
  customerCode: string;
  clientId?: string;
  clientName: string;
  collectorId: string;
  collectorName: string;
  paymentType: PaymentType;
  paymentMethod: PaymentMethod;
  amount: number;
  targetMonths: string[];
  notes?: string;
}

export interface ClientAdvancePaymentPayload {
  customerCode: string;
  clientId?: string;
  collectorId?: string;
  monthsCount: number;
  baseTariff: number;
  reference: string;
}

