# Hướng dẫn Triển khai GovSense Thủ công (Không dùng Docker)

Tài liệu này hướng dẫn cách chạy hệ thống GovSense trực tiếp trên Windows bằng `npm`/`pnpm` và `python`.

> **⚠️ CẢNH BÁO QUAN TRỌNG**:
> Hệ thống GovSense được thiết kế tối ưu cho Docker. Việc chạy thủ công sẽ gặp một số hạn chế:
> 1.  **Thiếu tính năng Đồng bộ (ElectricSQL)**: Dịch vụ ElectricSQL rất khó cài đặt thủ công trên Windows. Nếu thiếu nó, một số tính năng thời gian thực (real-time) có thể không hoạt động, nhưng chat cơ bản vẫn có thể sử dụng được.
> 2.  **Cài đặt phức tạp**: Bạn phải tự cài đặt và cấu hình Database (Postgres) và Cache (Redis).

---

## 1. Yêu cầu Hệ thống (Prerequisites)

Bạn cần cài đặt các phần mềm sau trước khi bắt đầu:

### A. Ngôn ngữ & Công cụ
1.  **Node.js** (v20 trở lên): [Tải tại đây](https://nodejs.org/en/download)
2.  **Python** (Bắt buộc v3.12 - **Không dùng 3.13/3.14**):
    *   Hệ thống yêu cầu chính xác Python 3.12 để tương thích với các thư viện AI (PyTorch, PyArrow).
    *   Nếu bạn chưa có, chúng ta sẽ dùng công cụ `uv` để tự động cài đặt ở bước sau.
3.  **Git**: [Tải tại đây](https://git-scm.com/download/win)

### B. Cơ sở dữ liệu (Bắt buộc)
1.  **PostgreSQL** (v15 trở lên): [Tải tại đây](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)
    *   **QUAN TRỌNG**: Trong quá trình cài đặt, bạn **PHẢI** cài đặt thêm Extension `pgvector`.
    *   Nếu bộ cài không có sẵn pgvector, bạn cần cài riêng hoặc dùng Docker cho DB (nếu có thể).
    *   *Mẹo*: Cách đơn giản nhất để có Postgres trên Windows là dùng bộ cài của EnterpriseDB và sử dụng Stack Builder để cài thêm tiện ích.
2.  **Redis**:
    *   Tải bản Redis cho Windows (ví dụ Memurai Developer): [Tải tại đây](https://www.memurai.com/get-memurai)

---

## 2. Cài đặt và Cấu hình

### Bước 1: Chuẩn bị Database
1.  Mở **pgAdmin** (đi kèm khi cài Postgres) hoặc Terminal.
2.  Tạo một database mới tên là `govsense`.
3.  Chạy câu lệnh SQL sau vào database `govsense` để kích hoạt vector:
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```

### Bước 2: Cài đặt Backend
Mở PowerShell tại thư mục `D:\TonyX.Dev\AI\SurfSense` và chạy:

```powershell
# 1. Vào thư mục backend
cd govsense_backend

# 2. Tạo file cấu hình .env
Copy-Item .env.example .env

# 3. Sửa file .env (QUAN TRỌNG)
# Mở file .env bằng Notepad và sửa dòng DATABASE_URL để khớp với password Postgres của bạn
notepad .env

# 4. Cài đặt Python 3.12 và thư viện bằng 'uv'
# (Lệnh này sẽ tự động tải Python 3.12 và tạo môi trường ảo)
python -m pip install uv
python -m uv venv --python 3.12
.\.venv\Scripts\activate

# 5. Cài đặt các gói phụ thuộc
uv pip install -e .

# 6. Chạy migration để tạo bảng
python -m alembic upgrade head
```

### Bước 3: Cài đặt Frontend
Mở một cửa sổ PowerShell **mới** tại `D:\TonyX.Dev\AI\SurfSense`:

```powershell
# 1. Vào thư mục frontend
cd govsense_web

# 2. Tạo file cấu hình .env
Copy-Item .env.example .env

# 3. Cài đặt pnpm (nếu chưa có)
npm install -g pnpm

# 4. Cài đặt thư viện
pnpm install

# 5. Tạo mã nguồn Database Client
pnpm db:generate
```

---

## 3. Khởi chạy Hệ thống

Bạn cần chạy song song 2 cửa sổ Terminal.

### Terminal 1: Chạy Backend (API)
```powershell
cd D:\TonyX.Dev\AI\SurfSense\govsense_backend
python main.py --reload
```
*Backend sẽ chạy tại: http://localhost:8000*

### Terminal 2: Chạy Frontend (Web)
```powershell
cd D:\TonyX.Dev\AI\SurfSense\govsense_web
pnpm dev
```
*Web sẽ chạy tại: http://localhost:3000*

---

## 4. Xử lý lỗi thường gặp

1.  **Lỗi "role postgres does not exist"**:
    *   Kiểm tra username/password trong file `govsense_backend\.env`. Mặc định thường là `postgres` / `password`.

2.  **Lỗi "extension vector does not exist"**:
    *   Bạn chưa cài `pgvector` cho Postgres. Đây là yêu cầu bắt buộc để AI hoạt động.
    *   Nếu quá khó cài trên Windows, hãy cân nhắc dùng Docker chỉ cho Database: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password ankane/pgvector`.

3.  **Lỗi kết nối Redis**:
    *   Đảm bảo Memurai/Redis đang chạy (kiểm tra trong Services của Windows).

4.  **Lỗi ElectricSQL**:
    *   Bạn sẽ thấy lỗi kết nối đến cổng `5133` trong Console của trình duyệt. Hãy bỏ qua nó. Chat có thể vẫn hoạt động qua API trực tiếp.
