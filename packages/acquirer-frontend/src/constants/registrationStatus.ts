export const REGISTRATION_STATUS_COLORS = {
  Draft: 'gray',
  Review: 'warning',
  Approved: 'success',
  Rejected: 'danger',
}

export type RegistrationStatus = keyof typeof REGISTRATION_STATUS_COLORS
