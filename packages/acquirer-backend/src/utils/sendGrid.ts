import sgMail from '@sendgrid/mail'
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
