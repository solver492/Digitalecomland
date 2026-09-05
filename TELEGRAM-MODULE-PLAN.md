# 📋 PLAN D'IMPLÉMENTATION MODULE TELEGRAM FOURNISSEURS

## ✅ PHASE 1 - Analyse du Projet Existant (TERMINÉE)

### Résultats clés de l'analyse :

**Architecture actuelle**
- ✅ Monorepo pnpm (lib/, artifacts/)
- ✅ Frontend React + Vite + TypeScript
- ✅ Backend Express + TypeScript
- ✅ Drizzle ORM configuré (PostgreSQL)
- ⚠️ **Base de données** : Actuellement un `mem-store.ts` (in-memory), PostgreSQL configuré mais non utilisé
- ⚠️ **Authentification** : AUCUNE (routes admin complètement ouvertes)
- ⚠️ **Stockage médias** : Fichiers locaux uniquement (public/products/)
- ⚠️ **Supabase** : NON configuré

**Patterns identifiés à réutiliser**
- Admin pages suivent un pattern cohérent (AdminProducts.tsx comme référence)
- Routes API: `/api/admin/*` (non protégées pour l'instant)
- Client API: `admin-api.ts` avec fetch simple
- UI: Radix UI + Tailwind + shadcn/ui
- Dark mode actif par défaut

---

## 🎯 PHASE 2 - Schéma Base de Données & Migrations

### Actions :

#### 1. Migrer du mem-store vers PostgreSQL
- ✅ Schémas existants: `products`, `orders`, `withdrawals`, `profile`
- 🔧 À créer: `categories`, `suppliers`, `delivery_agencies`, `affiliates`

#### 2. Créer les tables Telegram

**Tables à créer dans `lib/db/src/schema/`:**

##### A. `telegram_connections.ts`
```sql
telegram_connections
- id (serial PK)
- user_id (int, FK vers users - à créer)
- phone_number (varchar masked)
- session_string (text encrypted)
- status (enum: active, disconnected, error)
- api_id (text encrypted)
- api_hash (text encrypted)  
- created_at (timestamp)
- updated_at (timestamp)
- last_connected_at (timestamp)
```

##### B. `telegram_channels.ts`
```sql
telegram_channels
- id (serial PK)
- telegram_channel_id (bigint unique) -- ID Telegram réel
- name (text)
- username (text nullable)
- supplier_id (int nullable, FK vers suppliers)
- is_monitored (boolean default false)
- last_message_id (bigint nullable)
- last_message_at (timestamp nullable)
- metadata (jsonb) -- avatar, description, etc.
- created_at (timestamp)
- updated_at (timestamp)
```

##### C. `telegram_messages.ts`
```sql
telegram_messages
- id (serial PK)
- telegram_message_id (bigint)
- telegram_channel_id (bigint, FK vers telegram_channels)
- supplier_id (int nullable, FK vers suppliers)
- grouped_id (bigint nullable) -- pour les albums
- message_text (text nullable)
- message_date (timestamp)
- message_type (enum: text, photo, video, document, album)
- sender_id (bigint nullable)
- permalink (text nullable)
- raw_metadata (jsonb)
- status (enum: new, processing, extracted, validated, published, ignored)
- created_at (timestamp)
- updated_at (timestamp)

UNIQUE (telegram_channel_id, telegram_message_id)
INDEX (grouped_id)
INDEX (supplier_id)
INDEX (status)
INDEX (message_date DESC)
```

##### D. `telegram_media.ts`
```sql
telegram_media
- id (serial PK)
- telegram_message_id (int, FK vers telegram_messages)
- media_type (enum: image, video, document, audio)
- storage_path (text) -- Chemin Supabase Storage
- public_url (text nullable)
- file_name (text)
- mime_type (text nullable)
- file_size (bigint nullable)
- display_order (int default 0)
- thumbnail_url (text nullable)
- metadata (jsonb)
- created_at (timestamp)

INDEX (telegram_message_id)
```

##### E. `supplier_products.ts`
```sql
supplier_products
- id (serial PK)
- supplier_id (int, FK vers suppliers)
- source_message_id (int nullable, FK vers telegram_messages)
- title (text)
- description (text nullable)
- price (numeric nullable)
- wholesale_price (numeric nullable)
- category_id (int nullable, FK vers categories)
- status (enum: new, analyzing, validated, published, rejected)
- extracted_data (jsonb) -- prix, couleurs, tailles, etc.
- images (jsonb) -- array URLs
- created_at (timestamp)
- updated_at (timestamp)

INDEX (supplier_id)
INDEX (status)
INDEX (created_at DESC)
```

##### F. `users.ts` (NOUVEAU - pour l'authentification)
```sql
users
- id (serial PK)
- email (text unique)
- password_hash (text)
- full_name (text)
- role (enum: admin, affiliate, user)
- is_active (boolean default true)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. Mises à jour tables existantes

**Suppliers** (à ajouter dans schéma):
```sql
suppliers
- id (serial PK)
- name (text)
- phone (text)
- whatsapp (text nullable)
- email (text nullable)
- address (text nullable)
- city (text nullable)
- category (text nullable)
- telegram_channel_id (bigint nullable UNIQUE, FK vers telegram_channels)
- notes (text nullable)
- is_active (boolean default true)
- created_at (timestamp)
- updated_at (timestamp)
```

---

## 🔐 PHASE 3 - Système d'Authentification

### À créer :

#### 1. Backend Auth

**Fichiers à créer:**
```
artifacts/api-server/src/
├── middlewares/
│   ├── auth.ts          # JWT verification middleware
│   └── admin.ts         # Admin role check middleware
├── routes/
│   └── auth.ts          # Login, register, logout
└── lib/
    ├── jwt.ts           # Token generation/verification
    └── hash.ts          # Password hashing (bcrypt)
```

#### 2. Variables d'environnement

**.env à mettre à jour:**
```env
# Existant
DATABASE_URL=postgresql://...
PORT=8080
NODE_ENV=development

# NOUVEAU - Auth
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# NOUVEAU - Telegram
TELEGRAM_API_ID=your-api-id
TELEGRAM_API_HASH=your-api-hash
TELEGRAM_SESSION_ENCRYPTION_KEY=your-encryption-key

# NOUVEAU - Supabase (optionnel si utilisé)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

#### 3. Routes à protéger

**Mettre à jour `artifacts/api-server/src/routes/admin.ts`:**
```typescript
import { requireAuth, requireAdmin } from '../middlewares/auth'

// Protéger toutes les routes admin
router.use(requireAuth)
router.use(requireAdmin)

// Puis les routes existantes...
```

---

## 🤖 PHASE 4 - Service Telegram MTProto

### Architecture du service :

#### 1. Package lib/telegram

**Structure:**
```
lib/telegram/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Export principal
│   ├── client/
│   │   ├── mtproto-client.ts    # Client Telethon/MTProto
│   │   ├── auth.ts              # Authentification Telegram
│   │   └── session-manager.ts   # Gestion sessions
│   ├── collectors/
│   │   ├── message-collector.ts # Collecteur messages
│   │   └── media-downloader.ts  # Téléchargeur médias
│   ├── parsers/
│   │   ├── text-parser.ts       # Extraction infos (prix, etc.)
│   │   └── media-parser.ts      # Traitement médias
│   └── storage/
│       ├── supabase-storage.ts  # Upload Supabase
│       └── local-storage.ts     # Fallback local
```

#### 2. Dépendances

**lib/telegram/package.json:**
```json
{
  "name": "@workspace/telegram",
  "version": "0.0.1",
  "type": "module",
  "dependencies": {
    "telegram": "^2.25.16",
    "@workspace/db": "workspace:*",
    "drizzle-orm": "catalog:",
    "input": "^1.0.1",
    "@supabase/supabase-js": "^2.39.7"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "typescript": "catalog:"
  }
}
```

#### 3. Service principal

**lib/telegram/src/client/mtproto-client.ts** - Client Telegram persistant

**lib/telegram/src/collectors/message-collector.ts** - Écoute nouveaux messages

**Fonctionnalités:**
- Connexion/déconnexion Telegram
- Écoute temps réel des canaux surveillés
- Détection des nouveaux messages
- Éviter les doublons (check DB par channel_id + message_id)
- Gestion des albums (grouped_id)
- Reconnexion automatique
- Gestion d'état (RUNNING, STOPPED, ERROR)

---

## 📡 PHASE 5 - API Backend Telegram

### Routes à créer dans `artifacts/api-server/src/routes/telegram.ts`:

```typescript
// ============ CONNEXION TELEGRAM ============
GET    /api/telegram/status             // État collecteur
POST   /api/telegram/start              // Démarrer collecteur
POST   /api/telegram/stop               // Arrêter collecteur
POST   /api/telegram/connect            // Connexion compte Telegram
POST   /api/telegram/disconnect         // Déconnexion

// ============ CANAUX ============
GET    /api/telegram/channels           // Liste tous les canaux accessibles
GET    /api/telegram/channels/:id       // Détail canal
POST   /api/telegram/channels/:id/monitor      // Activer surveillance
POST   /api/telegram/channels/:id/unmonitor    // Désactiver surveillance
PATCH  /api/telegram/channels/:id       // Associer fournisseur

// ============ MESSAGES ============
GET    /api/telegram/messages           // Liste messages reçus (filtres: supplier, channel, status, date)
GET    /api/telegram/messages/:id       // Détail message avec médias
PATCH  /api/telegram/messages/:id       // Mettre à jour status

// ============ PRODUITS FOURNISSEURS ============
GET    /api/telegram/products           // Produits extraits des messages
GET    /api/telegram/products/:id       // Détail produit
PATCH  /api/telegram/products/:id       // Modifier produit
POST   /api/telegram/products/:id/validate     // Valider produit
POST   /api/telegram/products/:id/publish      // Publier produit
DELETE /api/telegram/products/:id       // Ignorer/supprimer

// ============ FOURNISSEURS ============
GET    /api/telegram/suppliers          // Liste fournisseurs avec stats Telegram
PATCH  /api/telegram/suppliers/:id      // Associer canal Telegram

// ============ MÉDIAS ============
GET    /api/telegram/media/:id          // URL média
POST   /api/telegram/media/upload       // Upload manuel
DELETE /api/telegram/media/:id          // Supprimer média

// ============ LOGS & ACTIVITÉ ============
GET    /api/telegram/activity           // Activité récente
GET    /api/telegram/logs               // Logs erreurs
```

**Toutes ces routes doivent être protégées** par `requireAuth` + `requireAdmin`.

---

## 🎨 PHASE 6 - Interface Backoffice

### Pages à créer dans `artifacts/digital-ecom-land/src/pages/admin/`:

#### 1. **AdminTelegramDashboard.tsx**

**URL:** `/admin/telegram`

**Contenu:**
- **Card Status Collecteur**
  - Badge: En ligne / Arrêté / Erreur
  - Bouton Démarrer / Arrêter
  - Dernier message reçu
  - Uptime

- **Cards Statistiques**
  - Nombre de canaux surveillés
  - Nombre de fournisseurs connectés
  - Messages reçus aujourd'hui / cette semaine
  - Produits en attente de validation
  
- **Activité Récente** (Timeline)
  - 10 derniers messages/événements

- **Erreurs Récentes**
  - Liste des erreurs avec timestamp

#### 2. **AdminTelegramChannels.tsx**

**URL:** `/admin/telegram/channels`

**Contenu:**
- **Liste des canaux Telegram**
  - Recherche/filtres
  - Table/Cards:
    - Avatar
    - Nom du canal
    - Username (@example)
    - Fournisseur associé (select)
    - Statut: Surveillé / Non surveillé
    - Dernier message
    - Nombre messages collectés
    - Actions: Activer/Désactiver, Modifier

#### 3. **AdminTelegramProducts.tsx**

**URL:** `/admin/telegram/products`

**Contenu:**
- **Liste des produits reçus depuis Telegram**
  - Filtres: Fournisseur, Canal, Statut, Date
  - Vue Cards ou Tableau
  - Pour chaque produit:
    - Image principale + galerie
    - Texte original Telegram
    - Titre extrait (éditable)
    - Prix extrait (éditable)
    - Fournisseur + Canal source
    - Date réception
    - Statut: Nouveau / À analyser / Validé / Ignoré
    - Actions:
      - Voir détails
      - Modifier
      - Valider
      - Ignorer

#### 4. **AdminTelegramProductDetail.tsx** (Modal ou Page)

**Contenu:**
- **Galerie images** (swipeable)
- **Informations extraites** (éditables)
  - Titre
  - Description
  - Prix de gros
  - Prix suggéré
  - Catégorie
  - Caractéristiques (tailles, couleurs, etc.)
- **Message original Telegram** (read-only)
- **Fournisseur & Canal**
- **Actions**:
  - Sauvegarder modifications
  - Valider et créer produit principal
  - Envoyer vers workflow n8n
  - Ignorer

#### 5. **AdminTelegramSuppliers.tsx**

**URL:** `/admin/telegram/suppliers`

**Contenu:**
- Réutiliser la page `AdminSuppliers.tsx` existante
- Ajouter champ: "Canal Telegram associé" (select)
- Afficher stats Telegram par fournisseur:
  - Nombre messages reçus
  - Dernier message
  - Nombre produits validés

#### 6. **AdminTelegramLogs.tsx**

**URL:** `/admin/telegram/logs`

**Contenu:**
- **Timeline des événements**
  - Type: Info / Warning / Error
  - Message
  - Timestamp
  - Détails (JSON expandable)

### Client API Frontend

**Créer `artifacts/digital-ecom-land/src/lib/telegram-api.ts`:**

```typescript
// Pattern similaire à admin-api.ts
export interface TelegramChannel {
  id: number
  telegramChannelId: string
  name: string
  username: string | null
  supplierId: number | null
  isMonitored: boolean
  lastMessageAt: string | null
  metadata: any
}

export interface TelegramMessage {
  id: number
  telegramMessageId: string
  channelId: string
  supplierName: string | null
  text: string
  messageDate: string
  messageType: string
  media: TelegramMedia[]
  status: string
}

export interface TelegramMedia {
  id: number
  mediaType: string
  publicUrl: string
  fileName: string
}

export interface TelegramProduct {
  id: number
  supplierId: number
  supplierName: string
  sourceMessageId: number
  title: string
  description: string | null
  price: number | null
  status: string
  images: string[]
  extractedData: any
  createdAt: string
}

// Fonctions API
export const getTelegramStatus = () => req<any>("/api/telegram/status")
export const startTelegramCollector = () => req("/api/telegram/start", { method: "POST" })
export const stopTelegramCollector = () => req("/api/telegram/stop", { method: "POST" })

export const getTelegramChannels = () => req<TelegramChannel[]>("/api/telegram/channels")
export const monitorChannel = (id: number) => req(`/api/telegram/channels/${id}/monitor`, { method: "POST" })
export const unmonitorChannel = (id: number) => req(`/api/telegram/channels/${id}/unmonitor`, { method: "POST" })

export const getTelegramMessages = (filters?: any) => req<TelegramMessage[]>("/api/telegram/messages", { method: "GET", /* query params */ })
export const getTelegramProducts = (filters?: any) => req<TelegramProduct[]>("/api/telegram/products")
export const updateTelegramProduct = (id: number, data: Partial<TelegramProduct>) => 
  req(`/api/telegram/products/${id}`, { method: "PATCH", body: JSON.stringify(data) })
export const validateTelegramProduct = (id: number) => 
  req(`/api/telegram/products/${id}/validate`, { method: "POST" })
```

### Navigation

**Mettre à jour `artifacts/digital-ecom-land/src/components/AdminLayout.tsx`:**

```typescript
import { MessageCircle } from "lucide-react"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: Tag },
  { href: "/admin/suppliers", label: "Fournisseurs", icon: Factory },
  { href: "/admin/delivery-agencies", label: "Agences Livraison", icon: Truck },
  { href: "/admin/affiliates", label: "Affiliés", icon: Users },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  // NOUVEAU
  { href: "/admin/telegram", label: "Telegram Hub", icon: MessageCircle },
]
```

### Routing

**Mettre à jour `artifacts/digital-ecom-land/src/App.tsx`:**

```typescript
import { AdminTelegramDashboard } from '@/pages/admin/AdminTelegramDashboard'
import { AdminTelegramChannels } from '@/pages/admin/AdminTelegramChannels'
import { AdminTelegramProducts } from '@/pages/admin/AdminTelegramProducts'
import { AdminTelegramSuppliers } from '@/pages/admin/AdminTelegramSuppliers'
import { AdminTelegramLogs } from '@/pages/admin/AdminTelegramLogs'

// Dans Router()
<Route path="/admin/telegram">
  <AdminLayout><AdminTelegramDashboard /></AdminLayout>
</Route>
<Route path="/admin/telegram/channels">
  <AdminLayout><AdminTelegramChannels /></AdminLayout>
</Route>
<Route path="/admin/telegram/products">
  <AdminLayout><AdminTelegramProducts /></AdminLayout>
</Route>
<Route path="/admin/telegram/suppliers">
  <AdminLayout><AdminTelegramSuppliers /></AdminLayout>
</Route>
<Route path="/admin/telegram/logs">
  <AdminLayout><AdminTelegramLogs /></AdminLayout>
</Route>
```

---

## 📦 PHASE 7 - Supabase Storage (Médias)

### Configuration Supabase

#### 1. Créer projet Supabase
- https://supabase.com/dashboard
- Créer nouveau projet
- Récupérer: URL, anon key, service key

#### 2. Créer bucket Storage

**Bucket:** `telegram-media`
- Public: Oui (ou signed URLs)
- Allowed MIME types: image/*, video/*, application/pdf

**Structure folders:**
```
telegram-media/
├── images/
│   ├── {channel_id}/
│   │   └── {message_id}_0.jpg
│   │   └── {message_id}_1.jpg
├── videos/
│   └── {channel_id}/
│       └── {message_id}.mp4
└── documents/
    └── {channel_id}/
        └── {message_id}_document.pdf
```

#### 3. Intégrer dans le code

**lib/telegram/src/storage/supabase-storage.ts:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service key côté serveur
)

export async function uploadTelegramMedia(
  file: Buffer,
  fileName: string,
  channelId: string,
  messageId: string,
  mediaType: 'image' | 'video' | 'document'
): Promise<string> {
  const path = `${mediaType}s/${channelId}/${messageId}_${fileName}`
  
  const { data, error } = await supabase.storage
    .from('telegram-media')
    .upload(path, file, {
      contentType: getContentType(fileName),
      upsert: false
    })
  
  if (error) throw error
  
  // Retourner URL publique
  const { data: { publicUrl } } = supabase.storage
    .from('telegram-media')
    .getPublicUrl(path)
  
  return publicUrl
}
```

---

## 🔍 PHASE 8 - Extraction Intelligente

### Parsers à créer

#### 1. **Text Parser** (`lib/telegram/src/parsers/text-parser.ts`)

**Fonction:** Extraire informations du texte Telegram (arabe, français, anglais)

**Extraction:**
- **Prix**: Patterns regex
  - `\d+\s*(DH|DA|dh|da|د\.م|د\.ج)`
  - `prix\s*:\s*\d+`
  - `السعر\s*:\s*\d+`
  
- **Prix de gros**: 
  - `grossiste\s*:\s*\d+`
  - `سعر الجملة\s*:\s*\d+`

- **Téléphone**:
  - `\+?\d{10,14}`
  - `0\d{9}`

- **WhatsApp**:
  - Même pattern que téléphone + contexte "whatsapp"

- **Quantité minimale**:
  - `minimum\s*:\s*\d+`
  - `الحد الأدنى\s*:\s*\d+`

- **Caractéristiques**:
  - Couleurs, tailles, etc.

**Exemple:**
```typescript
export interface ExtractedInfo {
  title?: string
  price?: number
  wholesalePrice?: number
  minOrder?: number
  phone?: string
  whatsapp?: string
  colors?: string[]
  sizes?: string[]
  location?: string
  category?: string
}

export function parseMessageText(text: string): ExtractedInfo {
  // Implémentation avec regex + patterns multilingues
}
```

#### 2. **Media Parser** (`lib/telegram/src/parsers/media-parser.ts`)

**Fonction:** Traiter les médias

- Détecter type (photo, video, document)
- Extraire métadonnées (dimensions, durée, taille)
- Générer thumbnails si nécessaire (avec `sharp`)

---

## 🤝 PHASE 9 - Logs, Monitoring & Robustesse

### 1. Logs structurés

**Utiliser Pino** (déjà configuré):

```typescript
import { logger } from '@/lib/logger'

logger.info({ channelId, messageId }, 'New message received')
logger.error({ error: err.message }, 'Failed to download media')
logger.warn({ reconnectAttempt: 3 }, 'Reconnecting to Telegram')
```

### 2. Table Activity Logs

**Créer `lib/db/src/schema/telegram_activity.ts`:**
```sql
telegram_activity
- id (serial PK)
- event_type (enum: connection, message_received, media_downloaded, product_created, error, etc.)
- severity (enum: info, warning, error)
- message (text)
- metadata (jsonb)
- created_at (timestamp)

INDEX (event_type)
INDEX (severity)
INDEX (created_at DESC)
```

### 3. Gestion État Collecteur

**États possibles:**
- `STOPPED` - Arrêté
- `STARTING` - Démarrage en cours
- `RUNNING` - En fonctionnement
- `ERROR` - Erreur
- `RECONNECTING` - Reconnexion en cours

**Stocker l'état dans une table:**
```sql
telegram_collector_state
- id (serial PK)
- status (enum)
- error_message (text nullable)
- started_at (timestamp nullable)
- stopped_at (timestamp nullable)
- last_heartbeat (timestamp nullable)
- updated_at (timestamp)
```

### 4. Reconnexion Automatique

**Stratégie exponential backoff:**
```typescript
let reconnectAttempt = 0
const maxAttempts = 10

async function reconnect() {
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 60000)
  reconnectAttempt++
  
  logger.warn({ reconnectAttempt, delay }, 'Reconnecting...')
  
  await sleep(delay)
  
  try {
    await client.connect()
    reconnectAttempt = 0
    logger.info('Reconnected successfully')
  } catch (err) {
    if (reconnectAttempt < maxAttempts) {
      reconnect()
    } else {
      logger.error('Max reconnect attempts reached')
      updateCollectorState('ERROR', 'Max reconnect attempts')
    }
  }
}
```

---

## 🌐 PHASE 10 - Préparation Intégration n8n

### Webhooks Internes

#### 1. Système d'événements

**Créer `lib/telegram/src/events/telegram-events.ts`:**
```typescript
export enum TelegramEvent {
  MESSAGE_RECEIVED = 'telegram.message.received',
  PRODUCT_VALIDATED = 'telegram.product.validated',
  MEDIA_DOWNLOADED = 'telegram.media.downloaded',
}

export interface EventPayload {
  eventType: TelegramEvent
  timestamp: string
  data: any
}

export async function emitEvent(event: TelegramEvent, data: any) {
  const payload: EventPayload = {
    eventType: event,
    timestamp: new Date().toISOString(),
    data
  }
  
  // Option 1: Appel webhook n8n
  if (process.env.N8N_WEBHOOK_URL) {
    await fetch(process.env.N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }
  
  // Option 2: Queue (Redis, Bull, etc.)
  // await queue.add('telegram-events', payload)
}
```

#### 2. Endpoint Webhook

**Route:** `POST /api/telegram/webhook/n8n`

**Fonction:** Recevoir commandes depuis n8n (optionnel)

---

## 🔒 SÉCURITÉ - Points Critiques

### Variables d'environnement sensibles

**NE JAMAIS COMMIT:**
- `.env`
- `.env.local`
- `*.session` (fichiers session Telegram)
- `credentials.json`

**Ajouter au .gitignore:**
```
.env
.env.local
.env.production
*.session
lib/telegram/sessions/*
credentials.json
```

### Chiffrement

**Session Telegram:**
- Chiffrer `session_string` avant stockage en DB
- Utiliser `crypto` Node.js + clé d'environnement

**API Keys:**
- Chiffrer `api_hash` en DB
- Ne jamais exposer au frontend

### Rate Limiting

**Ajouter middleware:**
```typescript
import rateLimit from 'express-rate-limit'

const telegramLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requêtes
  message: 'Too many requests from this IP'
})

router.use('/telegram', telegramLimiter)
```

### Validation Inputs

**Utiliser Zod** sur toutes les routes:
```typescript
import { z } from 'zod'

const MonitorChannelSchema = z.object({
  channelId: z.number().positive()
})

router.post('/channels/:id/monitor', async (req, res) => {
  const parsed = MonitorChannelSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error })
  }
  // ...
})
```

---

## ✅ CRITÈRES DE RÉUSSITE

Le module sera considéré comme terminé et fonctionnel lorsque :

### Tests Fonctionnels

- [ ] Je peux me connecter avec mon compte Telegram admin
- [ ] La session est persistée et rechargée après redémarrage
- [ ] Je vois la liste de tous mes canaux Telegram
- [ ] Je peux activer/désactiver la surveillance d'un canal
- [ ] Je peux associer un canal à un fournisseur
- [ ] Le collecteur démarre depuis l'interface admin
- [ ] Un nouveau message dans un canal surveillé est détecté
- [ ] Le texte du message est enregistré en DB
- [ ] Les images sont téléchargées automatiquement
- [ ] Les images sont uploadées vers Supabase Storage
- [ ] Les URLs publiques sont enregistrées en DB
- [ ] Les albums Telegram sont regroupés (même grouped_id)
- [ ] Le fournisseur associé est identifié
- [ ] Le produit/message apparaît dans "Produits reçus"
- [ ] Je peux voir toutes les infos du produit (texte, images, fournisseur, canal)
- [ ] Je peux modifier le produit (titre, prix, etc.)
- [ ] Je peux valider le produit
- [ ] Les doublons sont évités (unique constraint)
- [ ] Le collecteur peut être arrêté depuis l'interface
- [ ] Le collecteur se reconnecte automatiquement après coupure réseau
- [ ] Les erreurs sont loggées et visibles dans l'interface
- [ ] Le système gère plusieurs fournisseurs et plusieurs canaux
- [ ] Un webhook peut être appelé quand un produit est validé (n8n ready)

### Tests Techniques

- [ ] Toutes les routes admin sont protégées (requireAuth + requireAdmin)
- [ ] Les sessions Telegram sont chiffrées en DB
- [ ] Les API keys ne sont jamais exposées au frontend
- [ ] Rate limiting actif sur les routes Telegram
- [ ] Validation Zod sur tous les inputs
- [ ] Migrations DB appliquées sans erreur
- [ ] Aucune donnée n'est perdue après redémarrage
- [ ] Performance: <2s pour détecter nouveau message
- [ ] Performance: <5s pour télécharger + uploader une image
- [ ] Memory leaks: Pas de fuite mémoire après 1h de fonctionnement

---

## 📂 RÉSUMÉ DES FICHIERS À CRÉER/MODIFIER

### CRÉER (Nouveau)

**Base de données:**
```
lib/db/src/schema/
├── users.ts
├── telegram_connections.ts
├── telegram_channels.ts
├── telegram_messages.ts
├── telegram_media.ts
├── supplier_products.ts
├── telegram_activity.ts
└── telegram_collector_state.ts
```

**Package Telegram:**
```
lib/telegram/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── client/
    │   ├── mtproto-client.ts
    │   ├── auth.ts
    │   └── session-manager.ts
    ├── collectors/
    │   ├── message-collector.ts
    │   └── media-downloader.ts
    ├── parsers/
    │   ├── text-parser.ts
    │   └── media-parser.ts
    ├── storage/
    │   ├── supabase-storage.ts
    │   └── local-storage.ts
    └── events/
        └── telegram-events.ts
```

**Backend:**
```
artifacts/api-server/src/
├── middlewares/
│   ├── auth.ts
│   └── admin.ts
├── routes/
│   ├── auth.ts
│   └── telegram.ts
└── lib/
    ├── jwt.ts
    └── hash.ts
```

**Frontend:**
```
artifacts/digital-ecom-land/src/
├── pages/admin/
│   ├── AdminTelegramDashboard.tsx
│   ├── AdminTelegramChannels.tsx
│   ├── AdminTelegramProducts.tsx
│   ├── AdminTelegramSuppliers.tsx
│   └── AdminTelegramLogs.tsx
└── lib/
    └── telegram-api.ts
```

### MODIFIER (Existant)

```
.env.example                                    # Ajouter vars Telegram/Supabase
.gitignore                                      # Ajouter *.session
artifacts/api-server/src/routes/admin.ts        # Ajouter middleware auth
artifacts/api-server/src/routes/index.ts        # Importer route telegram
artifacts/digital-ecom-land/src/App.tsx         # Ajouter routes Telegram
artifacts/digital-ecom-land/src/components/AdminLayout.tsx  # Ajouter menu Telegram
lib/db/src/schema/suppliers.ts                  # Ajouter telegram_channel_id
pnpm-workspace.yaml                             # Ajouter lib/telegram (si nécessaire)
```

---

## 🚀 PROCHAINES ÉTAPES IMMÉDIATES

### PRIORITÉ 1 (Bloquant)
1. ✅ Créer système d'authentification (users, JWT, middleware)
2. ✅ Migrer du mem-store vers PostgreSQL
3. ✅ Créer schémas DB Telegram

### PRIORITÉ 2 (Core)
4. ✅ Créer package lib/telegram
5. ✅ Implémenter client MTProto + auth Telegram
6. ✅ Créer routes backend Telegram
7. ✅ Intégrer Supabase Storage

### PRIORITÉ 3 (Interface)
8. ✅ Créer pages admin Telegram
9. ✅ Tester collecteur avec canal test `-1001155338501`

### PRIORITÉ 4 (Polish)
10. ✅ Extraction intelligente texte
11. ✅ Logs et monitoring
12. ✅ Tests complets
13. ✅ Préparation n8n

---

**PRÊT À COMMENCER L'IMPLÉMENTATION !**

Voulez-vous que je commence par la PHASE 2 (Schémas DB) ou préférez-vous commencer par l'authentification (PHASE 3) ?
