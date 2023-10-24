import request from 'supertest'
import { type Application } from 'express'

export function testSucceedHealthCheck (app: Application): void {
  it('should respond 200 status with OK message', async () => {
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

// export function testSucceedHealthCheckSendGridService (app: Application): void {
//   it('should respond 200 status with OK message', async () => {
//   // Arrange
//     //
//   // Act
//     const res = await request(app)
//       .get('/api/v1/health-check/sendgrid-email-service')
//
//     // Assert
//     expect(res.statusCode).toEqual(200)
//     expect(res.body).toHaveProperty('message')
//     expect(res.body.message).toEqual('OK')
//   })
// }
