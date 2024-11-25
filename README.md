# Hades

Une application moderne de streaming de films et séries TV construite avec Next.js 14, TypeScript et Tailwind CSS. Inspirée par le design élégant d'Apple TV+ et d'autres services de streaming premium.

## Fonctionnalités

- Design moderne et minimaliste inspiré d'Apple TV+
- Performance optimisée avec Next.js 14 et App Router
- Intégration complète avec l'API TMDB
- Recherche avancée avec raccourcis clavier (⌘K)
- Interface responsive et adaptative
- Animations et transitions fluides
- Filtrage par providers (Netflix, Apple TV+, Disney+, etc.)
- Mise à jour en temps réel des contenus tendance

## Stack Technique

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **API**: TMDB API
- **Animations**: Tailwind & CSS
- **Déploiement**: Vercel

## Configuration requise

- Node.js 18.17 ou supérieur
- npm ou yarn

## Installation

1. Clonez le dépôt :
\`\`\`bash
git clone https://github.com/votre-username/Hades.git
cd Hades
\`\`\`

2. Installez les dépendances :
\`\`\`bash
npm install
# ou
yarn install
\`\`\`

3. Créez un fichier .env.local à la racine du projet et ajoutez votre clé API TMDB :
\`\`\`
NEXT_PUBLIC_TMDB_API_KEY=votre_clé_api
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
\`\`\`

4. Démarrez le serveur de développement :
\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

5. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure du projet

Hades/
├── app/                   # App Router de Next.js
│   ├── components/       # Composants réutilisables
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilitaires et configurations
│   └── ...             # Pages et layouts
├── public/              # Assets statiques
├── styles/             # Styles globaux
└── ...

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou un pull request.

## Licence

MIT
