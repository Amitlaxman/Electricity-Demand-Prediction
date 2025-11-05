# --- existing builder stage ---
FROM node:18-bullseye AS builder
RUN apt-get update && apt-get install -y python3 python3-pip build-essential ca-certificates && ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

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
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.*/dist-packages /usr/local/lib/python3.*/dist-packages

EXPOSE 8080
CMD ["sh", "-c", "PORT=${PORT:-8080} npm start"]
