# Step-by-Step Guide to Setting Up Services Manually

![Draw.io Diagram](./Services.jpg)

## Pre-requisites

1. Node.js (preferably version 18.16)
2. MySQL/MariaDB (used by both Acquirer and Registry Oracle)
3. RabbitMQ (for message brokering between Acquirer and Registry Oracle)
4. Minio (object storage for Documents/Logos/QRImages)
5. Git (for source code management)
6. SendGrid Email Service API Key (For Email Verification for New Users)

## Service Overview

### Components:

1. **acquirer-frontend**: Portal UI for Managing Merchants Informations.
2. **acquirer-backend**: Backend Service for handling Merchants Informations.
3. **registry-oracle**: Will Serve as Oracle for Mojaloop ALS.
4. **MySQL**: The merchant database.
5. **RabbitMQ**: The message broker.

### Configuration

The `.env` file contains environment variables used for configuration.

## Instructions

### Step 1: Clone the Repository

```bash
git clone https://github.com/mojaloop/merchant-registry-svc.git
cd merchant-registry-svc
```

### Step 2: Install Global Dependencies

1. **Node.js**: Install it from the official [Node.js website](https://nodejs.org/).
```bash
# For Ubuntu
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18.16
nvm use 18.16

```
2. **pnpm**: Install pnpm globally for FrontEnd React Client.

```bash
npm install -g pnpm
```

### Step 3: Install Project Dependencies Inside Cloned Repository Directory

```bash
npm install
```

### Step 4: Set Up MySQL Database

1. Install MySQL Server and start it. (For Ubuntu)
```bash
sudo apt install -y mysql-server mysql-client
sudo systemctl start mysql
```

2. Log in as the root user and create databases and users.

```bash
sudo mysql -u root
```

```sql
CREATE DATABASE IF NOT EXISTS acquirer_db;
CREATE DATABASE IF NOT EXISTS registry_db;
CREATE USER 'newuser'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON acquirer_db.* TO 'newuser'@'localhost';
GRANT ALL PRIVILEGES ON registry_db.* TO 'newuser'@'localhost';
FLUSH PRIVILEGES;
```

### Step 5: Set Up RabbitMQ

1. Install RabbitMQ and enable its management plugin.

```bash
sudo apt install -y rabbitmq-server
sudo rabbitmq-plugins enable rabbitmq_management
```

2. Check if RabbitMQ is running. Service should be running on port 5672. Management plugin should be running on port 15672.
```bash
sudo rabbitmqctl status
```
(Note: Use the default user `guest` and password `guest` for that)


### Step 6: Set Up Minio (Skip if you are using AWS S3 or any other S3 compatible storage)

1. Download Minio from the [official site](https://min.io/download#/linux).
```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
sudo mv minio /usr/local/bin
```

2. Run Minio server with the following command
```bash
minio server /mnt/minio-storage-data
```

### Step 7: Set Up Environment Variables

1. Open a `.env` file in `<root-project>/packages/acquirer-frontend` and change in the environment variables.
(Note: `VITE_API_URL` should be set the external reachable IP Address from browser frontend client)
```
VITE_API_URL=http://localhost:5555/api/v1
```

1. Open the `.env` file in `<root-project>/packages/acquirer-backend` and change in the environment variables.
    - SendGrid API Key can be obtained from [here](https://app.sendgrid.com/settings/api_keys). Or Ask the developer team for the API Key.

```
JWT_SECRET=secret

# For MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=newuser
DB_PASSWORD=password
DB_DATABASE=acquirer_db 

# For Minio (Change if you are using AWS S3 or any other S3 compatible storage)
S3_ENDPOINT=localhost
S3_PORT=9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# For SendGrid Email Service
SENDGRID_API_KEY=sendgrid-api-key # Replace with your API Key
```

2. Open the `.env` file in `<root-project>/packages/registry-oracle` and change in the environment variables.

```
JWT_SECRET=secret

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=newuser
DB_PASSWORD=password
DB_DATABASE=registry_db
```

### Step 8: Start Services

```bash
# For acquirer-backend
npm run acquirer-backend:start

# For acquirer-frontend
npm run dev -w acquirer-frontend -- --host

# For registry-oracle
npm run registry-oracle:start
```

## Security Best Practices

1. **MySQL**: Don't use `root` for application access. Create a specific user with restricted permissions.
2. **RabbitMQ**: Create a specific user with restricted permissions.
3. **Environment Variables**: Store them securely, especially in production.
4. **JWT Secret**: Use a strong, unique secret
