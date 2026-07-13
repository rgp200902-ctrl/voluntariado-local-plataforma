# Documentação Técnica - Plataforma de Voluntariado Local

## 1. Arquitetura do Sistema

### 1.1. Stack Tecnológica
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de Dados:** PostgreSQL com Prisma ORM
- **Autenticação:** JWT (JSON Web Tokens) com bcryptjs

### 1.2. Estrutura de Pastas

```
src/
├── app/                    # Páginas e rotas
│   ├── api/               # API Routes
│   │   ├── admin/         # Rotas administrativas
│   │   ├── auth/          # Autenticação
│   │   ├── institution/   # Rotas da instituição
│   │   ├── opportunities/ # Rotas públicas de oportunidades
│   │   └── volunteer/     # Rotas do voluntário
│   ├── dashboard/         # Páginas de painel
│   │   ├── admin/
│   │   ├── institution/
│   │   └── volunteer/
│   ├── login/
│   ├── registro/
│   └── oportunidades/
├── components/            # Componentes React
├── lib/                   # Utilitários e configurações
│   ├── api.ts            # Helpers de API
│   ├── auth.ts           # Autenticação
│   ├── audit.ts          # Registo de atividade
│   └── prisma.ts         # Cliente Prisma
└── prisma/
    ├── schema.prisma     # Modelo de dados
    └── seed.ts           # Dados iniciais
```

## 2. Modelo de Dados

### 2.1. Entidades Principais

#### User (Utilizador)
```prisma
model User {
  id            String    @id
  nome          String
  email         String    @unique
  password_hash String
  perfil        String    // administrador, instituicao, voluntario
  ativo         Boolean
  data_criacao  DateTime
  ultimo_acesso DateTime?
}
```

#### Volunteer (Voluntário)
```prisma
model Volunteer {
  id                 String   @id
  user_id            String   @unique
  telefone           String?
  localidade         String?
  data_nascimento    DateTime?
  faixa_etaria       String?
  disponibilidade    String?
  interesses         String?
  competencias       String?
  consentimento_rgpd Boolean
  data_consentimento DateTime?
}
```

#### Institution (Instituição)
```prisma
model Institution {
  id               String  @id
  user_id          String  @unique
  nome             String
  nif              String?
  tipo             String?
  morada           String?
  email            String?
  telefone         String?
  pessoa_contacto  String?
  descricao        String?
  estado_validacao String  // pendente, aprovada, recusada, suspensa
}
```

#### Categoria
```prisma
model Categoria {
  id        String  @id
  nome      String  @unique
  descricao String?
  ativa     Boolean
}
```

#### Oportunidade
```prisma
model Oportunidade {
  id             String  @id
  instituicao_id String
  categoria_id   String?
  titulo         String
  descricao      String
  local          String?
  freguesia      String?
  data_inicio    DateTime?
  data_fim       DateTime?
  horario        String?
  vagas          Int
  requisitos     String?
  idade_minima   Int?
  estado         String  // rascunho, aberta, publicada, inscricoes_encerradas, concluida, cancelada
}
```

#### Inscricao
```prisma
model Inscricao {
  id                      String  @id
  oportunidade_id         String
  voluntario_id           String
  mensagem                String?
  estado                  String  // submetida, aceite, recusada, cancelada, concluida
  data_inscricao          DateTime
  data_decisao            DateTime?
  observacoes_instituicao String?
}
```

#### RegistoAtividade
```prisma
model RegistoAtividade {
  id            String   @id
  utilizador_id String?
  acao          String
  entidade      String
  entidade_id   String?
  data_hora     DateTime
  detalhe       String?
}
```

## 3. Autenticação e Segurança

### 3.1. Fluxo de Autenticação
1. Utilizador submete email/password
2. Password é verificada com bcrypt
3. Token JWT é gerado com payload (userId, email, role, name)
4. Token é guardado no localStorage do cliente
5. Token é enviado no header Authorization em cada pedido

### 3.2. controlo de Acesso
- **Administrador:** Acesso total
- **Instituição:** Gestão de suas oportunidades e inscrições
- **Voluntário:** Inscrição em oportunidades e gestão do perfil

### 3.3. Proteção de Dados (RGPD)
- Consentimento explícito no registo
- Dados de contacto só visíveis após aceitação
- Possibilidade de eliminação de conta
- Registo de todas as ações importantes

## 4. Regras de Negócio

1. Apenas instituições aprovadas podem publicar oportunidades
2. Oportunidades canceladas não aceitam novas inscrições
3. Voluntário não pode inscrever-se duas vezes na mesma oportunidade
4. Instituição só vê inscrições das suas oportunidades
5. Dados de contacto visíveis apenas após aceitação
6. Oportunidade encerra quando atinge máximo de vagas
7. Voluntário pode cancelar inscrição enquanto oportunidade não estiver concluída
8. Todas as ações administrativas são registadas

## 5. Endpoints da API

### 5.1. Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register/volunteer` - Registar voluntário
- `POST /api/auth/register/institution` - Registar instituição
- `POST /api/auth/forgot-password` - Recuperar password

### 5.2. Oportunidades (Público)
- `GET /api/opportunities` - Listar oportunidades
- `GET /api/opportunities/[id]` - Detalhe da oportunidade

### 5.3. Voluntário
- `GET /api/volunteer/dashboard` - Painel
- `GET /api/volunteer/profile` - Perfil
- `PUT /api/volunteer/profile` - Atualizar perfil
- `POST /api/volunteer/registrations` - Criar inscrição
- `POST /api/volunteer/registrations/[id]/cancel` - Cancelar inscrição
- `GET /api/volunteer/history` - Histórico

### 5.4. Instituição
- `GET /api/institution/dashboard` - Painel
- `GET /api/institution/profile` - Perfil
- `PUT /api/institution/profile` - Atualizar perfil
- `POST /api/institution/opportunities` - Criar oportunidade
- `GET /api/institution/opportunities/[id]/registrations` - Ver inscrições
- `PUT /api/institution/registrations/[id]` - Atualizar inscrição
- `GET /api/institution/opportunities/[id]/export` - Exportar CSV

### 5.5. Administração
- `GET /api/admin/stats` - Estatísticas
- `GET /api/admin/institutions` - Listar instituições
- `POST /api/admin/institutions/[id]/approve` - Aprovar
- `POST /api/admin/institutions/[id]/block` - Bloquear
- `GET /api/admin/categories` - Categorias
- `POST /api/admin/categories` - Criar categoria
- `GET /api/admin/users` - Utilizadores
- `GET /api/admin/reports` - Relatórios

## 6. Enums e Estados

### Estado da Instituição
- `pendente` - Aguarda aprovação
- `aprovada` - Aprovada pelo admin
- `recusada` - Recusada pelo admin
- `suspensa` - Suspensa temporariamente

### Estado da Oportunidade
- `rascunho` - Não publicada
- `aberta` - Aceita inscrições
- `publicada` - Visível publicamente
- `inscricoes_encerradas` - Cheia
- `concluida` - Terminada
- `cancelada` - Cancelada

### Estado da Inscrição
- `submetida` - Aguarda decisão
- `aceite` - Aceite pela instituição
- `recusada` - Recusada pela instituição
- `cancelada` - Cancelada pelo voluntário
- `concluida` - Participação concluída
