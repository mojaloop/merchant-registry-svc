export * from './merchant-category-codes'
export * from './countries'

export enum AuditActionType {
  ACCESS = 'Access',
  ADD = 'Add',
  UPDATE = 'Update',
  DELETE = 'Delete'
}

export enum MerchantAllowBlockStatus {
  PENDING = 'Pending',
  ALLOWED = 'Allowed',
  BLOCKED = 'Blocked'
}

export enum MerchantRegistrationStatus {
  DRAFT = 'Draft',
  REVIEWING = 'Reviewing',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum MerchantLocationType {
  PHYSICAL = 'Physical',
  WEB = 'Web',
}

export enum DFSPType {
  BANK = 'Bank and Credit Union',
  MMO = 'Mobile Money Operator',
  PSP = 'Payment Service Provider',
  EMI = 'Electronic Money Issuer',
  MFI = 'Microfinance Institution',
  OTHER = 'Other'
}

export enum PortalUserStatus {
  FRESH = 'Fresh',
  INACTIVE = 'Inactive',
  ACTIVE = 'Active',
  BLOCKED = 'Blocked'
}

export enum PortalUserType {
  HUB = 'Hub',
  DFSP = 'DFSP',
  MERCHANT = 'Merchant'
}

export enum BusinessOwnerIDType {
  PASSPORT = 'Passport',
  NATIONAL_ID = 'National ID',
  SSN = 'SSN',
}
