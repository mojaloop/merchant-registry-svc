import { PermissionsEnum } from '../types/permissions'

export const DefaultRoles = [
  {
    name: 'Hub Admin',
    description: 'Hub Admin Role',
    permissions: [
      PermissionsEnum.VIEW_DFSPS,
      PermissionsEnum.CREATE_DFSPS,
      PermissionsEnum.EDIT_DFSPS,
      PermissionsEnum.DELETE_DFSPS,

      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.VIEW_PORTAL_USERS,
      PermissionsEnum.EDIT_PORTAL_USERS,
      PermissionsEnum.DELETE_PORTAL_USERS,

      PermissionsEnum.CREATE_ROLES,
      PermissionsEnum.VIEW_ROLES,
      PermissionsEnum.EDIT_ROLES,

      PermissionsEnum.VIEW_AUDIT_LOGS,

      PermissionsEnum.EDIT_SERVER_LOG_LEVEL
    ]
  },
  {
    name: 'DFSP Super Admin',
    description: 'DFSP Super Admin Role',
    permissions: [
      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.CREATE_ROLES, // TODO: Remove this permission when Hub User is ready.
      PermissionsEnum.VIEW_ROLES,

      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.VIEW_PORTAL_USERS,
      PermissionsEnum.EDIT_PORTAL_USERS,
      PermissionsEnum.DELETE_PORTAL_USERS,

      PermissionsEnum.EXPORT_MERCHANTS,

      PermissionsEnum.VIEW_AUDIT_LOGS
    ]
  },
  {
    name: 'DFSP Admin',
    description: 'DFSP Admin Role',
    permissions: [
      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_ROLES,

      PermissionsEnum.VIEW_PORTAL_USERS,
      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.EDIT_PORTAL_USERS,
      PermissionsEnum.DELETE_PORTAL_USERS,

      PermissionsEnum.VIEW_AUDIT_LOGS,

      PermissionsEnum.EXPORT_MERCHANTS
    ]
  },
  {
    name: 'DFSP Operator',
    description: 'DFSP Operator Role',
    permissions: [
      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PORTAL_USERS,

      PermissionsEnum.EXPORT_MERCHANTS
    ]
  },
  {
    name: 'DFSP Auditor',
    description: 'DFSP Auditor Role',
    permissions: [
      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.VIEW_PORTAL_USERS,

      PermissionsEnum.VIEW_AUDIT_LOGS
    ]
  }
]
