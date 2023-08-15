export enum AuditActionType {
  UNAUTHORIZED_ACCESS = 'UnauthorizedAccess',
  ACCESS = 'Access',
  ADD = 'Add',
  UPDATE = 'Update',
  DELETE = 'Delete'
}

export enum AuditTrasactionStatus {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}

export enum MerchantType {
  INDIVIDUAL = 'Individual',
  SMALL_SHOP = 'Small Shop',
  CHAIN_STORE = 'Chain Store'
}

export enum MerchantAllowBlockStatus {
  PENDING = 'Pending',
  ALLOWED = 'Allowed',
  BLOCKED = 'Blocked'
}

export enum MerchantRegistrationStatus {
  WAITINGALIASGENERATION = 'WaitingAliasGeneration',
  DRAFT = 'Draft',
  REVIEW = 'Review',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum MerchantLocationType {
  PHYSICAL = 'Physical',
  VIRTUAL = 'Virtual',
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

export enum NumberOfEmployees {
  ONE_TO_FIVE = '1 - 5',
  SIX_TO_TEN = '6 - 10',
  ELEVEN_TO_FIFTY = '11 - 50',
  FIFTY_ONE_TO_ONE_HUNDRED = '51 - 100',
  HUNDRED_PLUS_PLUS = '100++',
}

export enum BusinessOwnerIDType {
  PASSPORT = 'Passport',
  NATIONAL_ID = 'National ID',
  SSN = 'SSN',
}
