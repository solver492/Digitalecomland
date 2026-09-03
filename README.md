# Digitalecomland

Plateforme d'affiliation e-commerce COD pour le marché marocain et africain.

## Architecture

- Frontend : React, Vite, Tailwind CSS dans `artifacts/digital-ecom-land`
- API : Express et TypeScript dans `artifacts/api-server`
- Authentification et données : Supabase Auth et PostgreSQL
- Packages partagés : `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`
- Gestionnaire de paquets : pnpm

L'API Express est la couche d'accès aux données métier. Le navigateur utilise
uniquement le client Supabase avec la clé publishable pour l'authentification ;
la clé service-role reste exclusivement côté serveur.

## Installation

```bash
pnpm install
```

## Variables d'environnement

Copiez `.env.example` vers `.env` et renseignez :

| Variable | Utilisation |
| --- | --- |
| `VITE_SUPABASE_URL` | URL publique Supabase utilisée par le frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clé publishable/anon, uniquement frontend |
| `SUPABASE_URL` | URL Supabase utilisée par Express |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur Supabase, jamais exposée au navigateur |

Le projet Supabase cible `nfoefhwmgjatbqyibclp`. Ne committez jamais `.env`,
`.env.local` ou `.env.production`.

## Développement

Lancer les deux services dans des terminaux séparés :

```bash
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/digital-ecom-land run dev
```

Le frontend proxy les requêtes `/api` vers `API_PORT` (3001 par défaut).
L'API expose `/api/healthz`, qui est la seule route publique. Les autres
routes demandent un bearer token Supabase ; les routes `/api/admin/*` demandent
un profil dont le rôle est `admin`.

## Base de données et migration

Le schéma métier existant doit être inspecté avant toute modification. La
migration `supabase/migrations/001_auth_ownership.sql` ajoute uniquement la
propriété nécessaire aux commandes et retraits affiliés, active RLS et crée
des politiques limitées à `auth.uid()`. Elle ne recrée pas les tables
existantes et ne doit être appliquée qu'après vérification du schéma Supabase.

## Build et Hostinger

```bash
pnpm build
pnpm typecheck
```

Pour Hostinger, servez le contenu frontend produit par Vite et démarrez
l'API Node avec les variables serveur (`SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `PORT`, `NODE_ENV`). Aucun service Replit ou Vercel
n'est requis pour l'exécution.