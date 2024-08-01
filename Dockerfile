# Étape 1: Définir l'image de base
FROM node:20 as builder

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN yarn 

# Copier le reste des fichiers sources
COPY . .

# Compiler l'application TypeScript en JavaScript
RUN yarn build

# Étape 2: Préparer l'image de runtime
FROM node:20

WORKDIR /app

# Copier les fichiers nécessaires depuis l'étape de construction
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Exposer le port sur lequel votre app sera accessible dans le conteneur
EXPOSE 3000

# Commande pour exécuter l'application
CMD ["node", "dist/index.js"]