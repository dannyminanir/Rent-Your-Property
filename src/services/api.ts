import {
  User,
  Property,
  Unit,
  Lease,
  Payment,
  MaintenanceRequest,
  Complaint,
  Invite,
  AdminStats,
  EmailLogEntry,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

function getHeaders() {
  const token = localStorage.getItem('rentpulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({ message: 'Invalid response from server' }));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async registerLandlord(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register/landlord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async getInviteDetails(token: string) {
    const res = await fetch(`${API_BASE}/auth/invite/${token}`);
    return handleResponse<{ invite: Invite }>(res);
  },

  async registerTenantWithInvite(data: { token: string; name: string; email: string; password: string; phone?: string }) {
    const res = await fetch(`${API_BASE}/auth/register/tenant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return handleResponse<{ user: User; lease?: Lease }>(res);
  },

  // Properties & Units
  async getProperties() {
    const res = await fetch(`${API_BASE}/properties`, { headers: getHeaders() });
    return handleResponse<{ properties: Property[] }>(res);
  },

  async createProperty(data: Partial<Property>) {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ property: Property; message: string }>(res);
  },

  async updateProperty(id: string, data: Partial<Property>) {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ property: Property; message: string }>(res);
  },

  async deleteProperty(id: string) {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse<{ message: string }>(res);
  },

  async getUnitsByProperty(propertyId: string) {
    const res = await fetch(`${API_BASE}/units/property/${propertyId}`, { headers: getHeaders() });
    return handleResponse<{ units: Unit[] }>(res);
  },

  async getAllLandlordUnits() {
    const res = await fetch(`${API_BASE}/units/all`, { headers: getHeaders() });
    return handleResponse<{ units: Unit[] }>(res);
  },

  async createUnit(data: Partial<Unit> & { propertyId: string }) {
    const res = await fetch(`${API_BASE}/units`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ unit: Unit; message: string }>(res);
  },

  async updateUnit(id: string, data: Partial<Unit>) {
    const res = await fetch(`${API_BASE}/units/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ unit: Unit; message: string }>(res);
  },

  async generateAiUnitDescription(id: string) {
    const res = await fetch(`${API_BASE}/units/${id}/generate-ai-description`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<{ description: string; message: string }>(res);
  },

  async createTenantInvite(data: { unitId: string; tenantEmail?: string; leaseStartDate?: string; customRent?: number }) {
    const res = await fetch(`${API_BASE}/units/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{
      inviteLink: string;
      token: string;
      emailSent: boolean;
      emailError?: string;
      message: string;
    }>(res);
  },

  // Rent & Leases
  async getLandlordLeases() {
    const res = await fetch(`${API_BASE}/rent/leases`, { headers: getHeaders() });
    return handleResponse<{ leases: Lease[] }>(res);
  },

  async recordPayment(data: {
    tenantId?: string;
    leaseId?: string;
    amount: number;
    paymentDate?: string;
    forMonth?: string;
    paymentMethod?: string;
    reference?: string;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/rent/payments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ payment: Payment; message: string }>(res);
  },

  async getTenantPortalData() {
    const res = await fetch(`${API_BASE}/rent/tenant-portal`, { headers: getHeaders() });
    return handleResponse<{
      hasActiveLease: boolean;
      lease?: Lease;
      unit?: Unit;
      property?: Property;
      landlord?: User;
      balanceSummary?: Lease['balanceSummary'];
      paymentHistory?: Payment[];
      message?: string;
    }>(res);
  },

  async getPaymentHistory(params?: { leaseId?: string; unitId?: string }) {
    const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    const res = await fetch(`${API_BASE}/rent/payments/history?${qs}`, { headers: getHeaders() });
    return handleResponse<{ payments: Payment[] }>(res);
  },

  // Maintenance & AI Triage
  async createMaintenanceRequest(data: { description: string; photoUrl?: string }) {
    const res = await fetch(`${API_BASE}/maintenance`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{
      request: MaintenanceRequest;
      message: string;
      emergencyAlert?: { is_emergency: boolean; warning: string; emergencyNumber: string } | null;
    }>(res);
  },

  async answerFollowUpQuestion(requestId: string, answer: string) {
    const res = await fetch(`${API_BASE}/maintenance/${requestId}/answer-follow-up`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ answer }),
    });
    return handleResponse<{ request: MaintenanceRequest; message: string }>(res);
  },

  async getLandlordRequests(filters?: { status?: string; category?: string; urgency?: string }) {
    const qs = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const res = await fetch(`${API_BASE}/maintenance/landlord-requests?${qs}`, { headers: getHeaders() });
    return handleResponse<{ requests: MaintenanceRequest[] }>(res);
  },

  async getTenantRequests() {
    const res = await fetch(`${API_BASE}/maintenance/my-requests`, { headers: getHeaders() });
    return handleResponse<{ requests: MaintenanceRequest[] }>(res);
  },

  async updateRequestStatus(id: string, status: string, statusNotes?: string) {
    const res = await fetch(`${API_BASE}/maintenance/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, statusNotes }),
    });
    return handleResponse<{ request: MaintenanceRequest; message: string }>(res);
  },

  async overrideTriage(id: string, data: { category?: string; urgency?: string }) {
    const res = await fetch(`${API_BASE}/maintenance/${id}/override-triage`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ request: MaintenanceRequest; message: string }>(res);
  },

  async testTriageSimulation(text: string) {
    const res = await fetch(`${API_BASE}/maintenance/test-triage`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse<{ input: string; triage: any }>(res);
  },

  // Complaints
  async submitComplaint(data: { subject: string; description: string; urgency?: string; relatedMaintenanceRequestId?: string }) {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<{ complaint: Complaint; message: string }>(res);
  },

  async getTenantComplaints() {
    const res = await fetch(`${API_BASE}/complaints/my-complaints`, { headers: getHeaders() });
    return handleResponse<{ complaints: Complaint[] }>(res);
  },

  async getAllComplaints() {
    const res = await fetch(`${API_BASE}/complaints`, { headers: getHeaders() });
    return handleResponse<{ complaints: Complaint[] }>(res);
  },

  async updateComplaintStatus(id: string, status: string, adminNotes?: string) {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return handleResponse<{ complaint: Complaint; message: string }>(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, { headers: getHeaders() });
    return handleResponse<{ stats: AdminStats }>(res);
  },

  async getPendingLandlords() {
    const res = await fetch(`${API_BASE}/admin/pending-landlords`, { headers: getHeaders() });
    return handleResponse<{ pendingLandlords: User[] }>(res);
  },

  async approveLandlord(id: string) {
    const res = await fetch(`${API_BASE}/admin/approve-landlord/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse<{ landlord: User; message: string }>(res);
  },

  async rejectLandlord(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/admin/reject-landlord/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ landlord: User; message: string }>(res);
  },

  async getAllUsers(filters?: { role?: string; status?: string; search?: string }) {
    const qs = filters ? new URLSearchParams(filters as Record<string, string>).toString() : '';
    const res = await fetch(`${API_BASE}/admin/users?${qs}`, { headers: getHeaders() });
    return handleResponse<{ users: User[] }>(res);
  },

  async blockUser(id: string, reason: string) {
    const res = await fetch(`${API_BASE}/admin/block-user/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ reason }),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },

  async unblockUser(id: string) {
    const res = await fetch(`${API_BASE}/admin/unblock-user/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse<{ user: User; message: string }>(res);
  },

  async getAllPropertiesAdmin() {
    const res = await fetch(`${API_BASE}/admin/properties`, { headers: getHeaders() });
    return handleResponse<{ properties: Property[] }>(res);
  },

  async getUnhandledEmergencies() {
    const res = await fetch(`${API_BASE}/admin/unhandled-emergencies`, { headers: getHeaders() });
    return handleResponse<{
      criticalOverdue24h: MaintenanceRequest[];
      activeRecentEmergencies: MaintenanceRequest[];
      totalUnhandledOverdue: number;
    }>(res);
  },

  async getEmailLogs() {
    const res = await fetch(`${API_BASE}/admin/emails`, { headers: getHeaders() });
    return handleResponse<{ emails: EmailLogEntry[] }>(res);
  },

};
