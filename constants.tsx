
import { UserRole, Branch, User, SORStatus, SORPriority, SOR } from './types';

export const BRANCHES: Branch[] = [
  { id: 'B1', name: 'Doha West Bay', location: 'Doha', budget: 500000, spent: 120000 },
  { id: 'B2', name: 'Al Wakrah Campus', location: 'Al Wakrah', budget: 400000, spent: 85000 },
  { id: 'B3', name: 'Al Khor Branch', location: 'Al Khor', budget: 350000, spent: 45000 },
  { id: 'B4', name: 'Lusail School', location: 'Lusail', budget: 600000, spent: 210000 },
  { id: 'B5', name: 'The Pearl Academy', location: 'The Pearl', budget: 750000, spent: 300000 },
  { id: 'B6', name: 'Education City Hub', location: 'Al Rayyan', budget: 550000, spent: 110000 },
];

export const MOCK_USERS: User[] = [
  { id: 'U1', name: 'Admin One', email: 'super@edison.qa', role: UserRole.SUPER_ADMIN, branchId: 'GLOBAL' },
  { id: 'U2', name: 'Principal Sarah', email: 'principal.doha@edison.qa', role: UserRole.PRINCIPAL, branchId: 'B1' },
  { id: 'U3', name: 'Teacher Ahmed', email: 'ahmed@edison.qa', role: UserRole.TEACHER, branchId: 'B1', department: 'IT' },
  { id: 'U4', name: 'Procurement Lead', email: 'proc@edison.qa', role: UserRole.PROCUREMENT, branchId: 'GLOBAL' },
  { id: 'U5', name: 'Finance Controller', email: 'finance@edison.qa', role: UserRole.FINANCE, branchId: 'GLOBAL' },
  { id: 'U6', name: 'John CFO', email: 'cfo@edison.qa', role: UserRole.CFO, branchId: 'GLOBAL' },
  { id: 'U7', name: 'CEO Khalid', email: 'ceo@edison.qa', role: UserRole.CEO, branchId: 'GLOBAL' },
];

export const MOCK_SORS: SOR[] = [
  {
    id: 'SOR-2024-001',
    branchId: 'B1',
    requesterId: 'U3',
    requesterName: 'Teacher Ahmed',
    itemName: 'Interactive Smart Boards (x5)',
    quantity: 5,
    purpose: 'Classroom upgrade for Science block',
    estimatedCost: 15000,
    requiredDate: '2024-11-20',
    category: 'IT',
    priority: SORPriority.HIGH,
    status: SORStatus.SUBMITTED_TO_PRINCIPAL,
    createdAt: new Date().toISOString(),
    messages: [],
    // Fix: Added missing required property 'attachments'
    attachments: [],
    auditLog: [
      { action: 'SOR Created', user: 'Teacher Ahmed', timestamp: new Date().toISOString() }
    ]
  },
  {
    id: 'SOR-2024-002',
    branchId: 'B1',
    requesterId: 'U3',
    requesterName: 'Teacher Ahmed',
    itemName: 'Ergonomic Chairs',
    quantity: 20,
    purpose: 'Staff room refurbishment',
    estimatedCost: 8500,
    requiredDate: '2024-12-05',
    category: 'Admin',
    priority: SORPriority.MEDIUM,
    status: SORStatus.APPROVED_BY_PRINCIPAL,
    createdAt: new Date().toISOString(),
    messages: [
      { id: 'M1', userId: 'U2', userName: 'Principal Sarah', userRole: UserRole.PRINCIPAL, content: 'Approved for procurement sourcing.', timestamp: new Date().toISOString() }
    ],
    // Fix: Added missing required property 'attachments'
    attachments: [],
    auditLog: [
      { action: 'SOR Created', user: 'Teacher Ahmed', timestamp: new Date().toISOString() },
      { action: 'Approved by Principal', user: 'Principal Sarah', timestamp: new Date().toISOString() }
    ]
  }
];

export const CATEGORIES = ['IT', 'Stationery', 'Maintenance', 'HR', 'Admin', 'Science Lab', 'Sports'];

export const getApprovalPath = (cost: number) => {
  if (cost <= 500) return [UserRole.PRINCIPAL];
  if (cost <= 10000) return [UserRole.PRINCIPAL, UserRole.FINANCE];
  if (cost <= 50000) return [UserRole.PRINCIPAL, UserRole.FINANCE, UserRole.CFO];
  return [UserRole.PRINCIPAL, UserRole.FINANCE, UserRole.CFO, UserRole.CEO];
};
