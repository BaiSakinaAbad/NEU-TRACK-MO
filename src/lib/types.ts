
export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isBlocked: boolean;
  college?: string;
  lastLogin?: string;
  visitId?: string;
}

export type MOAStatus = 
  | 'APPROVED_SIGNED' 
  | 'APPROVED_NOTARIZATION' 
  | 'APPROVED_NO_NOTARIZATION'
  | 'PROCESSING_PARTNER'
  | 'PROCESSING_LEGAL'
  | 'PROCESSING_APPROVAL'
  | 'EXPIRED'
  | 'EXPIRING';

export const MOA_STATUS_LABELS: Record<MOAStatus, string> = {
  APPROVED_SIGNED: 'APPROVED (Signed by President)',
  APPROVED_NOTARIZATION: 'APPROVED (Ongoing Notarization)',
  APPROVED_NO_NOTARIZATION: 'APPROVED (No Notarization Needed)',
  PROCESSING_PARTNER: 'PROCESSING (Awaiting Partner Signature)',
  PROCESSING_LEGAL: 'PROCESSING (Legal Review)',
  PROCESSING_APPROVAL: 'PROCESSING (VPAA/OP Approval)',
  EXPIRED: 'EXPIRED',
  EXPIRING: 'EXPIRING',
};

export interface MOA {
  id: string;
  hteId: string;
  companyName: string;
  companyAddress: string;
  contactPerson: string;
  contactEmail: string;
  industryType: string;
  effectiveDate: string;
  expiryDate: string;
  status: MOAStatus;
  endorsedByCollege: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  operation: 'CREATE' | 'UPDATE' | 'SOFT_DELETE' | 'RECOVER';
  moaId: string;
  moaName: string;
  details: string;
  timestamp: string;
}
