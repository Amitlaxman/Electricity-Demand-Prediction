# --- existing builder stage ---
FROM node:18-bullseye AS builder
RUN apt-get update && apt-get install -y python3 python3-pip build-essential ca-certificates && ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN pip3 install --no-cache-dir numpy pandas joblib
RUN npm run build

# --- runtime stage ---
FROM node:18-bullseye-slim
RUN apt-get update && apt-get install -y python3 python3-pip ca-certificates && ln -s /usr/bin/python3 /usr/bin/python
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080            
COPY --from=builder /app /app
EXPOSE 8080              
CMD ["npm", "start"]