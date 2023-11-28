import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, it, vi } from 'vitest'

import TestWrapper from '@/__tests__/TestWrapper'
import { Login } from '..'

vi.mock('@/api/hooks/auth', () => ({
  useLogin: () => ({
    isLoading: false,
    mutate: () => vi.fn(),
  }),
}))

describe('Login', () => {
  it('should render the correct password toggle icon', () => {
    render(
      <TestWrapper>
        <Login />
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

  it('should have correct submitted values in onSubmit function', () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    const emailInput: HTMLInputElement = screen.getByLabelText('Email')
    const passwordInput: HTMLInputElement = screen.getByLabelText('Password')
    const loginButton: HTMLButtonElement = screen.getByText('Log In')
    const loginForm: HTMLFormElement = screen.getByTestId('login-form')

    fireEvent.change(emailInput, { target: { value: 'john@gmail.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.submit(loginButton)

    const formData = new FormData(loginForm)
    const [email, password] = formData.entries()

    expect(emailInput.value).toEqual(email[1])
    expect(passwordInput.value).toEqual(password[1])
  })

  it('should call "login.mutate" function when "Log In" button is clicked', async () => {
    const loginSpy = vi.spyOn(vi, 'fn')

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    )

    const emailInput: HTMLInputElement = screen.getByLabelText('Email')
    const passwordInput: HTMLInputElement = screen.getByLabelText('Password')
    const loginButton: HTMLButtonElement = screen.getByText('Log In')

    fireEvent.change(emailInput, { target: { value: 'john@gmail.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password' } })
    fireEvent.submit(loginButton)

    await waitFor(() => Promise.resolve)

    expect(loginSpy).toHaveBeenCalled()
  })
})
