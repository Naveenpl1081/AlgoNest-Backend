# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all files
COPY . .

# Compile TypeScript
RUN npm run build

# Start app
CMD ["npm", "start"]
