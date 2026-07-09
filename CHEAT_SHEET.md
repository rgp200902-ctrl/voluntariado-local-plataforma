# 🚀 CHEAT SHEET - Apresentação Final (5 minutos de preparação)

## ⏱️ TL;DR - O Essencial

**URL**: http://localhost:3000  
**Comando**: `npm run dev`  
**Tempo total**: 20 minutos

---

## 👥 3 Credenciais (Copiar/Colar)

```
ADMIN: admin@voluntariado.pt / admin123
INSTITUIÇÃO: instituicao@exemplo.pt / instituicao123
VOLUNTÁRIO: voluntario@exemplo.pt / voluntario123
```

---

## 🎬 Os 8 Passos Rápidos

### ✅ PASSO 1 - Registo Voluntário (2 min)
**Click**: Home → Registar como Voluntário
**Preenche**: Nome, Email, Password
**Resultado**: Novo voluntário criado

### ✅ PASSO 2 - Aprovação Instituição (2 min)
**Login**: Admin
**Click**: Painel → Instituições
**Ação**: Clique em "Aprovar"
**Resultado**: Instituição muda para "Aprovada"

### ✅ PASSO 3 - Criar Oportunidade (2 min)
**Login**: Instituição aprovada
**Click**: Painel → Criar Oportunidade
**Preenche**: Título, Descrição, Categoria, Data, Vagas
**Resultado**: Nova oportunidade no sistema

### ✅ PASSO 4 - Pesquisar Oportunidades (1 min)
**Click**: Oportunidades
**Demo**: Filtro categoria, localização, pesquisa
**Resultado**: Filtros funcionam em tempo real

### ✅ PASSO 5 - Inscrição Voluntário (1 min)
**Click**: Oportunidade → Inscrever-se
**Resultado**: Estado fica "Aguardando"

### ✅ PASSO 6 - Aceitar Inscrição (2 min)
**Login**: Instituição
**Click**: Painel → Oportunidades → Ver Inscrições
**Ação**: Clique em "Aceitar"
**Resultado**: Muda para "Aceite"

### ✅ PASSO 7 - Admin Consulta (2 min)
**Login**: Admin
**Click**: Painel → Admin
**Demo**: Dashboard, Instituições, Categorias, Utilizadores
**Resultado**: Admin vê tudo

### ✅ PASSO 8 - Relatório (1 min)
**Mostrar**: Dashboard Admin
**Detalhe**: 12 Oportunidades, 8 Instituições, 45 Voluntários
**Resultado**: Sistema pronto!

---

## 🎯 Pontos a Destacar

✅ **Funcionalidade**: Todos os 8 passos funcionam  
✅ **Segurança**: JWT + Bcrypt  
✅ **Usabilidade**: Interface intuitiva em português  
✅ **Responsividade**: Mobile, tablet, desktop  
✅ **Escalabilidade**: PostgreSQL + Prisma  
✅ **Impacto**: Voluntariado local conectado  

---

## ⚡ Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Servidor não abre | `npm run dev` |
| Base de dados vazia | `npx prisma db seed` |
| Erro 500 na API | Reiniciar servidor |
| Browser não carrega | Tentar outro browser |
| Página branca | Ctrl+Shift+Delete cache |

---

## 📊 Responder Perguntas Comuns

**P: Como funciona a segurança?**  
R: JWT + Bcrypt 12 rounds + Validação por role

**P: Quantas horas de desenvolvimento?**  
R: ~200 horas (4 estagiários × 50h cada)

**P: Posso testar agora?**  
R: Sim! `npm run dev` em `http://localhost:3000`

**P: Qual é a arquitetura?**  
R: Next.js 14 + React 18 + PostgreSQL + Prisma

---

## 🎁 Ficheiros para Entregar

1. **README.md** - Start rápido
2. **DEMONSTRACAO_FINAL.md** - Guia passo-a-passo
3. **PROJETO_FINAL.md** - Resumo executivo
4. **docs/** - Toda a documentação
5. **Código** - Repositório GitHub (ou ZIP)

---

## ✨ Last Minute Checklist

- [ ] Servidor a correr
- [ ] Dados de seed carregados
- [ ] Browser pronto em http://localhost:3000
- [ ] 3 credenciais copiadas
- [ ] Documento de requisitos próximo
- [ ] Documentação impressa/digital

---

## 🎉 PRONTO!

**Status**: ✅ MVP 100% Completo  
**Data**: 09 de Julho 2026  
**Equipa**: 4 Estagiários  

**Boa apresentação!** 🚀
