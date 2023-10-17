/* eslint-disable max-len */

import request from 'supertest'
import { type Application } from 'express'

export function testGetMerchantsFails (app: Application): void {
  it('should respond with 401 status with "Authorization Failed" message without "Authorization"', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .get('/api/v1/merchants')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Authorization Failed')
  })

  it('should respond with 401 status with "Authorization Failed" message with invalid "Authorization" header', async () => {
    // Arrange
    // Act
    const res = await request(app)
      .get('/api/v1/merchants')
      .set('Authorization', 'Bearer random-invalid-token')

    // Assert
    expect(res.statusCode).toEqual(401)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('Authorization Failed')
  })
}
