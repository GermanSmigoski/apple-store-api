# Origen Coffee — API

Backend de la tienda **Origen Coffee**, un e-commerce de café de especialidad. Servidor Express serverless desplegado en Vercel, con MongoDB Atlas como base de datos y Resend para emails de factura.

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js 22 + TypeScript |
| Framework | Express (serverless) |
| Base de datos | MongoDB Atlas (Mongoose) |
| Email | Resend |
| Deploy | Vercel Serverless Functions |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor |
| `GET` | `/api/products` | Lista todos los productos |
| `GET` | `/api/products?featured=true` | Solo productos destacados |
| `GET` | `/api/products?category=africa` | Filtra por categoría |
| `GET` | `/api/products/:idOrSlug` | Producto por ID o slug |
| `POST` | `/api/orders` | Crea una orden y envía email de factura |

### POST `/api/orders` — body esperado

```json
{
  "customer": {
    "name": "Juan García",
    "email": "juan@ejemplo.com",
    "address": {
      "line1": "Av. Corrientes 1234",
      "city": "Buenos Aires",
      "state": "CABA",
      "zip": "C1043",
      "country": "AR"
    }
  },
  "items": [
    { "productId": "64abc123...", "quantity": 2 }
  ]
}
```

## Variables de entorno

```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/?appName=Cluster0
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
FRONTEND_URL=https://tu-frontend.vercel.app
NODE_ENV=production
```

> **Nota sobre emails:** Con el plan gratuito de Resend sin dominio verificado, los emails solo pueden enviarse al correo registrado en la cuenta de Resend. Para enviar a cualquier destinatario verificar un dominio en [resend.com/domains](https://resend.com/domains).

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Crear .env con las variables de arriba
# Compilar TypeScript
npm run build

# Probar localmente
node -e "require('./dist/server').default.listen(3001, () => console.log('ok'))"
```

## Estructura

```
src/
├── server.ts       # App Express completa: schemas, seed, rutas, email
└── serverless.ts   # Handler de entrada para Vercel
```

## Deploy

El proyecto usa `vercel.json` para compilar `src/serverless.ts` con `@vercel/node`. Cada push a `main` dispara un deploy automático en Vercel.

El seed de productos corre automáticamente al primer request si la colección `products` está vacía: 15 cafés de especialidad con origen, proceso, notas de cata e historia del productor.

**Categorías:** `africa` · `latinoamerica` · `asia` · `blend`

## URLs

- **Producción:** https://api-eight-omega-81.vercel.app
- **Frontend:** https://web-chi-snowy-99.vercel.app
