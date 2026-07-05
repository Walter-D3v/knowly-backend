# Knowly Backend

API Gateway para la plataforma de centralización de conocimiento empresarial.

El backend actúa como capa de autenticación y negocio, reenviando archivos y prompts a workflows de n8n para su procesamiento.

## Stack

- NestJS
- TypeScript
- Supabase JWT (autenticación)
- n8n Webhooks (procesamiento)

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Configuración

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor |
| `N8N_DOCUMENT_WEBHOOK` | Webhook de n8n para subida de documentos |
| `N8N_CHAT_WEBHOOK` | Webhook de n8n para chat |
| `SUPABASE_URL` | URL del proyecto Supabase |
| `SUPABASE_JWT_SECRET` | JWT Secret de Supabase |

## Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción local
npm run build
npm run start:prod
```

## Deploy en Railway

### 1. Crear el servicio

1. Entra a [railway.app](https://railway.app) e inicia sesión con GitHub.
2. **New Project → Deploy from GitHub repo**.
3. Selecciona el repositorio `knowly-backend`.
4. Railway detecta Node.js y usa `railway.toml` automáticamente.

### 2. Variables de entorno

En **Variables** del servicio, agrega (no pongas `PORT`; Railway lo inyecta solo):

| Variable | Valor |
|----------|-------|
| `N8N_DOCUMENT_WEBHOOK` | `https://ffcastillo.app.n8n.cloud/webhook/ingestion` |
| `N8N_CHAT_WEBHOOK` | `https://ffcastillo.app.n8n.cloud/webhook/ask` |
| `SUPABASE_URL` | URL de tu proyecto Supabase |
| `SUPABASE_JWT_SECRET` | JWT Secret de Supabase (Settings → API) |
| `CORS_ORIGIN` | URL de tu frontend (ej. `https://tu-app.netlify.app`) |

### 3. Dominio público

1. En el servicio, abre **Settings → Networking**.
2. Clic en **Generate Domain**.
3. Obtendrás una URL como `https://knowly-backend-production.up.railway.app`.

### 4. Verificar

```bash
curl -X POST https://TU-DOMINIO-RAILWAY.up.railway.app/chat \
  -H "Authorization: Bearer <supabase_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hola","sessionId":"user-123"}'
```

### 5. Conectar el frontend

En tu Nuxt/Netlify, apunta la API al dominio de Railway:

```
NUXT_PUBLIC_API_URL=https://TU-DOMINIO-RAILWAY.up.railway.app
```

## Endpoints

<img width="2650" height="2320" alt="Responsability separation-2026-07-04-235530" src="https://github.com/user-attachments/assets/9bb200b2-7245-477f-90ec-856a3512b7ce" />

### POST /documents

<img width="8191" height="4394" alt="Documents endpoint diagram" src="https://github.com/user-attachments/assets/fbee8961-b7f3-4e7d-ad2f-7d4eddd299a0" />


Sube un documento para procesamiento en n8n.

- **Auth:** `Authorization: Bearer <supabase_jwt>`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (archivo)

### POST /chat

<img width="8191" height="3729" alt="Chat endpoint infraestructure-2026-07-04-233607" src="https://github.com/user-attachments/assets/79f93184-8289-4ee1-a776-262a6760179e" />

Envía un prompt al agente de conocimiento en n8n.

- **Auth:** `Authorization: Bearer <supabase_jwt>`
- **Content-Type:** `application/json`
- **Body:**

```json
{
  "prompt": "¿Cuál es la política de vacaciones?"
}
```
## Global requests Pipeline

<img width="8191" height="1674" alt="Global request pipeline-2026-07-04-235355" src="https://github.com/user-attachments/assets/da20aedd-9469-4dd1-8706-e272be7078fd" />


## Arquitectura

<img width="8192" height="4787" alt="Backend-Infraestructure diagram" src="https://github.com/user-attachments/assets/ca6ffa5e-4faf-41e2-9c60-0611f42ca598" />


```
src/
├── auth/        # Validación JWT de Supabase
├── chat/        # Endpoint de chat
├── common/      # Filtros, interceptors, decorators
├── config/      # Variables de entorno
├── documents/   # Endpoint de documentos
├── n8n/         # Comunicación con webhooks (único punto HTTP externo)
└── app.module.ts
```




