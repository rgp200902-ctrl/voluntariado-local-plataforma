# ⚠️ Riscos do Projeto e Mitigações

Este documento identifica os riscos potenciais do projeto e as estratégias de mitigação implementadas ou sugeridas.

---

## 1. Excesso de Funcionalidades

### Risco
Tentar implementar demasiadas funcionalidades que não são essenciais, dilatando o projeto e desviando do MVP.

### Impacto
- ⚠️ **Crítico**: Pode levar ao não cumprimento dos prazos
- ⚠️ Qualidade reduzida por falta de tempo
- ⚠️ Débito técnico acumulado

### Mitigação Implementada
✅ **MVP Focus**: Implementamos apenas as 6 funcionalidades obrigatórias:
1. Aprovação de instituição
2. Criação de oportunidade
3. Listagem pública
4. Inscrição de voluntário
5. Gestão de inscrições
6. Painel de admin

✅ **Melhorias futuras**: Documentadas em ficheiro separado (MELHORIAS_FUTURAS.md)

---

## 2. Dificuldade na Gestão de Permissões

### Risco
Instituições podem ver dados que não devem, voluntários podem acessar áreas do admin, etc.

### Impacto
- 🔴 **Crítico**: Falha de segurança
- 🔴 Violação de privacidade
- 🔴 Problemas legais

### Mitigação Implementada
✅ **Controlo de Acesso Baseado em Papel (RBAC)**:
```typescript
// API valida role em cada rota
const decoded = verifyToken(token);
if (decoded.role !== 'instituicao') {
  return errorResponse('Acesso negado', 403);
}
```

✅ **Frontend protegido**: Páginas verificam token antes de renderizar
✅ **Auditoria**: Todas as ações são registadas com userId

### Testes Sugeridos
- [ ] Voluntário não consegue aceder `/dashboard/admin`
- [ ] Instituição não consegue ver dados de outras instituições
- [ ] Admin consegue aceder tudo

---

## 3. Exposição Indevida de Dados de Voluntários

### Risco
Dados sensíveis (email, telefone, competências) expostos inadvertidamente.

### Impacto
- 🔴 **Crítico**: RGPD violation
- 🔴 Processos legais
- 🔴 Reputação danificada

### Mitigação Implementada
✅ **Controlo de acesso granular**:
- Voluntário vê apenas seus dados
- Instituição vê apenas dados de quem se inscreveu
- Admin vê tudo (com responsabilidade legal)

✅ **Não há endpoint público com dados sensíveis**

### Testes Sugeridos
- [ ] Voluntário A não consegue ver email de Voluntário B
- [ ] Instituição X não consegue ver inscrições de Instituição Y
- [ ] Exportação CSV inclui apenas dados necessários

---

## 4. Interface Complexa para o Utilizador

### Risco
Utilizadores não conseguem navegar ou usar a plataforma corretamente.

### Impacto
- 🟡 **Médio**: Baixa adoção
- 🟡 Suporte técnico aumentado
- 🟡 Feedback negativo

### Mitigação Implementada
✅ **Design intuitivo**:
- Navegação clara com menu principal
- Breadcrumbs em páginas aninhadas
- Botões com labels em português

✅ **Manual do utilizador** (UTILIZADOR.md)

✅ **Feedback visual**:
- Mensagens de sucesso/erro
- Loading spinners
- Estados de validação

### Melhorias Sugeridas
- [ ] Tooltips nas funcionalidades principais
- [ ] Onboarding interativo para novos utilizadores
- [ ] Vídeos de tutorial

---

## 5. Performance e Escalabilidade

### Risco
Plataforma ficar lenta com crescimento de dados (muitos voluntários/oportunidades).

### Impacto
- 🟡 **Médio**: Experiência de utilizador degradada
- 🟡 Possível perda de utilizadores

### Mitigação Implementada
✅ **Database**: PostgreSQL com Prisma (escalável)
✅ **Índices**: Criados em campos frequentemente consultados
✅ **Cache**: Possível adicionar Redis no futuro
✅ **Paginação**: APIs retornam dados em páginas

### Melhorias Sugeridas
- [ ] Adicionar Redis para cache de oportunidades
- [ ] Implementar CDN para assets estáticos
- [ ] Monitoramento com Sentry ou similar

---

## 6. Falta de Dados de Teste

### Risco
Ser difícil testar a plataforma sem dados realistas.

### Impacto
- 🟡 **Médio**: Testes manuais complexos
- 🟡 Erros não detetados

### Mitigação Implementada
✅ **Seed data**: `prisma/seed.js` inclui:
- 1 utilizador admin
- 1 instituição
- 1 voluntário
- 5+ oportunidades

✅ **Plano de testes**: Documento com 50+ cenários de teste

---

## 7. Integração com Serviços Externos

### Risco
Email, SMS, ou APIs externas falharem.

### Impacto
- 🟡 **Médio**: Notificações não chegam
- 🟡 Funcionalidades críticas inutilizadas

### Mitigação Sugerida
- [ ] Implementar fila de jobs (Bull, RabbitMQ)
- [ ] Retry automático com backoff exponencial
- [ ] Fallback para notificação na app
- [ ] Logging detalhado de falhas

---

## 8. Problemas de Compatibilidade de Browser

### Risco
Plataforma não funciona em browsers antigos ou pouco comuns.

### Impacto
- 🟡 **Médio**: Alguns utilizadores não conseguem usar
- 🟡 Suporte técnico aumentado

### Mitigação Implementada
✅ **React 18 + TypeScript**: Compatível com browsers modernos
✅ **Tailwind CSS**: Suporte cross-browser
✅ **Responsive design**: Mobile, tablet, desktop

### Melhorias Sugeridas
- [ ] Testar em Firefox, Safari, Edge
- [ ] Testes de compatibilidade automáticos

---

## 9. Falta de Documentação

### Risco
Futuro desenvolvedor não consegue manter/expandir o código.

### Impacto
- 🟡 **Médio**: Custo aumentado de manutenção
- 🟡 Erros ao fazer alterações

### Mitigação Implementada
✅ **Documentação técnica** (TECNICO.md)
✅ **Manual do utilizador** (UTILIZADOR.md)
✅ **Manual de instalação** (INSTALACAO.md)
✅ **Código comentado** onde necessário
✅ **README.md** com quick start

---

## 10. Segurança de Passwords

### Risco
Passwords fracas ou vulnerabilidades no armazenamento.

### Impacto
- 🔴 **Crítico**: Comprometimento de contas
- 🔴 Roubo de dados

### Mitigação Implementada
✅ **Bcrypt**: Passwords hasheadas com salt (12 rounds)
✅ **Validação**: Mínimo 8 caracteres requerido
✅ **JWT**: Token com expiração
✅ **HTTPS**: Necessário em produção

### Melhorias Sugeridas
- [ ] Implementar 2FA (Two-Factor Authentication)
- [ ] Password strength meter no registo
- [ ] Notificações de login suspeito
- [ ] Rate limiting em API de login

---

## Matriz de Risco

| Risco | Probabilidade | Impacto | Prioridade | Status |
|-------|--------------|--------|-----------|--------|
| Funcionalidades excessivas | Baixa | Crítico | 🔴 Alto | ✅ Mitigado |
| Gestão de permissões | Média | Crítico | 🔴 Alto | ✅ Mitigado |
| Exposição de dados | Média | Crítico | 🔴 Alto | ✅ Mitigado |
| Interface complexa | Média | Médio | 🟡 Médio | ✅ Mitigado |
| Performance | Baixa | Médio | 🟡 Médio | ⏳ Monitorar |
| Dados de teste | Baixa | Médio | 🟡 Médio | ✅ Mitigado |
| Serviços externos | Média | Médio | 🟡 Médio | ⏳ Implementar |
| Compatibilidade | Baixa | Médio | 🟡 Médio | ✅ OK |
| Falta de docs | Baixa | Médio | 🟡 Médio | ✅ Mitigado |
| Segurança de passwords | Média | Crítico | 🔴 Alto | ✅ Mitigado |

---

## Recomendações para Produção

Antes de fazer deploy em produção:

- [ ] Testar todos os riscos acima
- [ ] Implementar HTTPS/SSL
- [ ] Setup de backups automáticos
- [ ] Monitoramento e alertas (Sentry, DataDog)
- [ ] Rate limiting e DDoS protection
- [ ] Audit logging detalhado
- [ ] Disaster recovery plan
- [ ] Termos de serviço e RGPD policy

---

**Versão**: 1.0  
**Data**: 09/07/2026  
**Atualizado por**: Estagiário 2
