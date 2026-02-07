# Hướng dẫn Triển khai Thử nghiệm GovSense trên Windows

Tài liệu này hướng dẫn chi tiết cách cài đặt và chạy thử nghiệm hệ thống **GovSense** trên môi trường Windows sử dụng Docker.

## 1. Yêu cầu Hệ thống (Prerequisites)

Trước khi bắt đầu, đảm bảo máy tính của bạn đã cài đặt các phần mềm sau:

1.  **Docker Desktop for Windows**:
    *   Tải xuống tại: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)
    *   Trong quá trình cài đặt, đảm bảo chọn **Use WSL 2 instead of Hyper-V** (khuyên dùng).
    *   Sau khi cài đặt, khởi động Docker Desktop và đợi trạng thái chuyển sang màu xanh (Engine running).

2.  **Git**:
    *   Tải xuống tại: [https://git-scm.com/download/win](https://git-scm.com/download/win)

3.  **Tài nguyên máy tính**:
    *   RAM: Tối thiểu 8GB (khuyên dùng 16GB).
    *   Disk: Còn trống ít nhất 20GB.

## 2. Chuẩn bị Mã nguồn và Cấu hình

### Bước 1: Mở Terminal
Mở **PowerShell** hoặc **Command Prompt** (CMD) và di chuyển đến thư mục chứa mã nguồn GovSense:

```powershell
cd D:\TonyX.Dev\AI\SurfSense
```

### Bước 2: Tạo file cấu hình môi trường (.env)
Hệ thống cần các file `.env` để hoạt động. Bạn cần tạo chúng từ các file mẫu `.env.example`.

Chạy các lệnh sau trong PowerShell để copy file mẫu:

```powershell
# Copy cấu hình cho Backend
Copy-Item govsense_backend\.env.example govsense_backend\.env

# Copy cấu hình cho Frontend
Copy-Item govsense_web\.env.example govsense_web\.env
```

**Lưu ý:**
*   File `.env` chứa các cấu hình mặc định an toàn cho môi trường thử nghiệm nội bộ.
*   Nếu bạn cần thay đổi khóa API (ví dụ OpenAI, Google Drive...), hãy mở file `govsense_backend\.env` bằng Notepad hoặc VS Code để chỉnh sửa.

## 3. Khởi chạy Hệ thống

Sử dụng Docker Compose để dựng toàn bộ hệ thống (Database, Backend, Frontend, Redis...).

### Bước 1: Build và Chạy Container
Tại thư mục gốc của dự án, chạy lệnh:

```powershell
docker compose up -d --build
```

*   `-d`: Chạy ngầm (Detached mode).
*   `--build`: Buộc build lại các image để đảm bảo code mới nhất được áp dụng (đặc biệt quan trọng sau khi rebrand).

### Bước 2: Chờ khởi động
Lần đầu chạy có thể mất từ **5-15 phút** tùy tốc độ mạng để tải các Docker image và cài đặt thư viện.
Bạn có thể theo dõi log để xem tiến trình:

```powershell
docker compose logs -f
```
(Nhấn `Ctrl + C` để thoát xem log).

## 4. Truy cập và Sử dụng

Sau khi hệ thống khởi động xong, bạn có thể truy cập qua trình duyệt:

| Dịch vụ | Đường dẫn | Tài khoản mặc định (nếu có) |
|---------|-----------|-----------------------------|
| **GovSense Web (Frontend)** | [http://localhost:3000](http://localhost:3000) | Đăng ký tài khoản mới |
| **Backend API Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | - |
| **Quản lý Database (PGAdmin)** | [http://localhost:5050](http://localhost:5050) | Email: `admin@govsense.com`<br>Pass: `govsense` |

## 5. Các lệnh thường dùng khác

*   **Dừng hệ thống**:
    ```powershell
    docker compose down
    ```
*   **Khởi động lại (không build lại)**:
    ```powershell
    docker compose up -d
    ```
*   **Xem log backend**:
    ```powershell
    docker compose logs -f backend
    ```

## 6. Xử lý lỗi thường gặp (Troubleshooting)

### Lỗi "Ports are not available"
*   **Nguyên nhân**: Cổng 3000, 8000 hoặc 5432 đang bị phần mềm khác chiếm dụng.
*   **Khắc phục**:
    1.  Tắt các ứng dụng đang dùng cổng đó (ví dụ: tắt Skype/TeamViewer nếu chiếm cổng 80).
    2.  Hoặc đổi cổng trong file `.env` (ví dụ `FRONTEND_PORT=3001`).

### Lỗi "Execution Policy"
*   Nếu PowerShell báo lỗi không chạy được script, hãy chạy lệnh sau (Run as Administrator):
    ```powershell
    Set-ExecutionPolicy RemoteSigned
    ```

### Lỗi Permission khi đổi tên thư mục (nếu gặp lại)
*   Hãy đảm bảo Docker đã tắt (`docker compose down`) trước khi thao tác đổi tên file/thư mục hệ thống.

---
**Chúc bạn triển khai thử nghiệm GovSense thành công!**
