export const REGISTRATION_STATUS_COLORS = {
  'Waiting For Alias Generation': 'success',
  Draft: 'gray',
  Review: 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Reverted: 'danger',
}

export type RegistrationStatus = keyof typeof REGISTRATION_STATUS_COLORS
