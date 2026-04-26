# Sistema de Gerenciamento de Restaurante

Este é um sistema completo de gerenciamento de restaurante com frontend em React + TypeScript + Vite e backend em Node.js + Express + TypeScript + Prisma + PostgreSQL.

## Funcionalidades

- Dashboard com métricas
- Controle de mesas
- Gerenciamento de pedidos
- Controle de estoque
- Relatórios financeiros
- Cardápio digital com QR Code
- Autenticação JWT
- API documentada com Swagger

## Pré-requisitos

- Node.js 18+
- PostgreSQL
- Docker (opcional)

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm run install:all
   ```

3. Configure o banco de dados:
   - Copie `.env.example` para `.env` no backend
   - Configure a DATABASE_URL
   - Execute as migrações:
     ```bash
     cd backend
     npm run db:migrate
     npm run db:seed
     ```

4. Inicie o banco (se usar Docker):
   ```bash
   docker-compose up -d
   ```

5. Inicie o sistema:
   ```bash
   npm run dev
   ```

## Acesso

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Login Inicial

- Email: admin@restaurante.com
- Senha: admin123

## Estrutura do Projeto

```
/
├── frontend/          # React + Vite
├── backend/           # Node.js + Express
├── docker-compose.yml # Configuração Docker
└── README.md
```

## Desenvolvimento

- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`

## Produção

- Build: `npm run build`
- Start: `npm run start`