export type UserRole = 'landlord' | 'tenant' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'blocked';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  blockedReason?: string;
  createdAt?: string;
}

export type PropertyType = 'apartment' | 'single_family' | 'commercial' | 'townhouse' | 'condo';

export interface Property {
  _id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  propertyType: PropertyType;
  imageUrl: string;
  description?: string;
  landlord?: User | string;
  totalUnits?: number;
  occupiedUnits?: number;
  vacantUnits?: number;
  totalRentPotential?: number;
  units?: Unit[];
  createdAt?: string;
}

export interface Unit {
  _id: string;
  property: Property | string;
  unitNumber: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  monthlyRent: number;
  status: 'vacant' | 'occupied';
  currentTenant?: User | null;
  amenities: string[];
  aiGeneratedDescription?: string;
  photoUrl?: string;
  createdAt?: string;
}

export interface Lease {
  _id: string;
  landlord: User | string;
  tenant: User;
  property: Property;
  unit: Unit;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'terminated';
  createdAt?: string;
  balanceSummary?: LeaseBalanceSummary;
}

export interface LeaseBalanceSummary {
  leaseId: string;
  monthlyRent: number;
  startDate: string;
  monthsElapsed: number;
  totalRentDue: number;
  totalPaid: number;
  balance: number;
  isOverdue: boolean;
  paymentStatus: 'PAID' | 'PARTIAL' | 'OVERDUE' | 'PREPAID';
  paymentsCount: number;
  recentPayments?: Payment[];
}

export type PaymentMethod = 'bank_transfer' | 'mobile_money' | 'cash' | 'card' | 'other';

export interface Payment {
  _id: string;
  tenant: User | string;
  landlord: User | string;
  property: Property | string;
  unit: Unit | string;
  lease: Lease | string;
  amount: number;
  paymentDate: string;
  forMonth: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  receiptNumber: string;
  notes?: string;
  createdAt?: string;
}

export type MaintenanceCategory =
  | 'plumbing'
  | 'electrical'
  | 'doors and locks'
  | 'appliances'
  | 'structure (roof, walls, windows)'
  | 'pests'
  | 'other';

export type MaintenanceUrgency = 'low' | 'normal' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'fixed';

export interface MaintenanceRequest {
  _id: string;
  tenant: User;
  landlord: User;
  property: Property;
  unit: Unit;
  originalDescription: string;
  photoUrl?: string;
  category: MaintenanceCategory;
  urgency: MaintenanceUrgency;
  is_emergency: boolean;
  aiSummary: string;
  aiFollowUpQuestion: string;
  tenantFollowUpAnswer?: string;
  status: MaintenanceStatus;
  statusNotes?: string;
  categoryOverriddenByLandlord?: boolean;
  urgencyOverriddenByLandlord?: boolean;
  emergencyHandledAt?: string;
  isEmergencyOverdue24h?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Complaint {
  _id: string;
  tenant: User;
  landlord: User;
  property?: Property;
  unit?: Unit;
  relatedMaintenanceRequest?: MaintenanceRequest;
  subject: string;
  description: string;
  urgency: 'normal' | 'urgent';
  status: 'open' | 'investigating' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

export interface Invite {
  _id: string;
  token: string;
  landlord: User;
  property: Property;
  unit: Unit;
  tenantEmail?: string;
  monthlyRent: number;
  leaseStartDate: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
  createdAt: string;
}

export interface AdminStats {
  totalLandlords: number;
  pendingLandlords: number;
  approvedLandlords: number;
  totalTenants: number;
  blockedUsers: number;
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  openRequests: number;
  inProgressRequests: number;
  fixedRequests: number;
  openEmergencies: number;
  unhandledEmergencies24h: number;
  openComplaints: number;
  totalRentCollected: number;
}

export interface EmailLogEntry {
  id: string;
  to: string;
  from: string;
  subject: string;
  timestamp: string;
  status: string;
  preview: string;
  mode?: string;
  resendId?: string;
}
