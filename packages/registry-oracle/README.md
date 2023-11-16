## Prerequisites

- MySQL/MariaDB
  - Database name should exists/create as defined inside `.env` file.
  - Database username/password should exists/create as defined inside `.env` file.

## Run with
1. `npm install`
2. `npm run start` when you are inside `<rootProject>/packages/registry-oracle`
    or
    <br />
`npm run registry-oracle:start` when you are at `rootProject` directory.

## Configuration

| Environment Variables          | Default Values        | Description |
| ------------------------------ | --------------------- | ----------- |
| `NODE_ENV`                     | `development`         | Specifies the environment in which the Node.js app is running. Common values are `development`, `production`, `test`, etc. |
| `HOST`                         | `0.0.0.0`             | The host IP address on which the server will listen. |
| `PORT`                         | `8888`                | The port on which the server will listen. |
| **MySQL Database Configuration** |                     | |
| `DB_HOST`                      | `localhost`           | Hostname or IP address of the MySQL database server. |
| `DB_PORT`                      | `3306`                | Port number for the MySQL database server. |
| `DB_USERNAME`                  | `registry_oracle_user` | Username for MySQL database authentication. |
| `DB_PASSWORD`                  | `password`            | Password for MySQL database authentication. |
| `DB_DATABASE`                  | `merchant_registry_oracle` | Name of the database to use in MySQL. |
| **RabbitMQ Configuration**       |                     | |
| `RABBITMQ_HOST`                | `127.0.0.1`           | Hostname or IP address of the RabbitMQ server. |
| `RABBITMQ_PORT`                | `5672`                | Port number for the RabbitMQ server. |
| `RABBITMQ_USERNAME`            | `guest`               | Username for RabbitMQ server authentication. *(Change in production)* |
| `RABBITMQ_PASSWORD`            | `guest`               | Password for RabbitMQ server authentication. *(Change in production)* |
| `RABBITMQ_QUEUE`               | `acquirer_to_registry` | Name of the RabbitMQ queue to use. |
| **Alias Generation Configuration** |                   | |
| `ALIAS_CHECKOUT_MAX_DIGITS`    | `6`                   | Maximum number of digits for alias checkout. |
| **API Key Generation Configuration** |                | |
| `API_KEY_LENGTH`               | `64`                  | Length of the generated API key. |
| `API_KEY_PREFIX`               | `MR`                  | Prefix for the API key. (`MR` for Merchant Registry) |
| **Log Configuration**            |                     | |
| `LOG_PATH`                     | `./logs`              | Path where logs will be stored. |
| `LOG_LEVEL`                    | `debug`               | Level of logging detail. Common values are `trace`, `debug`, `info`, `warn`, `error`, etc. |
| `LOG_DISABLED`                 | `false`               | Flag to enable or disable logging. |
