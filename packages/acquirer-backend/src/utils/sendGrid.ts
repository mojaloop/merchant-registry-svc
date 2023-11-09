import sgMail, { type ResponseError } from '@sendgrid/mail'
import dotenv from 'dotenv'
import path from 'path'
import { AuditActionType, AuditTrasactionStatus } from 'shared-lib'
import logger from '../services/logger'
import { readEnv } from '../setup/readEnv'
import { audit } from './audit'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.test'), override: true })
}

sgMail.setApiKey(readEnv('SENDGRID_API_KEY', '<empty-api-key>') as string)

const backendAppUrl = readEnv('APP_URL', 'http://localhost:3000') as string

export async function sendVerificationEmail (
  email: string, token: string, role: string
): Promise<void> {
  const msg = {
    to: email,
    from: 'sithu.myo@thitsaworks.com',
    subject: 'Email Verification For Merchant Acquirer System',
    mail_settings: {
      sandbox_mode: {
        enable: process.env.node_env === 'test'
      }
    },
    html: `
      Dear User,<br/>
      <br/>
      Your email address has been registered and assigned as ${role} 
in Merchant Acquirer System.<br/>
      Please verify your email address below and set your password:<br/>
      <br/>
      <a 
        style="
          background-color: #4CAF50; 
          color: white; 
          padding: 14px 20px; margin: 8px 0; border: none; 
          cursor: pointer; width: 100%; text-align: center;
          text-decoration: none;"
        href="${backendAppUrl}/api/v1/users/verify?token=${token}" class="verify-button">Verify</a>
    `
  }
  const response = await sgMail.send(msg)
  logger.debug('Email sent: %o', response)

  await audit(
    AuditActionType.ACCESS,
    AuditTrasactionStatus.SUCCESS,
    'sendVerificationEmail',
    `Verification Email Sent: ${email} with token: ${token}`,
    'PortalUserEntity',
    {}, {}, null
  )
}

export async function checkSendGridAPIKeyValidity (apiKey: string): Promise<boolean> {
  sgMail.setApiKey(apiKey)

  try {
    const response = await sgMail.send({
      to: 'test@example.com', // Use a dummy email address
      from: 'test@example.com', // Use a dummy email address
      subject: 'Test',
      text: 'Test',
      mailSettings: {
        sandboxMode: {
          enable: true // Enables SendGrid sandbox mode to avoid actual email sending
        }
      }
    })
    logger.debug('SendGrid API Key validity check response: %o', response)

    return response[0]?.statusCode === 200
  } catch (error: any)/* istanbul ignore next */ {
    logger.error('Invalid SendGrid API Key: %o', error.response?.body)
    return false
  }
}
