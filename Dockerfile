# -------------------------------------------------------
# Builder Stage
# -------------------------------------------------------
FROM node:18-bullseye AS builder

# Install Python + deps for your ML libs
RUN apt-get update && apt-get install -y python3 python3-pip build-essential && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

RUN pip3 install --no-cache-dir numpy pandas joblib
RUN npm run build

# -------------------------------------------------------
# Runtime Stage
# -------------------------------------------------------
FROM node:18-bullseye-slim

RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app /app
COPY --from=builder /usr/local/lib/python3.*/dist-packages /usr/local/lib/python3.*/dist-packages

EXPOSE 8080

CMD ["npm", "start"]
