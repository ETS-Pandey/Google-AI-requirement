
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  PRINCIPAL = 'PRINCIPAL',
  TEACHER = 'TEACHER',
  PROCUREMENT = 'PROCUREMENT',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  CFO = 'CFO',
  CEO = 'CEO',
  MAINTENANCE = 'MAINTENANCE',
  HR = 'HR'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branchId: string | 'GLOBAL';
  department?: string;
}

export enum SORStatus {
  SUBMITTED_TO_PRINCIPAL = 'Submitted to Principal',
  CLARIFICATION_REQUIRED = 'Clarification Required',
  APPROVED_BY_PRINCIPAL = 'Approved by Principal',
  REJECTED = 'Rejected',
  IN_PROCUREMENT_REVIEW = 'In Procurement Review',
  INVENTORY_CHECK = 'Inventory Check',
  PENDING_FINANCE = 'Pending Finance',
  PENDING_CFO = 'Pending CFO',
  PENDING_CEO = 'Pending CEO',
  APPROVED_FOR_PO = 'Approved for PO',
  PO_GENERATED = 'PO Generated',
  DELIVERED = 'Delivered',
  PAID = 'Paid'
}

export enum SORPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface SORAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: string;
}

export interface SORMessage {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  timestamp: string;
  attachments?: SORAttachment[];
}

export interface SOR {
  id: string;
  branchId: string;
  requesterId: string;
  requesterName: string;
  itemName: string;
  quantity: number;
  purpose: string;
  estimatedCost: number;
  requiredDate: string;
  category: string;
  priority: SORPriority;
  status: SORStatus;
  createdAt: string;
  messages: SORMessage[];
  attachments: SORAttachment[];
  vendorId?: string;
  vendorName?: string;
  auditLog: { action: string; user: string; timestamp: string; comment?: string }[];
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  budget: number;
  spent: number;
}
