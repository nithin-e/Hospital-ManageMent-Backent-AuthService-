FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Install all dependencies including devDependencies (which includes TypeScript and @types)
RUN npm install

COPY . .

# Build TypeScript using npx (no need for global install)
RUN npm run build

EXPOSE 8000

CMD ["node", "dist/server.js"]