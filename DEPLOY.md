# Deploy GovSense lên Ubuntu Server

> **Domain:**
> - Frontend: `govsense.tonyx.dev`
> - Backend API: `server.govsense.tonyx.dev`
> - Electric SQL: internal qua Nginx (`govsense.tonyx.dev/electric/`)
>
> **External Services (server khác - đã triển khai sẵn):**
> - PostgreSQL: `103.104.119.144:5432`
> - Redis: `103.104.119.144:6379`

---

## 1. Yêu cầu hệ thống

- Ubuntu 22.04+ (khuyến nghị 24.04 LTS)
- RAM: tối thiểu 4GB (khuyến nghị 8GB+ nếu dùng embedding model local)
- CPU: 2+ cores
- Disk: 40GB+
- Domain đã trỏ DNS A record về IP server
- Server phải kết nối được tới DB/Redis server (`103.104.119.144`)

```bash
# Kiểm tra DNS đã trỏ đúng chưa
dig +short govsense.tonyx.dev
dig +short server.govsense.tonyx.dev
# Cả 2 phải trả về IP server deploy

# Kiểm tra kết nối tới DB/Redis server
nc -zv 103.104.119.144 5432   # PostgreSQL
nc -zv 103.104.119.144 6379   # Redis
```

---

## 2. Cài đặt Docker & Docker Compose

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Đăng xuất rồi đăng nhập lại để group có hiệu lực
# hoặc: newgrp docker

# Kiểm tra
docker --version
docker compose version
```

---

## 3. Cài đặt Nginx & Certbot (SSL)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx

# Mở firewall
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow OpenSSH
sudo ufw --force enable
```

---

## 4. Clone source code

```bash
cd /opt
sudo mkdir -p govsense && sudo chown $USER:$USER govsense
git clone <your-repo-url> govsense
cd /opt/govsense
```

---

## 5. Cấu hình Environment

### 5a. File `.env` gốc (cho docker-compose)

```bash
cat > /opt/govsense/.env << 'EOF'
# External DB server (KHÔNG dùng container local)
DB_HOST=103.104.119.144
DB_PORT=5432
DB_USER=hub_sodttghanoi
DB_PASSWORD=TicketX123
DB_NAME=hub_sodttghanoi

# External Redis server
REDIS_HOST=103.104.119.144
REDIS_PORT=6379
REDIS_PASSWORD=TicketX123

# Electric SQL
ELECTRIC_DB_USER=svc-territorial-leopard-milw7jmm37
ELECTRIC_DB_PASSWORD=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJzdmMtdGVycml0b3JpYWwtbGVvcGFyZC1taWx3N2ptbTM3IiwiaWF0IjoxNzcwMzU3NDI5fQ.lBU4ATznXZ2hd8-A6r4ks-A7EpXM-cKsGBlZeVkZHvA
ELECTRIC_PORT=5133

# Ports
BACKEND_PORT=8000
FRONTEND_PORT=3000

# Frontend build args - QUAN TRỌNG: dùng domain thật
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://server.govsense.tonyx.dev
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=UNSTRUCTURED
NEXT_PUBLIC_ELECTRIC_URL=https://govsense.tonyx.dev/electric
NEXT_PUBLIC_ELECTRIC_AUTH_MODE=insecure
EOF
```

### 5b. Backend `.env`

```bash
cat > /opt/govsense/govsense_backend/.env << 'EOF'
# Database - kết nối tới server external
DATABASE_URL=postgresql+asyncpg://hub_sodttghanoi:TicketX123@103.104.119.144:5432/hub_sodttghanoi

# Celery - kết nối tới Redis external
CELERY_BROKER_URL=redis://:TicketX123@103.104.119.144:6379/0
CELERY_RESULT_BACKEND=redis://:TicketX123@103.104.119.144:6379/0
CELERY_TASK_DEFAULT_QUEUE=govsense

# Redis app
REDIS_APP_URL=redis://:TicketX123@103.104.119.144:6379/0

# Electric
ELECTRIC_DB_USER=svc-territorial-leopard-milw7jmm37
ELECTRIC_DB_PASSWORD=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJzdmMtdGVycml0b3JpYWwtbGVvcGFyZC1taWx3N2ptbTM3IiwiaWF0IjoxNzcwMzU3NDI5fQ.lBU4ATznXZ2hd8-A6r4ks-A7EpXM-cKsGBlZeVkZHvA

# Schedule
SCHEDULE_CHECKER_INTERVAL=5m

# Auth
SECRET_KEY=5bccf285290c564ba92ad509228d0f6b
AUTH_TYPE=LOCAL
REGISTRATION_ENABLED=TRUE
NEXT_FRONTEND_URL=https://govsense.tonyx.dev
BACKEND_URL=https://server.govsense.tonyx.dev

# Google OAuth (nếu cần)
GOOGLE_OAUTH_CLIENT_ID=924507538m
GOOGLE_OAUTH_CLIENT_SECRET=GOCSV

# Embedding
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Rerankers
RERANKERS_ENABLED=FALSE
RERANKERS_MODEL_NAME=ms-marco-MiniLM-L-12-v2
RERANKERS_MODEL_TYPE=flashrank

# TTS / STT
TTS_SERVICE=local/kokoro
STT_SERVICE=local/base

# ETL
ETL_SERVICE=UNSTRUCTURED
UNSTRUCTURED_API_KEY=Tpu3P0U8iy
PAGES_LIMIT=500

# Firecrawl
FIRECRAWL_API_KEY=fcr-01J0000000000000000000000

# Uvicorn
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8000
UVICORN_LOG_LEVEL=info
EOF
```

### 5c. Frontend `.env`

```bash
cat > /opt/govsense/govsense_web/.env << 'EOF'
NEXT_PUBLIC_FASTAPI_BACKEND_URL=https://server.govsense.tonyx.dev
NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE=LOCAL
NEXT_PUBLIC_ETL_SERVICE=UNSTRUCTURED
NEXT_PUBLIC_ELECTRIC_URL=https://govsense.tonyx.dev/electric
NEXT_PUBLIC_ELECTRIC_AUTH_MODE=insecure
NEXT_PUBLIC_DEPLOYMENT_MODE=self-hosted
EOF
```

---

## 6. Tạo docker-compose.prod.yml (không có db/redis)

Vì DB và Redis đã chạy ở server khác, ta chỉ cần 3 container: **backend**, **electric**, **frontend**.

```bash
cat > /opt/govsense/docker-compose.prod.yml << 'YAML'
version: "3.8"

services:
  backend:
    build: ./govsense_backend
    restart: unless-stopped
    ports:
      - "127.0.0.1:8000:8000"
    volumes:
      - shared_temp:/tmp
    env_file:
      - ./govsense_backend/.env
    environment:
      - PYTHONPATH=/app
      - UVICORN_LOOP=asyncio
      - UNSTRUCTURED_HAS_PATCHED_LOOP=1
      - LANGCHAIN_TRACING_V2=false
      - LANGSMITH_TRACING=false
      - UVICORN_PROXY_HEADERS=true
      - UVICORN_FORWARDED_ALLOW_IPS=*

  electric:
    image: electricsql/electric:latest
    restart: unless-stopped
    ports:
      - "127.0.0.1:5133:3000"
    environment:
      - DATABASE_URL=postgresql://${ELECTRIC_DB_USER}:${ELECTRIC_DB_PASSWORD}@${DB_HOST:-103.104.119.144}:${DB_PORT:-5432}/${DB_NAME:-hub_sodttghanoi}?sslmode=disable
      - ELECTRIC_INSECURE=true
      - ELECTRIC_WRITE_TO_PG_MODE=direct
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/v1/health"]
      interval: 10s
      timeout: 5s
      retries: 5

  frontend:
    build:
      context: ./govsense_web
      args:
        NEXT_PUBLIC_FASTAPI_BACKEND_URL: ${NEXT_PUBLIC_FASTAPI_BACKEND_URL:-https://server.govsense.tonyx.dev}
        NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE: ${NEXT_PUBLIC_FASTAPI_BACKEND_AUTH_TYPE:-LOCAL}
        NEXT_PUBLIC_ETL_SERVICE: ${NEXT_PUBLIC_ETL_SERVICE:-UNSTRUCTURED}
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    env_file:
      - ./govsense_web/.env
    environment:
      - NEXT_PUBLIC_ELECTRIC_URL=${NEXT_PUBLIC_ELECTRIC_URL:-https://govsense.tonyx.dev/electric}
      - NEXT_PUBLIC_ELECTRIC_AUTH_MODE=insecure
    depends_on:
      - backend
      - electric

volumes:
  shared_temp:
YAML
```

> **Lưu ý:** KHÔNG dùng `docker-compose.yml` gốc vì nó chứa services `db`, `redis`, `pgadmin`.
> Dùng trực tiếp `docker-compose.prod.yml` duy nhất.

---

## 7. Cấu hình Nginx Reverse Proxy

### 7a. Frontend - `govsense.tonyx.dev`

```bash
sudo tee /etc/nginx/sites-available/govsense.tonyx.dev << 'NGINX'
server {
    listen 80;
    server_name govsense.tonyx.dev;

    # Certbot sẽ tự thêm redirect HTTPS

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout cho SSR
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    # Electric SQL proxy (internal)
    location /electric/ {
        proxy_pass http://127.0.0.1:5133/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Electric SQL dùng long polling / streaming
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
}
NGINX
```

### 7b. Backend - `server.govsense.tonyx.dev`

```bash
sudo tee /etc/nginx/sites-available/server.govsense.tonyx.dev << 'NGINX'
server {
    listen 80;
    server_name server.govsense.tonyx.dev;

    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout dài cho AI streaming responses
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_buffering off;

        # SSE (Server-Sent Events) cho chat streaming
        proxy_set_header Cache-Control no-cache;
        chunked_transfer_encoding on;
    }
}
NGINX
```

### 7c. Kích hoạt sites & SSL

```bash
# Kích hoạt
sudo ln -sf /etc/nginx/sites-available/govsense.tonyx.dev /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/server.govsense.tonyx.dev /etc/nginx/sites-enabled/

# Xóa default site
sudo rm -f /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Lấy SSL certificates (tự động cấu hình HTTPS redirect)
sudo certbot --nginx -d govsense.tonyx.dev -d server.govsense.tonyx.dev \
  --non-interactive --agree-tos -m admin@tonyx.dev

# Kiểm tra auto-renew
sudo certbot renew --dry-run
```

---

## 8. Chuẩn bị Database (trên DB server)

Trước khi chạy, đảm bảo PostgreSQL trên `103.104.119.144` đã bật **logical replication** (cần cho Electric SQL):

```bash
# SSH vào DB server
ssh user@103.104.119.144

# Kiểm tra wal_level
sudo -u postgres psql -c "SHOW wal_level;"
# Phải trả về: logical

# Nếu chưa phải "logical", sửa postgresql.conf:
sudo nano /etc/postgresql/14/main/postgresql.conf
# Thêm/sửa:
#   wal_level = logical
#   max_replication_slots = 10
#   max_wal_senders = 10

# Restart PostgreSQL
sudo systemctl restart postgresql

# Tạo Electric user (nếu chưa có)
sudo -u postgres psql -d hub_sodttghanoi << 'SQL'
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'svc-territorial-leopard-milw7jmm37') THEN
        CREATE USER "svc-territorial-leopard-milw7jmm37" WITH REPLICATION PASSWORD 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzb3VyY2VfaWQiOiJzdmMtdGVycml0b3JpYWwtbGVvcGFyZC1taWx3N2ptbTM3IiwiaWF0IjoxNzcwMzU3NDI5fQ.lBU4ATznXZ2hd8-A6r4ks-A7EpXM-cKsGBlZeVkZHvA';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE hub_sodttghanoi TO "svc-territorial-leopard-milw7jmm37";
GRANT CREATE ON DATABASE hub_sodttghanoi TO "svc-territorial-leopard-milw7jmm37";
GRANT USAGE ON SCHEMA public TO "svc-territorial-leopard-milw7jmm37";
GRANT SELECT ON ALL TABLES IN SCHEMA public TO "svc-territorial-leopard-milw7jmm37";
GRANT SELECT ON ALL SEQUENCES IN SCHEMA public TO "svc-territorial-leopard-milw7jmm37";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO "svc-territorial-leopard-milw7jmm37";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO "svc-territorial-leopard-milw7jmm37";

-- Publication cho Electric SQL
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_publication WHERE pubname = 'electric_publication_default') THEN
        CREATE PUBLICATION electric_publication_default;
    END IF;
END
$$;
SQL
```

Đảm bảo `pg_hba.conf` cho phép kết nối từ server deploy:

```bash
# Thêm vào pg_hba.conf (thay <IP_SERVER_DEPLOY> bằng IP thật)
echo "host    hub_sodttghanoi    hub_sodttghanoi    <IP_SERVER_DEPLOY>/32    md5" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
echo "host    hub_sodttghanoi    svc-territorial-leopard-milw7jmm37    <IP_SERVER_DEPLOY>/32    md5" | sudo tee -a /etc/postgresql/14/main/pg_hba.conf
sudo systemctl reload postgresql
```

---

## 9. Build & Khởi chạy

```bash
cd /opt/govsense

# Build tất cả images (lần đầu sẽ mất 10-20 phút)
docker compose -f docker-compose.prod.yml build

# Khởi chạy (detached mode)
docker compose -f docker-compose.prod.yml up -d

# Xem logs realtime
docker compose -f docker-compose.prod.yml logs -f

# Xem logs từng service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f electric
```

---

## 10. Kiểm tra

```bash
# Kiểm tra tất cả container đang chạy
docker compose -f docker-compose.prod.yml ps

# Test backend health
curl -s https://server.govsense.tonyx.dev/docs | head -5

# Test frontend
curl -s -o /dev/null -w "%{http_code}" https://govsense.tonyx.dev

# Test Electric SQL
curl -s https://govsense.tonyx.dev/electric/v1/health

# Test kết nối DB từ backend container
docker compose -f docker-compose.prod.yml exec backend \
  python -c "from app.config import config; print('Config OK')"
```

---

## 11. Cập nhật / Redeploy

```bash
cd /opt/govsense

# Pull code mới
git pull origin main

# Rebuild & restart tất cả
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Chỉ rebuild 1 service
docker compose -f docker-compose.prod.yml up -d --build backend
docker compose -f docker-compose.prod.yml up -d --build frontend

# Restart không rebuild
docker compose -f docker-compose.prod.yml restart backend
```

---

## 12. Backup Database

Chạy trực tiếp trên DB server (`103.104.119.144`):

```bash
# Backup
pg_dump -U hub_sodttghanoi -h localhost hub_sodttghanoi > backup_$(date +%Y%m%d_%H%M%S).sql

# Hoặc từ server deploy (remote backup)
PGPASSWORD=TicketX123 pg_dump -U hub_sodttghanoi -h 103.104.119.144 hub_sodttghanoi > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
PGPASSWORD=TicketX123 psql -U hub_sodttghanoi -h 103.104.119.144 hub_sodttghanoi < backup_file.sql
```

---

## 13. Troubleshooting

### Backend không khởi động
```bash
# Xem logs chi tiết
docker compose -f docker-compose.prod.yml logs backend --tail=100

# Vào container debug
docker compose -f docker-compose.prod.yml exec backend bash
# Trong container:
python -c "from app.config import config; print('OK')"
alembic upgrade head
```

### Backend không kết nối được DB/Redis
```bash
# Test từ trong container
docker compose -f docker-compose.prod.yml exec backend bash
apt-get update && apt-get install -y netcat-openbsd
nc -zv 103.104.119.144 5432
nc -zv 103.104.119.144 6379

# Nếu không kết nối được → kiểm tra firewall trên DB server
# cho phép IP server deploy truy cập port 5432 và 6379
```

### Frontend trắng trang
```bash
# Kiểm tra biến môi trường lúc build
docker compose -f docker-compose.prod.yml exec frontend env | grep NEXT_PUBLIC

# Nếu biến sai, cần rebuild (NEXT_PUBLIC_ bake vào lúc build):
docker compose -f docker-compose.prod.yml up -d --build frontend
```

### Electric SQL không kết nối
```bash
# Kiểm tra Electric health
curl http://127.0.0.1:5133/v1/health

# Kiểm tra logs
docker compose -f docker-compose.prod.yml logs electric --tail=50

# Nguyên nhân phổ biến:
# 1. wal_level chưa = logical → sửa trên DB server
# 2. Electric user chưa có quyền REPLICATION
# 3. pg_hba.conf chưa cho phép kết nối từ IP server deploy
```

### CORS errors
Kiểm tra `NEXT_FRONTEND_URL` trong backend `.env` phải khớp chính xác:
```
NEXT_FRONTEND_URL=https://govsense.tonyx.dev
BACKEND_URL=https://server.govsense.tonyx.dev
```

### SSL certificate hết hạn
```bash
# Certbot tự renew qua cron, nhưng có thể force renew:
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## Tổng quan kiến trúc Production

```
                          Server Deploy (Ubuntu)
Internet                  ┌─────────────────────────────────────┐
   │                      │                                     │
   ├─ govsense.tonyx.dev ─┤► Nginx (443/SSL)                   │
   │                      │   ├─ / ────────► Frontend (:3000)   │
   │                      │   └─ /electric/ ► Electric (:5133) ─┼──┐
   │                      │                                     │  │
   └─ server.govsense     │► Nginx (443/SSL)                   │  │
      .tonyx.dev          │   └─ / ────────► Backend (:8000) ──┼──┤
                          │                   ├─ FastAPI        │  │
                          │                   ├─ Celery Worker  │  │
                          │                   └─ Celery Beat    │  │
                          └─────────────────────────────────────┘  │
                                                                   │
                          DB Server (103.104.119.144)               │
                          ┌─────────────────────────────────────┐  │
                          │  PostgreSQL (:5432) ◄───────────────┼──┘
                          │    └─ hub_sodttghanoi database      │
                          │    └─ wal_level = logical           │
                          │                                     │
                          │  Redis (:6379) ◄────────────────────┼── Backend + Celery
                          │    └─ Celery broker + result store  │
                          └─────────────────────────────────────┘
```
