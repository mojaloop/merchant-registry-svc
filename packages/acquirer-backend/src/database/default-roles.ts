import { PermissionsEnum } from '../types/permissions'

export const DefaultRoles = [
  {
    name: 'DFSP Super Admin',
    description: 'DFSP Super Admin Role',
    permissions: [
      PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM,
      PermissionsEnum.ACCESS_EDIT_MERCHANT_FORM,

      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PENDING_TABLE,
      PermissionsEnum.VIEW_REVERTED_TABLE,

      PermissionsEnum.CREATE_ROLES,
      PermissionsEnum.VIEW_ROLES,
      PermissionsEnum.EDIT_ROLES,

      PermissionsEnum.ASSIGNABLE_ADMIN_ROLES,
      PermissionsEnum.ASSIGNABLE_OPERATOR_ROLES,
      PermissionsEnum.ASSIGNABLE_AUDITOR_ROLES,

      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.VIEW_PORTAL_USERS,
      PermissionsEnum.EDIT_PORTAL_USERS,
      PermissionsEnum.DELETE_PORTAL_USERS,

      PermissionsEnum.EXPORT_MERCHANTS,

      PermissionsEnum.VIEW_AUDIT_LOGS,

      PermissionsEnum.EDIT_SERVER_LOG_LEVEL
    ]
  },
  {
    name: 'DFSP Admin',
    description: 'DFSP Admin Role',
    permissions: [
      PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM,
      PermissionsEnum.ACCESS_EDIT_MERCHANT_FORM,

      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PENDING_TABLE,
      PermissionsEnum.VIEW_REVERTED_TABLE,

      PermissionsEnum.ASSIGNABLE_OPERATOR_ROLES,
      PermissionsEnum.ASSIGNABLE_AUDITOR_ROLES,

      PermissionsEnum.VIEW_AUDIT_LOGS,

      PermissionsEnum.EXPORT_MERCHANTS
    ]
  },
  {
    name: 'DFSP Operator',
    description: 'DFSP Operator Role',
    permissions: [
      PermissionsEnum.ACCESS_CREATE_MERCHANT_FORM,
      PermissionsEnum.ACCESS_EDIT_MERCHANT_FORM,

      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PENDING_TABLE,
      PermissionsEnum.VIEW_REVERTED_TABLE,

      PermissionsEnum.EXPORT_MERCHANTS,

      PermissionsEnum.VIEW_AUDIT_LOGS
    ]
  },
  {
    name: 'DFSP Auditor',
    description: 'DFSP Auditor Role',
    permissions: [
      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.VIEW_PENDING_TABLE,
      PermissionsEnum.VIEW_REVERTED_TABLE,

      PermissionsEnum.VIEW_AUDIT_LOGS
    ]
  }
]
