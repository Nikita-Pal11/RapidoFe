FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
#(Note: The -- tells npm to pass the --host flag directly to vite behind the scenes).

CMD ["npm", "run", "dev"]