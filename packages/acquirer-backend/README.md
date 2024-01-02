## Prerequisites

- MySQL/MariaDB
  - Database name should exists/create as defined inside `.env` file.
  - Database username/password should exists/create as defined inside `.env` file.
- [MinIO (S3 Compatible Object Storage Server)](https://min.io/) (For Local Development and Testing PDF uploads)
  - Default values are already configured inside `.env`.
    - Should use AWS S3 configration when in Production.
  - Running Local S3 Object Storage Server with `minio server s3-storage`
    - `s3-storage` is the name of the directory.

## Run with

1. `npm install`
2. `npm run start` when you are inside `<rootProject>/packages/acquirer-backed`
   or
   <br />
   `npm run acquirer-backend:start` when you are at `rootProject` directory.

## Integration Testings

- Make sure MySQL/MaridaDB database name, username, password are configured
  according to the `.env.test` file.
- Make sure S3 Minio Server is running... either

- `npm run test` when you are inside `<rootProject>/packages/acquirer-backed`
- `npm run test -w acquirer-backend` when you are at `rootProject` directory.

## Configuration

| Environment Variables                    | Default Values                       | Description                                                                            |
| ---------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------- |
| `NODE_ENV`                               | `development`                        | Sets the environment for Node.js. Common values: `development`, `production`, `test`.  |
| `APP_URL`                                | `http://localhost:5555`              | URL of the app, used for features like email verification.                             |
| `HOST`                                   | `0.0.0.0`                            | Host IP address for the server.                                                        |
| `PORT`                                   | `5555`                               | Port number for the server.                                                            |
| `FRONTEND_SET_PASSWORD_URL`              | `http://localhost:5173/set-password` | URL for redirecting to set password in frontend, typically used in email verification. |
| `JWT_SECRET`                             | `merchant-acquirer-jwt_secret`       | Secret key for JWT. _(Change in production)_                                           |
| `JWT_EXPIRES_IN`                         | `1d`                                 | Expiration time for JWT. Common formats: `1d` for 1 day, `2h` for 2 hours, etc.        |
| `RECAPTCHA_SECRET_KEY`                   | `recaptcha-secret-key`               | Backend Secret key for Google reCAPTCHA. (Change in production)                        |
| `RECAPTCHA_ENABLED`                      | `false`                              | Enable or disable Google reCAPTCHA.                                                    |
| **API Key Generation Configuration**     |                                      |                                                                                        |
| `API_KEY_LENGTH`                         | `64`                                 | Length of the generated API key.                                                       |
| `API_KEY_PREFIX`                         | `MR`                                 | Prefix for the API key.                                                                |
| **MySQL Database Configuration**         |                                      |                                                                                        |
| `DB_HOST`                                | `localhost`                          | MySQL database server host.                                                            |
| `DB_PORT`                                | `3306`                               | Port for the MySQL database.                                                           |
| `DB_USERNAME`                            | `merchant_acquirer_user`             | Username for MySQL database.                                                           |
| `DB_PASSWORD`                            | `password`                           | Password for MySQL database.                                                           |
| `DB_DATABASE`                            | `merchant_acquirer_db`               | Name of the MySQL database.                                                            |
| **RabbitMQ Configuration**               |                                      |                                                                                        |
| `RABBITMQ_HOST`                          | `127.0.0.1`                          | RabbitMQ server host.                                                                  |
| `RABBITMQ_PORT`                          | `5672`                               | Port for RabbitMQ server.                                                              |
| `RABBITMQ_USERNAME`                      | `guest`                              | Username for RabbitMQ server. _(Change in production)_                                 |
| `RABBITMQ_PASSWORD`                      | `guest`                              | Password for RabbitMQ server. _(Change in production)_                                 |
| `RABBITMQ_QUEUE`                         | `acquirer_to_registry`               | Name of the RabbitMQ queue.                                                            |
| `RABBITMQ_REPLY_QUEUE`                   | `registry_reply_acquirer`            | Name of the RabbitMQ reply queue.                                                      |
| **S3/Minio Configuration**               |                                      |                                                                                        |
| `S3_ENDPOINT`                            | `localhost`                          | S3 or Minio server endpoint.                                                           |
| `S3_PORT`                                | `9000`                               | Port for S3 or Minio server. `443` for AWS S3 with HTTPS.                              |
| `S3_ACCESS_KEY`                          | `minioadmin`                         | Access key for S3 or Minio.                                                            |
| `S3_SECRET_KEY`                          | `minioadmin`                         | Secret key for S3 or Minio.                                                            |
| `S3_REGION`                              | `us-east-1`                          | Region for S3. Ignored by Minio.                                                       |
| `S3_USE_SSL`                             | `false`                              | Set to `true` for HTTPS with AWS S3.                                                   |
| `S3_MERCHANT_BUCKET_NAME`                | `merchant-documents`                 | Name of the S3 bucket for merchant documents.                                          |
| **SendGrid Configuration**               |                                      |                                                                                        |
| `SENDGRID_API_KEY`                       | `add-api-key-here`                   | API key for SendGrid. Used for services like email verification.                       |
| **Log Configuration**                    |                                      |                                                                                        |
| `LOG_PATH`                               | `./logs`                             | Path for storing logs.                                                                 |
| `LOG_LEVEL`                              | `debug`                              | Logging level. Values: `trace`, `debug`, `info`, `warn`, `error`, etc.                 |
| `LOG_DISABLED`                           | `false`                              | Enable or disable logging.                                                             |
| **General API Rate Limit Configuration** |                                      |                                                                                        |
| `GENERAL_RATE_LIMIT_WINDOW`              | `15m`                                | The time window for general API rate limiting, in minutes.                             |
| `GENERAL_RATE_LIMIT_MAX`                 | `100`                                | The maximum number of requests allowed in the time window.                             |
| **Login API Rate Limit Configuration**   |                                      |                                                                                        |
| `AUTH_RATE_LIMIT_WINDOW`                 | `1h`                                 | The time window for login API rate limiting, in minutes.                               |
| `AUTH_RATE_LIMIT_MAX`                    | `10`                                 | The maximum number of requests allowed in the time window.                             |
