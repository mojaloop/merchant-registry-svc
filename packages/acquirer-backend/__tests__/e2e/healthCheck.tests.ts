import request from 'supertest'
import { type Application } from 'express'
const sgMail = require('@sendgrid/mail')

export function testSucceedHealthCheck (app: Application): void {
  it('should respond 200 status with OK message', async () => {
  // Arrange
  // Act
    const res = await request(app)
      .get('/api/v1/health-check')

    // Assert
    expect(res.statusCode).toEqual(200)
    expect(res.body).toHaveProperty('message')
    expect(res.body.message).toEqual('OK')
  })
}

export function testSucceedHealthCheckSendGridService (app: Application): void {
  describe('SendGrid healthCheck route Test', () => {
    beforeEach(() => {
    // Clearing all instances and calls to constructor and all methods:
      jest.clearAllMocks()
    })

    it('should respond 200 status with OK message for sendgrid email service', async () => {
    // Arrange
      // Mock the send method to simulate a successful response
      sgMail.send.mockResolvedValue([
        {
          statusCode: 200,
          body: '',
          headers: {}
        }
      ])
      // Act
      const res = await request(app)
        .get('/api/v1/health-check/sendgrid-email-service')

      // Assert
      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('OK')
    })

    it('should respond 500 with SendGrid API Key is Invalid message', async () => {
      // Arrange
      // Mock the send method to simulate a failure response
      sgMail.send.mockRejectedValue({
        response: {
          statusCode: 500,
          body: 'SendGrid API Key is Invalid'
        }
      })

      // Act
      const res = await request(app)
        .get('/api/v1/health-check/sendgrid-email-service')

      // Assert
      expect(res.statusCode).toEqual(500)
      expect(res.body).toHaveProperty('message')
      expect(res.body.message).toEqual('SendGrid API Key is Invalid')
    })
  })
}
