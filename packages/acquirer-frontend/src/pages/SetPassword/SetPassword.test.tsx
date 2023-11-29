import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { SetPassword } from '..'

vi.mock('@/api/hooks/auth', () => ({
  useSetPassword: () => ({
    isLoading: false,
    mutate: () => vi.fn(),
  }),
}))

describe('SetPassword', () => {
  it('should render the correct password visibility toggle icon', () => {
    render(
      <TestWrapper>
        <SetPassword />
      </TestWrapper>
    )

    let showPasswordIconButton = screen.getByLabelText('Show password')
    fireEvent.click(showPasswordIconButton)
    let hidePasswordIconButton: HTMLElement | null =
      screen.getByLabelText('Hide password')
    expect(hidePasswordIconButton).toBeInTheDocument()

    fireEvent.click(hidePasswordIconButton)
    showPasswordIconButton = screen.getByLabelText('Show password')
    hidePasswordIconButton = screen.queryByLabelText('Hide password')
    expect(showPasswordIconButton).toBeInTheDocument()
    expect(hidePasswordIconButton).toBeNull()
  })

  it('should render the correct confirm password visibility toggle icon', () => {
    render(
      <TestWrapper>
        <SetPassword />
      </TestWrapper>
    )

    let showPasswordIconButton = screen.getByLabelText('Show confirm password')
    fireEvent.click(showPasswordIconButton)
    let hidePasswordIconButton: HTMLElement | null = screen.getByLabelText(
      'Hide confirm password'
    )
    expect(hidePasswordIconButton).toBeInTheDocument()

    fireEvent.click(hidePasswordIconButton)
    showPasswordIconButton = screen.getByLabelText('Show confirm password')
    hidePasswordIconButton = screen.queryByLabelText('Hide confirm password')
    expect(showPasswordIconButton).toBeInTheDocument()
    expect(hidePasswordIconButton).toBeNull()
  })

  it('should call "setPassword.mutate" function when "Confirm" button is clicked', async () => {
    const setPasswordSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <SetPassword />
      </TestWrapper>
    )

    const newPasswordInput: HTMLInputElement = screen.getByLabelText('New Password')
    const confirmPasswordInput: HTMLInputElement =
      screen.getByLabelText('Confirm Password')
    const confirmButton: HTMLButtonElement = screen.getByText('Confirm')

    fireEvent.change(newPasswordInput, { target: { value: 'password' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password' } })
    fireEvent.submit(confirmButton)

    await waitFor(() => Promise.resolve)

    expect(setPasswordSpy).toHaveBeenCalled()
  })
})
