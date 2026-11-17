// src/types/client.ts

export interface Cluster {
  id: string | number;
  name: string;
  code?: string;
  schedule?: string;
  pickup_days?: string[] | string;
  pickup_window?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPANDING' | string;
  operating_hours?: string;
  description?: string;
  base_tariff?: number;
}

export interface AssignedCollector {
  id: string | number;
  name: string;
  company_name?: string;
  phone: string;
  phone_number?: string;
  vehicle_info?: string;
  vehicle_plate?: string;
  vehicle_type?: string;
  status?: 'ACTIVE' | 'EN_ROUTE' | 'ON_DUTY' | 'OFF_DUTY' | 'COMPLETED' | string;
  rating?: number;
  avatar_url?: string;
  dispatch_zone?: string;
}

export interface ClientUser {
  id: string | number;
  phone_number: string;
  phoneNumber?: string;
  full_name?: string;
  fullName?: string;
  name?: string;
  email?: string;
  username?: string;
  address?: string;
  is_temporary_password: boolean;
  role?: 'customer' | 'household' | 'client' | string;
  cluster?: Cluster | null;
  assigned_collector?: AssignedCollector | null;
  total_pickups?: number;
  impact_score?: number;
  customer_code?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginPayload {
  phone_number: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access?: string;
  refresh?: string;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user: ClientUser;
  detail?: string;
  message?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password?: string;
}

export interface ChangePasswordResponse {
  success?: boolean;
  message?: string;
  detail?: string;
  user?: Partial<ClientUser>;
}

export interface ClientTelemetryData {
  next_pickup_date?: string;
  active_dispatches?: number;
  waste_diverted_kg?: number;
  collection_status?: 'SCHEDULED' | 'PENDING' | 'EN_ROUTE' | 'COMPLETED' | 'MISSED' | string;
  last_collection?: string;
  estimated_arrival?: string;
  rating?: number;
}

