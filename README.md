# MACLIMA OS — Full-Stack SaaS Template (v0)

Template full-stack para construir **MACLIMA OS** como SaaS multi-portal:

* 🏢 Portal Interno
* 🤝 Portal Partners
* 👤 Portal Clientes

Incluye:

* Frontend moderno (Next.js + Tailwind)
* Backend robusto (FastAPI + PostgreSQL)
* Multi-tenant + RBAC
* Auditoría (audit log)
* Módulo Loki (IA stub)
* Motor de presupuestos determinista en Python
* Docker para base de datos
* Seed automático con usuarios demo

---

# 📦 Estructura del proyecto

```
maclima_saas_fullstack/
 ├─ apps/
 │   ├─ web/     → Next.js (Frontend)
 │   └─ api/     → FastAPI (Backend)
 ├─ docker-compose.yml
 ├─ .env.example
 └─ README.md
```

---

# 🧩 Requisitos por Sistema Operativo

---

## 🪟 Windows

Necesitas:

1. **Node.js 18+ (recomendado 20)**
2. **Python 3.10+**
3. **Docker Desktop (OBLIGATORIO)**
   👉 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

⚠ En Windows es imprescindible instalar **Docker Desktop**.
Asegúrate de que esté arrancado antes de usar `docker compose`.

Recomendado:

* Activar WSL2 si Docker lo sugiere.
* Usar PowerShell.

---

## 🍎 macOS

Necesitas:

1. Node.js 18+
2. Python 3.10+
3. Docker Desktop para Mac
   👉 [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

Inicia Docker antes de usar `docker compose`.

---

## 🐧 Linux

Necesitas:

1. Node.js 18+
2. Python 3.10+
3. Docker Engine + Docker Compose plugin

Instalación típica (Ubuntu):

```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

Si quieres evitar `sudo` en cada comando:

```bash
sudo usermod -aG docker $USER
```

(Reinicia sesión después.)

---

# 🚀 Arranque rápido (DEV)

---

# 1️⃣ Configurar entorno

Desde la raíz del proyecto:

```bash
cp .env.example .env
```

### Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

---

# 2️⃣ Levantar Base de Datos con Docker

⚠ Docker debe estar arrancado.

```bash
docker compose up -d db
```

Si Docker no está activo verás errores como:

```
cannot connect to docker engine
```

---

# 3️⃣ Backend (API)

Ir al backend:

```bash
cd apps/api
```

---

## Crear entorno virtual

### 🪟 Windows (PowerShell)

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si te da error de permisos:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

---

### 🍎 macOS / 🐧 Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

## Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## Ejecutar seed (usuarios demo)

```bash
python -m app.seed
```

---

## Levantar API

```bash
uvicorn app.main:app --reload --port 8000
```

API Docs:

```
http://localhost:8000/docs
```

---

# 4️⃣ Frontend (Web)

Abrir otra terminal:

```bash
cd apps/web
npm install
```

Crear archivo:

### apps/web/.env.local

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Luego:

```bash
npm run dev
```

Web disponible en:

```
http://localhost:3000
```

Si el puerto 3000 está ocupado, Next.js usará 3001 automáticamente.

---

# 👤 Usuarios Demo

## Interno

* [admin@maclima.local](mailto:admin@maclima.local)
* admin123

## Partner

* [partner@pt-002.local](mailto:partner@pt-002.local)
* partner123

## Cliente

* [client@c-001.local](mailto:client@c-001.local)
* client123

---

# 🏗 Arquitectura

Backend:

* Modular monolith
* Separación por dominios (auth, oms, wms, sat, etc.)
* Multi-tenant via `tenant_id`
* Audit log centralizado
* Pricing engine determinista

Frontend:

* Layout ERP
* Portal selector
* Token por cookie (modo demo)

---

# ⚠ Problemas Comunes

---

## Docker no arranca

En Windows/macOS:

* Asegúrate de que Docker Desktop esté abierto.

En Linux:

```bash
sudo systemctl status docker
```

---

## PowerShell no reconoce `source`

En Windows no existe `source`.

Usa:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## Puerto 3000 ocupado

Buscar proceso:

Windows:

```powershell
netstat -ano | findstr :3000
```

Linux/macOS:

```bash
lsof -i :3000
```

O simplemente deja que Next use 3001.

---

## Error de conexión a base de datos

Verifica:

```bash
docker compose ps
```

Debe aparecer:

```
db   Up
```

---

# 🔐 Hardening (No incluido en v0)

Para producción:

* Refresh tokens
* Cookies httpOnly + secure
* CSRF protection
* Rate limiting
* Alembic migrations
* Logs estructurados
* Observabilidad (Sentry)
* CORS estricto
* HTTPS obligatorio

---

# 🎯 Objetivo de este Template

Este proyecto es un **starter SaaS técnico** para:

* Validar arquitectura
* Mostrar flujo ERP
* Presentaciones a cliente
* Base para escalar

No es un producto production-ready.

