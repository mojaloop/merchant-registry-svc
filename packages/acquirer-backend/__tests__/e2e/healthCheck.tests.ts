import request from 'supertest'
import { type Application } from 'express'

export function testSucceedHealthCheck (app: Application): void {
  it('should respond with 201 status and the created merchant', async () => {
  // Arrange
    //
  // Act
    const res = await request(app)
      .get('/api/v1/health-check')

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
  })
}
