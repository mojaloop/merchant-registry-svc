# Use an official Node runtime as the base image
FROM node:18.16-alpine3.18

RUN apk add --no-cache curl

# Install pnpm globally for acquirer-frontend
# Otherwise npm install will fail for all
RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json and package-lock.json are copied
COPY package*.json ./

COPY packages/shared-lib/package*.json ./packages/shared-lib/
# COPY packages/acquirer-backend/package*.json ./packages/acquirer-backend/
COPY packages/acquirer-frontend/package*.json ./packages/acquirer-frontend/
# COPY packages/registry-oracle/package*.json ./packages/registry-oracle/

RUN npm i

#  Copy all even although will not be using frontend in this container
COPY . .

# Make port 5173 available to the world outside this container
EXPOSE 5173

# Run the app when the container launches
CMD [ "npm", "run", "dev", "-w", "acquirer-frontend", "--", "--host"]
