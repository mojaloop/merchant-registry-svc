export * from './merchant-category-codes'

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

export enum MerchnatRegistrationStatus {
  DRAFT = 'Draft',
  REVIEWING = 'Reviewing',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
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
