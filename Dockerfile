# Estágio 1: Build dos arquivos estáticos com Node.js
FROM node:20-alpine AS build
WORKDIR /app

# Instala as dependências do projeto
COPY package*.json ./
RUN npm install

# Copia o código-fonte e gera o pacote de produção (Vite)
COPY . .
RUN npm run build

# Estágio 2: Imagem final com Nginx para servir o front-end
FROM nginx:alpine

# Copia os arquivos compilados e a configuração customizada do Nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta HTTP padrão
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]