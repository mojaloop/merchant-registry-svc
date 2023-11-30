import { PermissionsEnum } from '../types/permissions'

export const DefaultRoles = [
  {
    name: 'Hub Super Admin',
    description: 'Hub Super Admin Role',
    permissions: [
      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.CREATE_HUB_ADMIN
    ]
  },
  {
    name: 'Hub Admin',
    description: 'Hub Admin Role',
    permissions: [
      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.CREATE_HUB_ADMIN,
      PermissionsEnum.CREATE_DFSP_SUPER_AMDIN,

      PermissionsEnum.VIEW_DFSPS,
      PermissionsEnum.CREATE_DFSPS,
      PermissionsEnum.EDIT_DFSPS,
      PermissionsEnum.DELETE_DFSPS,

      PermissionsEnum.VIEW_PORTAL_USERS,
      PermissionsEnum.VIEW_MERCHANTS,

      PermissionsEnum.VIEW_ROLES,

      PermissionsEnum.VIEW_AUDIT_LOGS,

      PermissionsEnum.EDIT_SERVER_LOG_LEVEL
    ]
  },
  {
    name: 'DFSP Super Admin',
    description: 'DFSP Super Admin Role',
    permissions: [
      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.CREATE_DFSP_ADMIN,
      PermissionsEnum.CREATE_DFSP_OPERATOR,
      PermissionsEnum.CREATE_DFSP_AUDITOR,

      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      // PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PORTAL_USERS,

      PermissionsEnum.EXPORT_MERCHANTS,

      PermissionsEnum.VIEW_AUDIT_LOGS
    ]
  },
  {
    name: 'DFSP Admin',
    description: 'DFSP Admin Role',
    permissions: [
      PermissionsEnum.CREATE_PORTAL_USERS,
      PermissionsEnum.CREATE_DFSP_OPERATOR,
      PermissionsEnum.CREATE_DFSP_AUDITOR,

      PermissionsEnum.APPROVE_MERCHANTS,
      PermissionsEnum.REJECT_MERCHANTS,
      PermissionsEnum.REVERT_MERCHANTS,

      PermissionsEnum.VIEW_MERCHANTS,
      PermissionsEnum.CREATE_MERCHANTS,
      PermissionsEnum.EDIT_MERCHANTS,
      // PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PORTAL_USERS,

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
      // PermissionsEnum.DELETE_MERCHANTS,

      PermissionsEnum.VIEW_PORTAL_USERS,

      PermissionsEnum.VIEW_AUDIT_LOGS,
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
