
FROM node:18


WORKDIR /app

RUN apk add --no-cache docker-cli


COPY package*.json ./
RUN npm install


COPY . .


RUN npm run build


CMD ["npm", "start"]
