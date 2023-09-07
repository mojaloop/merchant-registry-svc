## Merchant Registry System

This repository is dedicated to the development of a merchant payment system
using Mojaloop for seamless merchant transactions. The system allows consumers
to pay merchants using mobile wallets with interoperability.

In this current phase, we are focused on implementing the acquiring system and
merchant registry, which will serve as an oracle in the payment process.

The Mojaloop's Account Lookup Service will interact with the merchant registry
and proceed with the necessary steps in the payment transaction.

##### For more information on Requirements, Diagrams, and User Stories

[Merchant Payment Documentation Repository](https://github.com/mojaloop/merchant-payment-docs/tree/master)

## Workspaces

* [Shared Library](./packages/shared-lib)
  * Usable Types, Enums, Methods etc..
* [Merchant Acquirer Backend Service](./packages/acquirer-backend)
  * Backend Service for handling Merchants Informations.
* [Merchant Acquirer Frontend](./packages/acquirer-frontend)
  * Portal for Hub Users, Makers, Checkers to manage and onboarding Merchants.
* [Merchant Registry Backend](./packages/acquirer-backend)
  * Will Serve as Oracle for Mojaloop ALS.

## Deploying on Docker
* Requirements
    - `docker` and `docker-compose`
    - [SendGrid](https://sendgrid.com/) API key is required for Email Verification 
        - Register at [SendGrid](https://sendgrid.com/) and create new API Key at https://app.sendgrid.com/settings/api_keys
        - Open `.env` file inside `packages/acquirer-backend/` and update the `SENDGRID_API_KEY` with the new API Key obtained from https://app.sendgrid.com/settings/api_keys

* Run 
    ```bash 
    $ docker-compose up --build
    ```
    * Acquirer Frontend should be running at: http://localhost:5173
    * Acquirer Backend should be running at: http://localhost:5555/api/v1/health-check
        * Swagger API Doc should be at: http://localhost:5555/docs
    * MinIO S3 Compatible Storage Server is running at http://minio:9000 (Service).
        * To be able to download document file, add this line `127.0.0.1 minio` in the `/etc/hosts`, otherwise `minio:9000` link will be unreachable.

## ERD Design
![ERD Design](./images/Entity-Relations-Diagram.png)
