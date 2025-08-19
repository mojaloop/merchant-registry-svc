# Merchant Registration Process 

1. Clone the repo into local machine<br><br>

2. Create Sendgrid API Keys
- Register at SendGrid
- Create four Senders (with unique “from email”) at https://app.sendgrid.com/settings/sender_auth/senders/new
  - Sender - Used to send verification emails to other senders
  - Hub Admin
  - Dfsp Admin 
  - Dfsp Operator
- Create new API key at https://app.sendgrid.com/settings/api_keys
- Update the SENDGRID_API_KEY in the ./packages/acquirer-backend/.env file and docker-compose.yml file with the new API Key obtained 
- Update the SENDER_EMAIL in the ./packages/acquirer-backend/.env and docker-compose.yml<br><br>

3. Create reCAPTCHA Site Key and Secret Key
  - Register at Google reCAPTCHA and create new reCAPTCHA v2 Checkbox
  - Use Client Site Key and Update the VITE_RECAPTCHA_SITE_KEY in the ./packages/acquirer-frontend/.env and docker-compose.yml
  - Use Server Site Key and Update the RECAPTCHA_SECRET_KEY in the ./packages/acquirer-backend/.env and docker-compose.yml<br><br>

4. Run the command `docker-compose up –-build`<br><br>
5. Merchant registry portal should be accessible at -> http://localhost:5173<br><br>
6. Login to the portal(http://localhost:5173) as the Hub Super Admin
  - Create the Hub Admin by adding a new user at the user management page (http://localhost:5173/portal-user-management/user-management/add-new-user)- use the same email that was given while creating hub admin sender in sendgrid 
  - Upon successful creation of hub admin, the respective hub admin email will receive an email for verification and the password of the hub admin can be set <br><br>
7. After the hub admin is created and verified, login to the portal(http://localhost:5173) as the hub admin by filling in the credentials (email and password)
  - Create the Dfsp Admin by adding a new user at the user management page (http://localhost:5173/portal-user-management/user-management/add-new-user)- use the same email that was given while creating dfsp admin sender in sendgrid 
  - Upon successful creation of dfsp admin, the respective dfsp admin email will receive an email for verification and the password of the dfsp admin can be set <br><br>
8. After the dfsp admin is created and verified, login to the portal(http://localhost:5173) as the dfsp admin by filling in the credentials (email and password)
  - Create a new Merchant record by filling in the merchant registry form (http://localhost:5173/registry/registry-form)
  - Provide the details as needed 
  - Submit the form 
  - The Merchant will appear in the merchant records (http://localhost:5173/merchant-records/all-merchant-records)
  - Create the Dfsp Operator to approve the merchant by adding a new user at the user management page (http://localhost:5173/portal-user-management/user-management/add-new-user)- use the same email that was given while creating dfsp operator sender in sendgrid 
  - Upon successful creation of dfsp operator, the respective dfsp operator email will receive an email for verification and the password of the dfsp operator can be set <br><br>
9. After the dfsp operator is created and verified, login to the portal(http://localhost:5173) as the dfsp operator by filling in the credentials (email and password)
  - Approve the pending merchants in the merchant records http://localhost:5173/merchant-records/pending-merchant-records
  - View the approved merchants in the merchant record http://localhost:5173/merchant-records/alias-generated-merchant-records<br><br>
10. The merchant is successfully registered <br><br>
