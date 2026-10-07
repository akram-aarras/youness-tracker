# Architecture & Spécifications Techniques — Youness WiFi (WISP Manager)

Ce document détaille l'architecture logicielle complète, le modèle de données, les flux d'exécution et les règles de gestion du système de gestion des opérations réseau et abonnés **Youness WiFi** (Tétouan, Maroc).

---

## 1. Vue d'Ensemble & Stack Technique

### 1.1 Présentation Générale
**Youness WiFi** est une application web progressive (PWA-ready) et un système d'information de gestion d'opérations réseau pour un **fournisseur d'accès Internet sans fil de proximité (WISP — Wireless Internet Service Provider)** opérant dans la ville de Tétouan et ses environs (quartiers Wilaya, Boujarah, Sania Rmel, Touabel, Coelma, Martil, etc.).

Le système permet de piloter l'intégralité du cycle de vie opérationnel :
1. **Gestion du parc d'abonnés :** Recensement des clients, assignation des plans tarifaires (notamment le forfait économique à 50 MAD et les forfaits 100+ MAD), inventaire du matériel radio client (antennes CPE Ubiquiti / MikroTik, routeurs Wi-Fi, adresses IP locales, comptes PPPoE).
2. **Facturation & Recouvrement :** Suivi des échéances d'abonnement, encaissement multi-moyens (espèces, virements bancaires, CIH Bank, Wafacash), calcul arithmétique dynamique des arriérés, grand livre d'audit mensuel avec gestion des avances, émission et impression de reçus officiels (`REC-YYYYMMDD-XXXX`), et relances WhatsApp en un clic en Darija marocaine ou en Français.
3. **Dispatch & Gestion des Incidents Terrain :** Tableau de bord des tickets de support (coupures, signaux dégradés, pannes d'alimentations PoE), attribution aux techniciens selon leur spécialité, interface mobile ultra-légère réservée aux techniciens en tournée avec navigation GPS directe et saisie des notes de clôture.
4. **Administration & Contrôle d'Accès (RBAC) :** Ségrégation stricte des rôles entre l'Administrateur NOC (accès complet à la trésorerie et configuration) et les Techniciens Terrain (accès restreint aux interventions assignées).

```
                      ┌──────────────────────────────────────────────────┐
                      │              CLIENTS / NAVIGATEURS               │
                      │  Admin (PC / NOC)   │  Technicien (Mobile / 4G)  │
                      └───────────────┬──────────────────┬───────────────┘
                                      │                  │
                                      ▼                  ▼
                      ┌──────────────────────────────────────────────────┐
                      │             NEXT.JS 16 (Turbopack)               │
                      │  Middleware (Vérification Cookie & Rôles RBAC)   │
                      │  App Router (Pages SSR & Client Components)      │
                      │  API Routes (/api/auth/login, logout, session)   │
                      └───────────────────────┬──────────────────────────┘
                                              │
                      ┌───────────────────────┴──────────────────────────┐
                      │             ÉTAT GLOBAL CLIENT (Store)           │
                      │  React Context + LocalStorage (Cache & Offline)  │
                      └───────────────────────┬──────────────────────────┘
                                              │
                                              ▼
                      ┌──────────────────────────────────────────────────┐
                      │              SUPABASE (Cloud Backend)            │
                      │  PostgreSQL Database (Tables relationnelles)     │
                      │  Realtime Engine (WebSockets postgres_changes)   │
                      │  Row Level Security (RLS) & Triggers             │
                      └──────────────────────────────────────────────────┘
```

---

### 1.2 Articulation des Technologies Clés

| Composant | Version / Outil | Rôle Technique & Justification |
| :--- | :--- | :--- |
| **Framework Web** | Next.js `16.3.8` (Turbopack) | Utilisation de l'App Router. Séparation stricte entre les composants serveur pour le routage/API et les composants clients (`'use client'`) pour l'interactivité riche du tableau de bord. |
| **Bibliothèque UI** | React `19.2.8` & React DOM | Utilisation des hooks récents (`useMemo`, `useCallback`, `useEffect`), gestion optimisée des re-rendus et transition fluide. |
| **Langage** | TypeScript `5.x` | Typage fort de bout en bout (`Client`, `PaymentLog`, `Ticket`, `User`, `HardwareDetails`). Élimination totale des erreurs de cast et protection contre les valeurs `null`/`undefined`. |
| **Moteur CSS** | Tailwind CSS `v4` | Framework CSS utilitaire avec `@tailwindcss/postcss`. Prise en charge des variantes personnalisées de thème, gestion native du mode sombre/clair, et isolation `@media print` pour l'impression de tickets. |
| **Base de Données & Temps Réel** | Supabase (`@supabase/supabase-js v2.117.2`) | PostgreSQL hébergé dans le Cloud. Prise en charge des contraintes d'intégrité relationnelle (`ON DELETE CASCADE`), index B-Tree, et WebSockets Realtime pour la réplication bidirectionnelle instantanée sur PC et smartphones. |
| **Gestion de Thème** | `next-themes` `0.4.6` | Injection de la classe `.dark` sur `<html>`, synchronisation avec la préférence locale et élimination du flash de rendu SSR (`suppressHydrationWarning`). |
| **Icônes** | `lucide-react` `1.51.0` | Bibliothèque vectorielle légère et unifiée pour tous les indicateurs visuels (signaux RF, états réseau, actions rapides). |
| **Hébergement & CI/CD** | Vercel / Edge Runtime | Déploiement automatisé avec optimisations automatiques des bundles, routes API serverless et Middleware Edge. |

---

## 2. Modèle de Données & Base Supabase

Le schéma SQL se trouve dans `supabase/schema.sql`. Il structure les tables relationnelles, les contraintes d'intégrité, les clés étrangères avec suppression en cascade, ainsi que les politiques de sécurité Row-Level Security (RLS).

### 2.1 Schéma Relationnel des Tables

```
                    ┌────────────────────────┐
                    │      auth.users        │
                    └───────────┬────────────┘
                                │ 1:1
                                ▼
                    ┌────────────────────────┐
                    │     user_profiles      │
                    │  (id, role, name...)   │
                    └───────────┬────────────┘
                                │ 1:1 (optionnel)
                                ▼
                    ┌────────────────────────┐
                    │      technicians       │
                    │   (id, name, spec...)  │
                    └───────────┬────────────┘
                                │ 1:N
                                ▼ (assignation)
 ┌────────────────────────┐     │     ┌────────────────────────┐
 │        clients         ├─────┴────►│        tickets         │
 │ (id, name, phone,      │           │ (id, client_id, cat,   │
 │  next_due_date, hw...) │           │  priority, status...)  │
 └───────────┬────────────┘           └────────────────────────┘
             │ 1:N
             ▼ (historique)
 ┌────────────────────────┐
 │      payment_logs      │
 │ (id, client_id, amount,│
 │  receipt_number...)    │
 └────────────────────────┘
```

---

### 2.2 Définition des Tables et Contraintes

#### A. Table `clients`
Stocke les fiches des abonnés au réseau Wi-Fi avec leur configuration technique et leur échéance de facturation.

| Champ | Type SQL | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Identifiant lisible (ex: `cli-001`, `cli-042`). |
| `name` | `TEXT` | `NOT NULL` | Nom complet de l'abonné (supporte l'Arabe et le Français). |
| `phone` | `TEXT` | `NOT NULL` | Numéro de téléphone marocain (format `06...`, `07...` ou `212...`). |
| `neighborhood` | `TEXT` | Optionnel | Quartier de Tétouan (ex: Wilaya, Boujarah, Sania Rmel, Touabel...). |
| `address` | `TEXT` | Optionnel | Adresse textuelle libre (numéro de rue, derb, immeuble, étage). |
| `gps_coordinates` | `TEXT` | Optionnel | Coordonnées de localisation (ex: `35.5784,-5.3684`). |
| `google_maps_url` | `TEXT` | Optionnel | Lien direct d'itinéraire Google Maps. |
| `status` | `TEXT` | `CHECK (status IN ('active', 'due_soon', 'overdue', 'suspended', 'archived'))` | Statut opérationnel calculé dynamiquement par rapport à l'échéance. |
| `monthly_fee` | `NUMERIC` | `DEFAULT 50` | Tarif mensuel récurrent en Dirhams marocains (MAD). |
| `subscription_plan`| `TEXT` | Optionnel | Libellé du forfait souscrit (ex: Pack Éco 50 MAD, Pack Standard 100 MAD). |
| `next_due_date` | `DATE` | `NOT NULL` | Date d'échéance du prochain paiement (`YYYY-MM-DD`). |
| `last_payment_date`| `DATE` | Optionnel | Date du dernier règlement enregistré (`YYYY-MM-DD`). |
| `installation_date`| `DATE` | Optionnel | Date de mise en service originale. |
| `hardware` | `JSONB` | `DEFAULT '{}'::jsonb` | Détails techniques CPE : modèle d'antenne, adresse IP, adresse MAC, identifiant/mot de passe PPPoE, SSID/clé Wi-Fi, niveau de signal (dBm), relais/tour de rattachement. |
| `notes` | `TEXT` | Optionnel | Remarques particulières sur l'installation. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Date d'enregistrement dans le système. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Horodatage de dernière modification. |

#### B. Table `payment_logs` & Vue Miroir `payments`
Enregistre chaque transaction d'encaissement avec ventilation des montants et archivage des dates de cycle.

| Champ | Type SQL | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Identifiant unique de paiement (ex: `pay-17482390123`). |
| `receipt_number` | `TEXT` | `UNIQUE NOT NULL` | Numéro officiel séquentiel (format `REC-YYYYMMDD-XXXX`). |
| `client_id` | `TEXT` | `REFERENCES clients(id) ON DELETE CASCADE` | Lien étranger avec suppression automatique en cascade. |
| `client_name` | `TEXT` | `NOT NULL` | Nom de l'abonné au moment de l'encaissement. |
| `amount` | `NUMERIC` | `NOT NULL` | Montant total perçu (`amount = base_fee + extra_amount`). |
| `base_fee` | `NUMERIC` | `DEFAULT 50` | Part correspondant au forfait mensuel normal. |
| `extra_amount` | `NUMERIC` | `DEFAULT 0` | Frais complémentaires (pénalité de retard, câble, prorata). |
| `extra_reason` | `TEXT` | Optionnel | Motif explicatif des frais supplémentaires. |
| `method` | `TEXT` | `CHECK (method IN ('cash', 'bank_transfer', 'cih_bank', 'wafacash'))` | Canal de règlement. |
| `payment_date` | `DATE` | `NOT NULL` | Date calendaire du paiement (`YYYY-MM-DD`). |
| `billing_month` | `TEXT` | Optionnel | Mois comptable imputé au format `YYYY-MM` (ex: `2026-05`). |
| `previous_due_date`| `DATE` | `NOT NULL` | Échéance avant enregistrement de ce paiement. |
| `new_due_date` | `DATE` | `NOT NULL` | Nouvelle échéance calculée après application du cycle. |
| `recorded_by` | `TEXT` | `NOT NULL` | Nom ou identifiant de l'opérateur ayant saisi le paiement. |
| `notes` | `TEXT` | Optionnel | Remarques de caisse. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Horodatage d'insertion. |

> **Note de compatibilité :** La vue `public.payments` est définie via :
> ```sql
> CREATE OR REPLACE VIEW public.payments AS SELECT * FROM public.payment_logs;
> ```
> Elle permet la compatibilité totale avec les requêtes interrogeant alternativement `payments` ou `payment_logs`.

#### C. Table `tickets`
Gestion des pannes, réclamations et travaux de maintenance sur site.

| Champ | Type SQL | Contraintes | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Identifiant du ticket (ex: `tkt-101`). |
| `ticket_number` | `TEXT` | `UNIQUE NOT NULL` | Numéro d'intervention (ex: `TKT-2026-001`). |
| `client_id` | `TEXT` | `REFERENCES clients(id) ON DELETE CASCADE` | Lien étranger avec suppression automatique si l'abonné est supprimé. |
| `client_name` | `TEXT` | `NOT NULL` | Nom de l'abonné pour consultation rapide hors jointure. |
| `client_phone` | `TEXT` | `NOT NULL` | Coordonnées de contact direct pour le technicien. |
| `client_neighborhood`| `TEXT` | Optionnel | Quartier d'intervention à Tétouan. |
| `client_address` | `TEXT` | Optionnel | Précision d'accès sur le terrain. |
| `google_maps_url` | `TEXT` | Optionnel | Coordonnées GPS pour guidage direct. |
| `category` | `TEXT` | `NOT NULL` | Type d'incident (`no_internet`, `weak_signal`, `power_adapter`, `new_installation`, `router_config`). |
| `priority` | `TEXT` | `CHECK (priority IN ('urgent', 'high', 'normal'))` | Niveau d'urgence opérationnelle. |
| `status` | `TEXT` | `CHECK (status IN ('open', 'in_progress', 'resolved'))` | État d'avancement du ticket. |
| `assigned_to_technician_id` | `TEXT` | Optionnel | Identifiant du technicien en charge (ex: `tech-1`, `tech-2`). |
| `assigned_technician_name` | `TEXT` | Optionnel | Nom du technicien pour affichage direct. |
| `description` | `TEXT` | `NOT NULL` | Description détaillée du problème signalé. |
| `resolution_note` | `TEXT` | Optionnel | Rapport d'intervention saisi obligatoirement par le technicien. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Date d'ouverture. |
| `updated_at` | `TIMESTAMPTZ` | Optionnel | Date de prise en charge (`in_progress`). |
| `resolved_at` | `TIMESTAMPTZ` | Optionnel | Date et heure de clôture effective. |

---

### 2.3 Intégrité Référentielle & Cascades (`ON DELETE CASCADE`)
Le modèle de données garantit qu'aucune donnée orpheline ne subsiste dans le système :
1. Lorsqu'un abonné est supprimé dans `clients`, la contrainte `ON DELETE CASCADE` configurée sur `tickets.client_id` et `payment_logs.client_id` supprime automatiquement tous les tickets d'assistance et tout l'historique de paiements liés à cet abonné au niveau de PostgreSQL.
2. Côté client React, la fonction `deleteClient` dans `src/lib/store.tsx` applique instantanément le même filtrage sur les tableaux d'état local (`setClients`, `setTickets`, `setPayments`), garantissant une cohérence immédiate de l'interface sans nécessiter de rechargement de page.

---

### 2.4 Sécurité Row-Level Security (RLS)

Toutes les tables ont RLS activé (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Le schéma supporte deux modes :

1. **Mode Opérationnel WISP (Actif) :** Permet une réactivité maximale sur le terrain pour les opérations de caisse et de synchronisation des techniciens via les clés publiques de l'application :
   ```sql
   CREATE POLICY "Allow full access to clients" ON public.clients
     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
   CREATE POLICY "Allow full access to tickets" ON public.tickets
     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
   CREATE POLICY "Allow full access to payment logs" ON public.payment_logs
     FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
   ```

2. **Mode Durci Production JWT (Documenté dans `supabase/schema.sql`) :** Conçu pour le verrouillage strict lorsque l'authentification native Supabase Auth est activée sur tous les appareils :
   - Fonction `is_admin()` vérifiant l'appartenance au rôle `'admin'` dans `user_profiles`.
   - Seuls les administrateurs peuvent ajouter, modifier ou supprimer des abonnés et des paiements.
   - Les techniciens ont accès en lecture seule aux abonnés et peuvent uniquement modifier l'état et la note de résolution des tickets qui leur sont explicitement assignés (`assigned_to_technician_id = current_tech_id`).

---

### 2.5 Synchronisation en Direct (Supabase Realtime)

L'application écoute les modifications de la base de données via un canal WebSocket unifié dans `src/lib/store.tsx` :

```typescript
const channel = supabase
  .channel('public:all')
  .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
    const { eventType, new: newRow, old: oldRow, table } = payload;
    // Traitement sélectif pour 'clients', 'tickets' et 'payment_logs'
    // Réaction instantanée sur INSERT, UPDATE et DELETE
  })
  .subscribe();
```

- **Sur `INSERT` :** L'objet reçu est converti par les mappers bidirectionnels (`mapRowToClient`, `mapRowToPayment`, `mapRowToTicket`) et injecté en tête de tableau dans l'état React et mis en cache dans `localStorage`.
- **Sur `UPDATE` :** L'enregistrement correspondant est mis à jour in situ sans perturber le reste de la liste.
- **Sur `DELETE` :** L'identifiant supprimé est retiré de tous les tableaux locaux dépendants (`clients`, `tickets`, `payments`).
- **Synchronisation au focus :** Des écouteurs sur `window.addEventListener('focus')` et `document.addEventListener('visibilitychange')` déclenchent automatiquement `refreshFromSupabase()` dès que l'administrateur ou le technicien revient sur l'application.

---

## 3. Gestion de l'État Global & Synchronisation (`src/lib/store.tsx`)

Le fichier `src/lib/store.tsx` constitue le cœur logique de l'application. Il encapsule l'ensemble des règles métier, l'état global et la persistance.

### 3.1 Architecture du Store Context
Le store expose l'interface `StoreContextType` via le hook `useStore()`. Il stocke en mémoire vive :
- `currentUser` : Profil de l'utilisateur connecté (`admin`, `technician` ou `field_lead`).
- `clients` : Liste de tous les abonnés.
- `payments` : Historique complet des transactions d'encaissement.
- `tickets` : Liste des tickets de support technique.
- `technicians` : Annuaire des techniciens de terrain.
- `isHydrated` : Indicateur confirmant que le chargement initial depuis le stockage local est achevé.
- `isSyncing` : Indicateur de synchronisation active avec le serveur Supabase.
- `isOnline` : État de connectivité réseau de l'appareil (`navigator.onLine`).
- `language` & `dir` : Langue active (`fr`, `ar`, `en`) et sens de lecture (`ltr` ou `rtl`).

---

### 3.2 Logique des Mutations Principales

#### 1. Onboarding d'un Abonné (`addClient`)
Lorsqu'un nouvel abonné est enregistré :
1. **Identifiants Automatiques :** À partir du nom de l'abonné, le système génère un identifiant PPPoE (`user_nom_client`) et un SSID Wi-Fi (`Nom_WiFi`). Si le nom est saisi en caractères arabes, une génération de repli propre (`client_XXX` / `WiFi_XXX`) garantit l'absence de caractères invalides dans les équipements réseau.
2. **Matériel par défaut sécurisé :** Modèle d'antenne Ubiquiti LiteBeam 5AC, IP `192.168.10.150`, mot de passe PPPoE `123456`, signal par défaut `-65 dBm`.
3. **Calcul de l'Échéance :** La première échéance est fixée à `installationDate + 1 mois` via `addMonthsToDateStr`.
4. **Premier Paiement Optionnel :** Si la case « Paiement initial » est cochée, le store génère automatiquement un premier enregistrement `PaymentLog` avec reçu `REC-YYYYMMDD-XXXX` et marque `lastPaymentDate = installationDate`. Si la case est décochée, `lastPaymentDate` reste `undefined`.

#### 2. Enregistrement d'un Paiement (`recordPayment`)
L'enregistrement d'un règlement suit un calcul arithmétique et calendaire rigoureux :

```
             ┌────────────────────────────────────────────────────────┐
             │                     recordPayment                      │
             └───────────────────────────┬────────────────────────────┘
                                         │
                 ┌───────────────────────┴────────────────────────┐
                 ▼                                                ▼
     Calcul Financier Sécurisé                        Calcul d'Échéance Calendaire
  baseFee = Math.max(0, rawBase)                 prevDueDate = client.nextDueDate
  extraAmount = Math.max(0, rawExtra)            monthsToAdd = Math.max(1, extendDays / 30)
  finalAmount = baseFee + extraAmount            newDueDate = addMonthsToDateStr(prev, months)
                 │                                                │
                 └───────────────────────┬────────────────────────┘
                                         ▼
                     ┌────────────────────────────────────────┐
                     │         Génération du Paiement         │
                     │  - Reçu REC-YYYYMMDD-XXXX              │
                     │  - Imputation billingMonth (YYYY-MM)   │
                     │  - Mise à jour client (lastPaymentDate,│
                     │    nextDueDate, statut recalculé)      │
                     └────────────────────────────────────────┘
```

- **Protection anti-`NaN` et montants négatifs :**
  ```typescript
  const rawBase = typeof baseFee === 'number' && !isNaN(baseFee) ? baseFee : (client.monthlyFee || 50);
  const effectiveBaseFee = Math.max(0, rawBase);
  const rawExtra = typeof extraAmount === 'number' && !isNaN(extraAmount) ? extraAmount : 0;
  const effectiveExtraAmount = Math.max(0, rawExtra);
  const finalAmount = typeof amount === 'number' && !isNaN(amount) && amount > 0
    ? Math.max(0, amount)
    : (effectiveBaseFee + effectiveExtraAmount);
  ```
- **Calcul calendaire exact (`addMonthsToDateStr`) :** L'échéance avance par rapport à la date d'échéance précédente (et non par rapport à la date du jour d'encaissement), empêchant le client de « gagner » des jours s'il paie en retard. La fonction prend en compte les fins de mois (ex: 31 janvier + 1 mois = 28 ou 29 février) sans débordement erroné sur mars.
- **Numérotation Séquentielle des Reçus (`generateReceiptNumber`) :**
  Format strict : `REC-YYYYMMDD-XXXX` où `XXXX` représente le numéro séquentiel incrémenté sur 4 chiffres.

#### 3. Suppression & Nettoyage d'État (`deleteClient`)
La fonction supprime simultanément l'abonné de `clients`, ses tickets dans `tickets`, et ses règlements dans `payments` :
```typescript
const deleteClient = (clientId: string) => {
  setClients((prev) => prev.filter((c) => c.id !== clientId));
  setTickets((prev) => prev.filter((t) => t.clientId !== clientId));
  setPayments((prev) => prev.filter((p) => p.clientId !== clientId));
  deleteClientFromSupabase(clientId).catch((err) => {
    console.warn('[Supabase] Failed to delete client:', err);
  });
};
```

---

### 3.3 Résilience Réseau & Mode Hors Ligne

1. **Détection Active :** Des écouteurs sur les événements de fenêtre `window.addEventListener('online')` et `window.addEventListener('offline')` mettent à jour la propriété `isOnline`.
2. **Indicateurs d'État :** En cas de perte de connectivité 4G ou Wi-Fi sur le terrain, une bannière animée `WifiOff` s'affiche dans la barre de navigation et en haut de l'espace technicien : « *Mode hors ligne (Réseau 4G indisponible) — Enregistré en local* ».
3. **Persistance Locale Robuste :** Toutes les opérations continuent d'écrire dans `localStorage`. Dès le retour du signal, `refreshFromSupabase()` réconcilie les données avec la base distante.

---

## 4. Modules Fonctionnels & Interfaces Utilisateur

### 4.1 Tableau de Bord NOC & Facturation (`AdminDashboard.tsx`)

Le tableau de bord constitue le centre d'exploitation pour Youness :

1. **Indicateurs Financiers & Opérationnels (KPIs) :**
   - **Abonnés Actifs :** Nombre de clients au statut `active` ou `due_soon` (excluant les archivés).
   - **Mda5il Lyoum (مداخيل اليوم) :** Somme exacte des règlements enregistrés avec la date calendaire du jour (`p.paymentDate === todayStr`).
   - **Revenus du Mois en Cours :** Somme stricte des encaissements du mois civil actuel (`p.paymentDate.startsWith('YYYY-MM')`). Se réinitialise naturellement à 0,00 MAD le 1er de chaque mois sans effacer l'historique financier.
   - **Montant des Retards & Impayés (المتأخرات) :** Calcul arithmétique cumulatif exact. Si un abonné a 60 jours de retard sur un forfait à 100 MAD, sa dette est comptabilisée comme $2 \times 100 = 200 \text{ MAD}$.
   - **Tickets Ouverts & Urgents :** Indicateur de pannes réseau en direct.

2. **Grand Livre d'Audit Mensuel & Historique de Recouvrement :**
   - **Sélecteur Dynamique de Mois :** Permet d'auditer n'importe quel mois passé (jusqu'à 18 mois d'historique) ou de visualiser les projections futures (jusqu'à 12 mois à l'avance).
   - **Séparation Nette Abonnés Payés / Impayés :**
     - *Abonnés Payés (Vert) :* Affiche le reçu associé, le mode de paiement et identifie les paiements effectués d'avance (`isAdvance`).
     - *Abonnés Non-Payés (Rouge) :* Propose deux boutons d'action rapide : « Enregistrer le paiement » (pré-remplit automatiquement le mois sélectionné dans la modale) et « Rappel WhatsApp » (génère un message personnalisé avec le montant exact de la dette et le nom du mois impayé).
   - **Taux de Recouvrement en Temps Réel :** Affiche le pourcentage perçu par rapport au chiffre d'affaires prévisionnel du mois audité.

3. **Centre d'Actions Urgentes :**
   - Liste ordonnée des abonnés arrivant à échéance sous 3 jours ou déjà en retard, classés du plus critique au moins critique, avec bouton d'appel direct et bouton WhatsApp.

---

### 4.2 Répertoire des Abonnés & Matériel CPE (`ClientDirectory.tsx`)

1. **Performance & Recherche Évolutive (500+ Abonnés) :**
   - **Debouncing de 200 ms :** La saisie dans le champ de recherche ne recalcule pas le filtre à chaque frappe, évitant les blocages du navigateur sur les gros volumes de données.
   - **Mémorisation `useMemo` :** Le filtrage combine le terme recherché, le quartier de Tétouan et l'onglet de statut (`Actif`, `Échéance proche`, `En retard`, `Suspendu`, `Archivé`).
   - **Champs indexés dans la recherche :** Nom du client, numéro de téléphone, adresse MAC de l'antenne, et compte utilisateur PPPoE.

2. **Fiche Abonné Détaillée (`ClientDetailModal.tsx`) :**
   - **Télémétrie RF :** Jauge dynamique du niveau de signal en dBm (vert $\ge -60$, bleu $\ge -70$, jaune $\ge -78$, rouge $<-78$).
   - **Sécurité & Identifiants :** Visualisation et copie en un clic du mot de passe Wi-Fi et des identifiants PPPoE avec masquage/démasquage sécurisé.
   - **Historique Trié des Règlements :** Affichage chronologique strictement décroissant des encaissements avec accès direct à l'impression du reçu.
   - **Ajustement Rapide du Forfait :** Boutons de raccourci tarifaire immédiat `[50]`, `[100]`, `[120]`, `[150]`, `[200]` MAD.

---

### 4.3 Espace Technicien Terrain (`TechnicianView.tsx`)

Conçu spécifiquement pour une utilisation sur smartphone par les techniciens en hauteur sur les toits ou en intervention dans les ruelles :
1. **Isolation RBAC par Technicien :** Lorsqu'un technicien se connecte, l'affichage se verrouille strictement sur son identifiant (`effectiveTechId`). Il ne peut pas consulter les revenus financiers ni les interventions des autres techniciens.
2. **Navigation & Contact Direct :** Bouton `Call` (lance l'application téléphone native avec le numéro du client) et bouton `Directions` (ouvre Google Maps avec guidage direct vers le toit de l'abonné).
3. **Clôture Obligatoire avec Note d'Intervention :** Le passage d'un ticket à l'état `resolved` impose la saisie d'un compte-rendu technique (ex: « Remplacement connecteur RJ45 oxydé + réalignement antenne »).
4. **Fiche Technique Intégrée :** Rappel immédiat du SSID, du mot de passe Wi-Fi, de l'IP de l'antenne et de la tour de transmission associée pour faciliter les tests de débit sur place.

---

### 4.4 Système de Reçus & Impression (`InvoiceReceiptModal.tsx`)

Le composant génère un reçu compact et officiel :
1. **Présentation Professionnelle :** En-tête officiel Youness WiFi, date et heure, numéro de reçu séquentiel, nom de l'abonné, quartier, période couverte, ventilation tarifaire (forfait + éventuels extras), mode de paiement, et bloc de signature/cachet.
2. **Isolation CSS d'Impression `@media print` sur 1 Page :**
   ```css
   @media print {
     @page {
       size: portrait;
       margin: 8mm;
     }
     body {
       visibility: hidden !important;
       background: white !important;
     }
     #receipt-print-section,
     #receipt-print-section * {
       visibility: visible !important;
     }
     #receipt-print-section {
       position: fixed !important;
       left: 0 !important;
       top: 0 !important;
       width: 100% !important;
       max-width: 100% !important;
       margin: 0 !important;
       padding: 0 !important;
       background: white !important;
       color: #0f172a !important;
       page-break-after: avoid !important;
       page-break-inside: avoid !important;
       break-inside: avoid !important;
     }
   }
   ```
   Cette règle masque l'intégralité du DOM de l'application lors de l'impression et positionne exclusivement le reçu sur une seule feuille A4 ou format ticket, éliminant totalement les pages blanches résiduelles.
3. **Partage WhatsApp Instantané :** Un bouton dédié permet d'envoyer directement à l'abonné un message contenant le récapitulatif complet de son reçu avec son nom, le montant réglé, et la nouvelle date d'échéance.

---

## 5. Internationalisation, Thème & Déploiement

### 5.1 Moteur Multilingue (`src/lib/i18n.ts`)
L'application propose trois langues :
- **Français (`fr`) :** Langue par défaut des opérations techniques.
- **Arabe (`ar`) :** Traduction complète de l'interface avec inversion automatique de la direction du document (`document.documentElement.dir = 'rtl'`), adaptée au contexte marocain.
- **Anglais (`en`) :** Disponible pour la terminologie réseau standard (NOC, CPE, PPPoE).

La préférence linguistique est persistée dans `localStorage` sous la clé `atlasnet_language` et appliquée dynamiquement au montage sans rechargement de page.

---

### 5.2 Système de Thème Clair / Sombre (`globals.css`)
Le design repose sur une palette sombre haut de gamme adaptée au travail de nuit au NOC, complétée par un mode clair lumineux pour une utilisation en plein soleil sur le terrain :
- **Thème Sombre (NOC) :** Fond `#0F0C14`, cartes `#191522`, bordures `#2D253B`, texte `#F4F0F8`, halo d'ambiance violet discret.
- **Thème Clair (Terrain) :** Fond `#F8F7FB`, surfaces blanches `#FFFFFF`, bordures ardoise douces `#E5DEEE`, texte à fort contraste `#181124`.
- **Zéro Flash SSR :** Géré par `ThemeProvider` (`next-themes`) configuré avec `attribute="class"` et `defaultTheme="dark"`.

---

### 5.3 Variables d'Environnement & Déploiement Vercel

#### Fichier `.env.local` requis :
```env
# URL de l'instance Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co

# Clé publique anonyme Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Pipeline de Build & Déploiement :
1. **Compilation locale ou CI :** `npm run build` exécute la compilation Next.js Turbopack et la vérification TypeScript stricte.
2. **Déploiement Vercel :**
   - Connecter le dépôt GitHub à Vercel.
   - Configurer les deux variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans le tableau de bord Vercel (Project Settings > Environment Variables).
   - Les routes dynamiques (`/api/auth/*`) sont automatiquement déployées en fonctions serverless hautement disponibles.
   - Les pages statiques et les composants clients bénéficient de la mise en cache mondiale sur le CDN Vercel Edge Network.
