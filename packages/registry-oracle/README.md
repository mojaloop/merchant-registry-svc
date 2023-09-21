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
