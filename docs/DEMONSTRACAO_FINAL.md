# 🎬 Guia de Demonstração Final - Apresentação do Projeto

Este guia detalha como demonstrar todos os 8 requisitos de demonstração final conforme especificado no documento do projeto.

---

## ⏱️ Tempo Total: ~15-20 minutos

---

## 📋 Checklist Pré-Demonstração

Antes de começar:

- [ ] Servidor está a correr (`npm run dev`)
- [ ] Browser aberto em `http://localhost:3000`
- [ ] Estou com 3 abas abertas (ou preparadas) para cada role
- [ ] Conexão de internet estável
- [ ] Base de dados com dados de seed carregados

### Iniciar Servidor

```bash
cd "c:\Plataforma de Voluntariado Local"
npm run dev
```

Abrir browser: http://localhost:3000

---

## 🎯 Os 8 Passos de Demonstração

### ✅ **Passo 1: Registo de um Voluntário** (2 min)

**Objetivo**: Mostrar que novo voluntário consegue registar-se na plataforma.

**Ações**:

1. Na homepage, clique em **"Registar"** (topo direito)
2. Selecione **"Voluntário"**
3. Preencha o formulário:
   - Nome: `Novo Voluntário Demo`
   - Email: `novo.voluntario.demo@email.com`
   - Palavra-passe: `demo123456` (mínimo 8 caracteres)
   - Concordo com termos (checkbox)

4. Clique **"Registar"**

**Resultado Esperado**:
- ✅ Mensagem de sucesso
- ✅ Redireciona para página de login
- ✅ Novo utilizador criado na base de dados

**Nota**: Pode usar este novo utilizador para inscrições posteriores.

---

### ✅ **Passo 2: Registo ou Aprovação de uma Instituição** (3 min)

**Objetivo**: Demonstrar que instituição consegue registar-se e depois é aprovada por admin.

**2a) Registo de Instituição**:

1. Na homepage, clique em **"Registar"**
2. Selecione **"Instituição"**
3. Preencha:
   - Nome responsável: `Demo Responsável`
   - Email: `nova.instituicao.demo@email.com`
   - Palavra-passe: `demo123456`
   - Nome da instituição: `Instituição Demo`
   - Tipo: `Associação`
   - Descrição: `Instituição demonstrativa para apresentação`
   - Telefone: `912345678`

4. Clique **"Registar"**

**Resultado**: Instituição fica em estado **"Pendente"**

**2b) Aprovação como Admin**:

1. Fazer logout (se estava como voluntário)
2. Fazer login como admin:
   - Email: `admin@voluntariado.pt`
   - Password: `admin123`

3. Clique em **"Painel"** → **"Admin"**
4. No menu esquerdo, clique **"Instituições"**
5. Vê a nova instituição em estado "Pendente"
6. Clique no botão **"Aprovar"** (ícone de visto verde)

**Resultado Esperado**:
- ✅ Instituição muda para estado "Aprovada"
- ✅ Agora pode criar oportunidades
- ✅ Estado visual muda na tabela

---

### ✅ **Passo 3: Criação de uma Oportunidade** (3 min)

**Objetivo**: Mostrar que instituição aprovada consegue criar oportunidade.

**Ações**:

1. Fazer logout (clique em "Sair")
2. Fazer login como instituição:
   - Email: `nova.instituicao.demo@email.com`
   - Password: `demo123456`

3. Clique em **"Painel"** → **"Instituição"**
4. Clique em **"Criar Oportunidade"**
5. Preencha o formulário:
   - Título: `Ajuda em Ação Comunitária Demo`
   - Descrição: `Procuramos voluntários para ajudar em ação de limpeza comunitária`
   - Categoria: `Ambiente`
   - Localização: `Lisboa`
   - Data de Início: `15/07/2026`
   - Data de Fim: `16/07/2026`
   - Vagas: `5`
   - Requisitos (opcional): `Disponibilidade de 4 horas`

6. Clique **"Publicar"**

**Resultado Esperado**:
- ✅ Mensagem de sucesso "Oportunidade criada"
- ✅ Redireciona para dashboard da instituição
- ✅ Oportunidade aparece na lista

---

### ✅ **Passo 4: Pesquisa de Oportunidades** (2 min)

**Objetivo**: Mostrar que utilizador consegue pesquisar e filtrar oportunidades.

**Ações**:

1. Faça logout
2. Vá para homepage (clique em logo "Voluntariado Local")
3. Clique em **"Oportunidades"** (menu topo)
4. Demonstre os filtros:

   **4a) Filtro por Categoria**:
   - Dropdown "Categoria"
   - Selecione `Ambiente`
   - Lista filtra automaticamente
   - Mostra apenas oportunidades de Ambiente

   **4b) Filtro por Localização**:
   - Limpe filtro de categoria primeiro
   - Digite na caixa de localização: `Lisboa`
   - Lista filtra para oportunidades em Lisboa

   **4c) Pesquisa por Palavra-chave**:
   - Limpe filtro anterior
   - Digite na pesquisa: `Comunitária`
   - Lista mostra apenas oportunidades com essa palavra

   **4d) Limpar Filtros**:
   - Clique em **"Limpar Filtros"**
   - Volta a mostrar todas as oportunidades

**Resultado Esperado**:
- ✅ Filtros funcionam em tempo real
- ✅ Lista atualiza automaticamente
- ✅ Pesquisa é intuitiva

---

### ✅ **Passo 5: Inscrição do Voluntário** (2 min)

**Objetivo**: Mostrar que voluntário consegue se inscrever numa oportunidade.

**Ações**:

1. Na página de oportunidades, clique em uma oportunidade disponível
   - Pode clicar na que criou no Passo 3
   - Ou em qualquer outra da lista

2. Na página de detalhe, clique em **"Inscrever-se"** (botão principal)
3. Você pode:
   - Fazer login (se não está) com credenciais de voluntário
   - Ou usar o novo voluntário criado no Passo 1

4. Preencha (se houver) uma mensagem opcional
5. Clique **"Confirmar Inscrição"**

**Resultado Esperado**:
- ✅ Mensagem de sucesso "Inscrito com sucesso"
- ✅ Botão muda para "Já inscrito"
- ✅ Inscrição fica em estado "Aguardando"

---

### ✅ **Passo 6: Aceitação da Inscrição pela Instituição** (3 min)

**Objetivo**: Mostrar que instituição consegue aceitar/rejeitar inscrições de voluntários.

**Ações**:

1. Faça logout
2. Faça login como instituição:
   - Email: `nova.instituicao.demo@email.com`
   - Password: `demo123456`

3. Clique em **"Painel"** → **"Instituição"**
4. Clique em **"Oportunidades"** (no menu esquerdo)
5. Clique na oportunidade que criou no Passo 3
6. Clique na aba **"Inscrições"**
7. Vê a lista de voluntários inscritos
8. Clique em um voluntário para ver detalhes
9. Clique em **"Aceitar"** (botão verde)

**Resultado Esperado**:
- ✅ Inscrição muda de "Aguardando" para "Aceite"
- ✅ Voluntário receberia email de confirmação (em produção)
- ✅ Vaga diminui (se tiver lógica de vagas)

**Alternativa - Rejeitar Inscrição**:
- Clique em **"Rejeitar"** (botão vermelho) em outro voluntário
- Inscrição muda para "Recusada"

---

### ✅ **Passo 7: Consulta pelo Administrador** (3 min)

**Objetivo**: Mostrar que admin consegue consultar dados e atividades do sistema.

**Ações**:

1. Faça logout
2. Faça login como admin:
   - Email: `admin@voluntariado.pt`
   - Password: `admin123`

3. Clique em **"Painel"** → **"Admin"**

4. **Demonstre o Dashboard Admin**:
   - Mostra estatísticas principais
   - Total de utilizadores
   - Total de instituições
   - Total de oportunidades
   - Total de voluntários

5. **Menu esquerdo - Navegue por cada secção**:

   **7a) Instituições**:
   - Clique em **"Instituições"**
   - Mostra lista de todas as instituições
   - Estados: Pendente, Aprovada, Bloqueada
   - Demonstre filtros se disponíveis

   **7b) Categorias**:
   - Clique em **"Categorias"**
   - Mostra todas as categorias disponíveis
   - Demonstre que pode criar/editar/deletar (opcional)

   **7c) Utilizadores**:
   - Clique em **"Utilizadores"**
   - Mostra lista de todos os utilizadores
   - Filtros por tipo (Voluntário, Instituição, Admin)

   **7d) Relatórios** (se implementado):
   - Clique em **"Relatórios"**
   - Mostra gráficos de atividades
   - Estatísticas por período

**Resultado Esperado**:
- ✅ Admin vê todos os dados do sistema
- ✅ Controlo total sobre todas as entidades
- ✅ Capacidade de gerir e moderar

---

### ✅ **Passo 8: Relatório Simples de Atividade** (1-2 min)

**Objetivo**: Demonstrar que sistema registra e mostra atividades.

**Ações**:

1. Estando como admin (ou em qualquer role)
2. Acesse o relatório/dashboard

**Opção A - Dashboard Geral (Admin)**:
- Já está na página admin
- Mostra estatísticas agregadas
- Exemplo: "12 Oportunidades", "8 Instituições", "45 Voluntários"

**Opção B - Relatório de Atividades**:
- Se tiver página de relatórios
- Clique em **"Relatórios"**
- Mostra:
  - Atividades por período
  - Inscrições por categoria
  - Instituições mais ativas
  - Gráficos de participação

**Opção C - Dashboard Individual**:
- Voluntário vê no seu dashboard:
  - Inscrições recentes
  - Status de participações
  - Histórico de atividades

- Instituição vê no seu dashboard:
  - Oportunidades criadas
  - Total de inscrições
  - Inscrições aceites/rejeitadas

**Resultado Esperado**:
- ✅ Sistema mostra relatório de atividades
- ✅ Dados são precisos e atualizados
- ✅ Informações úteis para gestão

---

## 🎥 Fluxo Completo em Ordem

Para uma apresentação fluida, siga esta ordem:

1. **Homepage** (5 seg) - Mostrar interface inicial
2. **Passo 1** - Registo voluntário (2 min)
3. **Passo 2** - Registo e aprovação instituição (3 min)
4. **Passo 3** - Criação oportunidade (3 min)
5. **Passo 4** - Pesquisa de oportunidades (2 min)
6. **Passo 5** - Inscrição voluntário (2 min)
7. **Passo 6** - Aceitação inscrição (3 min)
8. **Passo 7** - Consulta admin (3 min)
9. **Passo 8** - Relatório atividade (2 min)

**Total**: ~20 minutos

---

## 💡 Dicas para Apresentação

### ✨ Boas Práticas

1. **Prepare dados novos**: Crie novos registos durante a apresentação, não use dados existentes
2. **Fale enquanto clica**: Explique o que está a fazer
3. **Mostre a navegação**: Destaque a intuitibilidade da interface
4. **Valide inputs**: Mostre validações (ex: email inválido, palavra-passe fraca)
5. **Demonstre responsividade**: Se possível, redimensione browser para mobile

### 🎯 Pontos a Destacar

- ✅ **Segurança**: Autenticação JWT, passwords hasheadas
- ✅ **Usabilidade**: Interface em português, intuitiva
- ✅ **Funcionalidade**: Todos os 8 passos funcionam perfeitamente
- ✅ **Performance**: Respostas rápidas, sem lags
- ✅ **Escalabilidade**: Dados estruturados em PostgreSQL
- ✅ **Impacto Social**: Promove voluntariado local

### ⚠️ Possíveis Perguntas

**P: Como é tratada a segurança de dados?**  
R: Passwords hasheadas com Bcrypt, JWT para sessões, validação de permissões em cada API.

**P: Como escala para muitos utilizadores?**  
R: PostgreSQL com Prisma ORM, indices em campos principais, possibilidade de cache com Redis.

**P: Como está feita a validação de dados?**  
R: Validação no frontend com Zod, validação no backend em todas as APIs.

**P: Qual é o valor para o Município?**  
R: Plataforma que facilita voluntariado local, reforça participação cívica, conecta instituições com voluntários.

---

## 📹 Gravação de Demonstração (Opcional)

Se quiser gravar a apresentação:

1. Use OBS Studio (grátis)
2. Configure resolução 1920x1080
3. Grave browser inteiro
4. Adicione narração enquanto passa pelos passos
5. Faça pequenos cortes para melhorar fluidez

---

## 🔄 Fallback Plan

Se algo correr mal durante apresentação:

- **Banco de dados offline?** → Reinicie com `npx prisma db seed`
- **API não responde?** → Reinicie servidor com `npm run dev`
- **Browser não abre?** → Use outro browser (Firefox, Safari)
- **Espaço em disco?** → Use `/tmp` ou limpeza de cache

---

## ✅ Checklist Pós-Apresentação

- [ ] Agradecer audiência
- [ ] Apresentar equipa (4 estagiários)
- [ ] Mencionar funcionalidades extras
- [ ] Falar sobre impacto social
- [ ] Abrir para perguntas
- [ ] Fornecer documentação (link ou PDF)

---

## 📚 Documentação para Entregar

Após apresentação, forneça:

1. **README.md** - Quick start
2. **PROJETO_FINAL.md** - Sumário executivo
3. **CHECKLIST_FINAL.md** - Verificação de requisitos
4. **docs/TECNICO.md** - Para desenvolvedores
5. **docs/UTILIZADOR.md** - Para utilizadores finais
6. **Link do Repositório** - Se usar GitHub

---

**Boa Sorte na Apresentação!** 🎉

**Data**: 09 de Julho de 2026  
**Versão**: 1.0 - Apresentação Final  
**Tempo Estimado**: 20 minutos
