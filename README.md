<p align="center">
  <a href="https://chatgpt.com" target="_blank">
    <img src="./assets/logo.png" width="120" alt="PacoCoder Logo" />
  </a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Creacion  <a href="http://nodejs.org" target="_blank">Microservicio </a> Con el frameword Nestjs utilizado microservicios.</p>
    <p align="center">
<a href="https://nodejs.org" target="_blank">
  <img src="https://img.shields.io/badge/node-v22.11.1-blue?logo=node.js" alt="Node Version" />
</a>
<a href="https://www.npmjs.com" target="_blank">
  <img src="https://img.shields.io/badge/npm-v11.6.2-red?logo=npm" alt="NPM Version" />
</a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.prisma.io" target="_blank">
  <img src="https://img.shields.io/badge/prisma-v6.19.0-2D3748?logo=prisma" alt="Prisma Version" />
</a>
<a href="https://www.sqlite.org" target="_blank">
  <img src="https://img.shields.io/badge/sqlite-3-blue?logo=sqlite" alt="SQLite" />
</a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Products Microservice

## Dev

1. Clonar el repositorio.

2. Instalar dependencias 

```bash
npm install
```

3. Crear un archivo ```.env``` con las variables de entorno, con las siguiente variable son obligatorias:
  - PORT
  - DATABASE_URL

4. Ejecutar migración de prisma:

```bash
npx prisma migrate dev
```

5. Ejecutar:

```bash
npm run dev
```

