# 📋 Plano de Testes - Plataforma de Voluntariado Local

## Credenciais de Teste

```
Admin: admin@voluntariado.pt / admin123
Instituição: instituicao@exemplo.pt / instituicao123
Voluntário: voluntario@exemplo.pt / voluntario123
```

## Testes Funcionais Básicos

### 1. Autenticação e Login

- [ ] Fazer login com credenciais válidas
- [ ] Fazer login com credenciais inválidas (deve mostrar erro)
- [ ] Logout funciona
- [ ] Sem token, redireciona para login
- [ ] Token persiste após refresh

### 2. Páginas Públicas

- [ ] Homepage carrega com estatísticas
- [ ] Página "Oportunidades" mostra lista
- [ ] Filtros funcionam (categoria, localização, pesquisa)
- [ ] Clique em oportunidade abre detalhes
- [ ] Página "Sobre" carrega
- [ ] Página "Contacto" carrega
- [ ] Links na navbar funcionam

### 3. Fluxo de Voluntário

**Dashboard**
- [ ] Dashboard carrega com estatísticas
- [ ] Mostra inscrições recentes
- [ ] Clique em oportunidade vai para detalhes

**Perfil**
- [ ] Carregar perfil
- [ ] Editar nome, telefone, localidade, etc.
- [ ] Guardar alterações (mensagem de sucesso)
- [ ] Dados persistem após reload

**Minhas Inscrições**
- [ ] Lista inscrições do voluntário
- [ ] Filtrar por estado (Aguardando, Aceite, etc.)
- [ ] Cancelar inscrição (com confirmação)

**Histórico**
- [ ] Mostrar participações passadas
- [ ] Filtrar por estado
- [ ] Dados corretos exibidos

### 4. Fluxo de Instituição

**Dashboard**
- [ ] Mostra estatísticas (oportunidades, inscrições)
- [ ] Lista suas oportunidades

**Perfil**
- [ ] Editar nome da instituição, descrição, contactos
- [ ] Guardar com sucesso

**Criar Oportunidade**
- [ ] Preencher formulário
- [ ] Selecionar categoria
- [ ] Guardar nova oportunidade
- [ ] Oportunidade aparece na lista

**Ver Inscrições**
- [ ] Clique em oportunidade abre inscrições
- [ ] Ver detalhes do voluntário
- [ ] Aceitar/Rejeitar inscrição
- [ ] Exportar CSV funciona

### 5. Fluxo de Admin

**Dashboard**
- [ ] Mostra KPIs (utilizadores, instituições, oportunidades)
- [ ] Lista instituições pendentes

**Gestão de Instituições**
- [ ] Aprovar instituição pendente
- [ ] Bloquear instituição
- [ ] Filtrar por estado

**Gestão de Categorias**
- [ ] Criar nova categoria
- [ ] Editar categoria
- [ ] Deletar categoria
- [ ] Lista atualiza

**Gestão de Utilizadores**
- [ ] Ver lista de utilizadores
- [ ] Filtrar por role
- [ ] Ver detalhes de utilizador

**Relatórios**
- [ ] Gerar relatório por período
- [ ] Mostrar gráficos (oportunidades por categoria, etc.)

## Testes de Validação

### Validação de Formulários
- [ ] Campos obrigatórios moram erro
- [ ] Email válido é requerido
- [ ] Passwords fortes requeridas
- [ ] Datas válidas

### Validação de Permissões
- [ ] Voluntário não pode acessar dashboard de instituição
- [ ] Instituição não pode acessar admin
- [ ] Admin pode acessar tudo
- [ ] Sem autenticação redireciona para login

### Validação de Dados
- [ ] Campos em português (título, descrição, local, etc.)
- [ ] Datas formatadas pt-PT (DD/MM/YYYY)
- [ ] CSV exporta com headers corretos
- [ ] Números formatados corretamente

## Testes de UI/UX

- [ ] Layout responsivo em mobile
- [ ] Layout responsivo em tablet
- [ ] Layout responsivo em desktop
- [ ] Cores e fontes consistentes
- [ ] Botões com hover effects
- [ ] Carregamento mostra spinner
- [ ] Mensagens de erro/sucesso claras
- [ ] Navegação intuitiva

## Testes de Performance

- [ ] Homepage carrega em < 2s
- [ ] Dashboard carrega em < 2s
- [ ] Lista de oportunidades < 2s (com scroll)
- [ ] Sem erros de console
- [ ] Sem warnings desnecessários

## Testes de Segurança

- [ ] Passwords não aparecem em plain text
- [ ] JWT tokens válidos no localStorage
- [ ] CORS configurado corretamente
- [ ] Sem acesso direto a URLs protegidas sem token
- [ ] Sem SQL injection possível

## Matriz de Testes - Por Utilizador

| Funcionalidade | Voluntário | Instituição | Admin |
|---|---|---|---|
| Login | ✅ | ✅ | ✅ |
| Ver Oportunidades | ✅ | ✅ | ✅ |
| Criar Oportunidade | ❌ | ✅ | ✅ |
| Inscrever-se | ✅ | ❌ | ❌ |
| Gerir Inscrições | ❌ | ✅ | ✅ |
| Ver Dashboard | ✅ | ✅ | ✅ |
| Editar Perfil | ✅ | ✅ | ✅ |
| Gestão Admin | ❌ | ❌ | ✅ |

## Como Executar Testes

```bash
# Instalar dependências (se necessário)
npm install

# Correr servidor
npm run dev

# Abrir em browser
http://localhost:3000

# Testar fluxos manualmente
# Ver checklist acima
```

## Relatório de Bugs (Encontrados)

(A preencher durante testes)

## Conclusões Após Testes

(A preencher após completar todos os testes)

---

**Data**: 09/07/2026  
**Responsável**: Estagiário 4  
**Status**: ⏳ Pendente
