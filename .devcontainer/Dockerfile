FROM node:24.0.0

WORKDIR /workspace

# Cài sẵn Vue CLI và gh-pages để deploy
RUN npm install -g @vue/cli gh-pages pnpm

# Optional: cài git nếu cần deploy
RUN apt-get update && apt-get install -y git
