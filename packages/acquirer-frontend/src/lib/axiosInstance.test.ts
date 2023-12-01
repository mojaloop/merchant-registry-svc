import MockAdapter from 'axios-mock-adapter'

import instance from './axiosInstance'

describe('Axios Interceptor', () => {
  it("should set auth token if it's logged in", async () => {
    // mock log in
    localStorage.setItem('token', 'token')

    const mock = new MockAdapter(instance)
    mock.onGet('/users/profile').reply(200, {
      id: 5,
      name: 'DFSP 1 Super Admin 1',
    })

    const response = await instance.get('/users/profile')

    expect(response.config.headers.Authorization).toBeTruthy()
  })

  it('should not set auth token when the API route is "/users/login"', async () => {
    const mock = new MockAdapter(instance)
    mock.onPost('/users/login').reply(200, { token: 'token' })

    const response = await instance.post('/users/login', {
      email: 'john@gmail.com',
      password: 'password',
    })

    expect(response.config.headers.Authorization).toBeFalsy()
  })

  it('should set auth token when the API route is "/users/reset-password"', async () => {
    const mock = new MockAdapter(instance)
    mock.onPut('/users/reset-password').reply(200)

    const response = await instance.put('/users/reset-password', {
      password: 'password',
    })

    expect(response.config.headers.Authorization).toBeTruthy()
  })
})
