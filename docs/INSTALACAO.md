# Manual de Instalação - Plataforma de Voluntariado Local

## 1. Requisitos Prévios

### Software Necessário
- **Node.js** versão 18.0.0 ou superior
- **npm** versão 9.0.0 ou superior
- **PostgreSQL** versão 14.0 ou superior
- **Git** (opcional, para controlo de versões)

### Hardware Mínimo
- 4 GB de RAM
- 10 GB de espaço em disco
- Conexão à internet

## 2. Instalação

### 2.1. Clonar ou copiar o projeto

```bash
# Se usar Git
git clone [URL_DO_REPOSITORIO]

# Ou copiar a pasta do projeto para o seu computador
```

### 2.2. Instalar dependências

```bash
cd "Plataforma de Voluntariado Local"
npm install
```

### 2.3. Configurar base de dados

1. Criar uma base de dados PostgreSQL:
```sql
CREATE DATABASE voluntariado_local;
```

2. Configurar o ficheiro `.env` com os dados de ligação:
```
DATABASE_URL="postgresql://utilizador:password@localhost:5432/voluntariado_local?schema=public"
JWT_SECRET="chave-secreta-mude-isto-em-producao"
```

### 2.4. Criar tabelas e dados iniciais

```bash
# Criar tabelas
npx prisma db push

# Popular com dados de exemplo
npx prisma db seed
```

### 2.5. Iniciar o servidor

```bash
# Modo de desenvolvimento
npm run dev

# Modo de produção
npm run build
npm start
```

### 2.6. Aceder à aplicação

Abrir o navegador e aceder a:
- **Desenvolvimento:** http://localhost:3000
- **Produção:** http://localhost:3000 (ou URL do servidor)

## 3. Contas de Demonstração

### Administrador
- Email: admin@voluntariado.pt
- Password: admin123

### Instituição
- Email: instituicao@exemplo.pt
- Password: instituicao123

### Voluntário
- Email: voluntario@exemplo.pt
- Password: voluntario123

## 4. Configuração Avançada

### 4.1. Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| DATABASE_URL | URL de ligação à BD | - |
| JWT_SECRET | Chave secreta para tokens JWT | fallback-secret-key |
| NEXTAUTH_URL | URL da aplicação | http://localhost:3000 |
| NEXTAUTH_SECRET | Chave secreta NextAuth | - |

### 4.2. Configuração de Email (Opcional)

Para funcionalidades de notificação por email, configurar:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=seu-email@example.com
SMTP_PASS=sua-password
```

## 5. Solução de Problemas

### Erro: "Cannot connect to database"
- Verificar se o PostgreSQL está a correr
- Verificar se os dados de ligação no `.env` estão corretos
- Verificar se a base de dados foi criada

### Erro: "Module not found"
- Executar `npm install` novamente
- Verificar se está na pasta correta do projeto

### Erro: "Prisma schema not found"
- Executar `npx prisma generate`

## 6. Comandos Úteis

```bash
# Gerar cliente Prisma
npx prisma generate

# Abrir Prisma Studio (GUI para BD)
npx prisma studio

# Limpar e recomeçar BD
npx prisma migrate reset

# Verificar erros TypeScript
npm run typecheck

# Linting
npm run lint
```
