# \# 🏢 Yayasan Wakaf Cendekia - Backend API

# 

# Backend sistem manajemen yayasan dengan fitur lengkap untuk kepegawaian, magang, penilaian kinerja, absensi, dan penggajian.

# 

# \## 🚀 Tech Stack

# 

# \- \*\*Node.js\*\* v18+

# \- \*\*Express.js\*\* v4.21

# \- \*\*MySQL\*\* (MariaDB)

# \- \*\*JWT\*\* Authentication

# \- \*\*Multer\*\* (File Upload)

# \- \*\*Node-Cron\*\* (Auto Backup)

# \- \*\*PDFKit\*\* (Generate PDF)

# 

# \## 📦 Installation

# 

# \### 1. Clone Repository

# ```bash

# git clone https://github.com/syafariarigayo/yayasan-api.git

# cd yayasan-api

# ```

# 

# \### 2. Install Dependencies

# ```bash

# npm install

# ```

# 

# \### 3. Setup Environment

# ```bash

# \# Copy file .env.example ke .env

# cp .env.example .env

# 

# \# Edit .env dan sesuaikan konfigurasi

# \# Minimal yang harus diisi:

# \# - DB\_NAME

# \# - DB\_USER  

# \# - DB\_PASSWORD

# \# - JWT\_SECRET

# ```

# 

# \### 4. Setup Database

# ```bash

# \# Buat database

# mysql -u root -p -e "CREATE DATABASE yayasan\_db"

# 

# \# Import schema

# mysql -u root -p yayasan\_db < database.sql

# ```

# 

# \### 5. Generate Admin Password

# ```bash

# node updateAdminPassword.js

# ```

# 

# \### 6. Run Server

# ```bash

# \# Development

# npm start

# 

# \# With Nodemon (auto-restart)

# npm run dev

# ```

# 

# Server berjalan di: \*\*http://localhost:5100\*\*

# 

# \## 📚 API Endpoints

# 

# \### Authentication

# \- `POST /auth/login` - Login admin

# 

# \### Karyawan

# \- `GET /karyawan` - List karyawan

# \- `POST /karyawan` - Tambah karyawan

# \- `GET /karyawan/:id` - Detail karyawan

# \- `PUT /karyawan/:id` - Update karyawan

# \- `DELETE /karyawan/:id` - Hapus karyawan

# 

# \### Magang

# \- `GET /magang` - List karyawan magang

# \- `POST /magang/:id/verifikasi` - Verifikasi magang

# 

# \### Penilaian Kinerja

# \- `GET /penilaian-kinerja` - List penilaian

# \- `POST /penilaian-kinerja` - Buat penilaian

# \- `POST /penilaian-kinerja/:id/finalisasi` - Finalisasi

# 

# \### Absensi

# \- `GET /absensi` - List absensi

# \- `POST /import-absensi` - Import Excel

# 

# \### Dashboard

# \- `GET /dashboard/summary` - Statistik

# 

# \### Backup

# \- `GET /backup/manual` - Backup database

# \- `POST /backup/restore` - Restore database

# 

# \## 🔐 Environment Variables

# 

# Lihat `.env.example` untuk daftar lengkap.

# 

# \## 📄 License

# 

# MIT License

# 

# \## 👥 Developer

# 

# Syafari Arigayo - 2025

