# 🚀 Guia: Publicar Projeto no GitHub

## ⏱️ Tempo: ~5-10 minutos

---

## ✅ Pré-Requisitos

- [ ] Conta GitHub criada (https://github.com)
- [ ] Git instalado no Windows
- [ ] SSH key configurada (ou usar HTTPS)

---

## 🔧 Passo 1: Preparar Ficheiros Locais

### 1a) Criar `.gitignore` na raiz

```
cd "c:\Plataforma de Voluntariado Local"
```

Criar ficheiro `.gitignore`:

```
node_modules/
.next/
.env
.env.local
.env.*.local
*.pem
.DS_Store
dist/
build/
coverage/
.vercel
```

### 1b) Limpar ficheiros desnecessários

```bash
# Remover node_modules (vai ser reinstalado)
rmdir /s /q node_modules
rmdir /s /q prisma\node_modules
```

---

## 🔑 Passo 2: Configurar Git Localmente

```bash
# Navegar para a pasta
cd "c:\Plataforma de Voluntariado Local"

# Configurar nome e email (uma vez)
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@email.com"

# Inicializar repositório Git
git init

# Adicionar todos os ficheiros
git add .

# Criar primeiro commit
git commit -m "Initial commit: Plataforma de Voluntariado Local MVP"
```

---

## 📂 Passo 3: Criar Repositório no GitHub

### 3a) Aceder a GitHub.com

1. Ir para https://github.com/new
2. Nome do repositório: `plataforma-voluntariado-local`
3. Descrição: `Plataforma web para conectar voluntários com oportunidades de voluntariado`
4. Selecionar **Public** (se quiser que todos vejam)
5. **NÃO** marcar "Add README, .gitignore, or license"
6. Clicar **"Create repository"**

### 3b) Copiar URL do repositório

```
https://github.com/SEU_USERNAME/plataforma-voluntariado-local.git
```

ou

```
git@github.com:SEU_USERNAME/plataforma-voluntariado-local.git
```

---

## 🔗 Passo 4: Ligar Repositório Remoto

```bash
# Adicionar repositório remoto
git remote add origin https://github.com/SEU_USERNAME/plataforma-voluntariado-local.git

# Verificar se funcionou
git remote -v
```

**Deve mostrar**:
```
origin  https://github.com/SEU_USERNAME/plataforma-voluntariado-local.git (fetch)
origin  https://github.com/SEU_USERNAME/plataforma-voluntariado-local.git (push)
```

---

## 📤 Passo 5: Fazer Push (Enviar para GitHub)

### Opção A: HTTPS (Recomendado para iniciantes)

```bash
# Enviar código
git push -u origin main
```

**Quando pedir credenciais**:
- Username: seu username do GitHub
- Password: seu **Personal Access Token** (não a password normal!)

### Gerar Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Clicar "Generate new token"
3. Nome: `github-desktop`
4. Expiração: 30 dias
5. Permissions: Repository access → All repositories
6. Permissions: Contents → Read and Write
7. Clicar "Generate token"
8. **Copiar o token** (vai aparecer só uma vez!)
9. Usar esse token como password

### Opção B: SSH (Mais seguro)

```bash
# Gerar SSH key (se não tiver)
ssh-keygen -t ed25519 -C "seu.email@email.com"

# Copiar chave pública
type %userprofile%\.ssh\id_ed25519.pub

# Colar em GitHub → Settings → SSH and GPG keys → New SSH key
```

---

## ✅ Passo 6: Verificar no GitHub

1. Abrir https://github.com/SEU_USERNAME/plataforma-voluntariado-local
2. Verificar se os ficheiros estão lá
3. Ver histórico de commits

---

## 🔄 Próximas Vezes (Fazer Commits)

```bash
# Ver o que mudou
git status

# Adicionar ficheiros modificados
git add .

# Ou adicionar ficheiros específicos
git add src/app/page.tsx

# Fazer commit
git commit -m "Descrição clara da mudança"

# Enviar para GitHub
git push
```

---

## ❌ Solucionar Problemas Comuns

### Erro: "fatal: not a git repository"

```bash
# Solução: Inicializar Git
git init
git add .
git commit -m "Initial commit"
```

### Erro: "Permission denied (publickey)"

```bash
# Solução: Usar HTTPS em vez de SSH
git remote set-url origin https://github.com/SEU_USERNAME/plataforma-voluntariado-local.git
git push -u origin main
```

### Erro: "remote: Repository not found"

```bash
# Solução: Verificar URL
git remote -v

# Se errada, corrigir:
git remote set-url origin https://github.com/SEU_USERNAME/plataforma-voluntariado-local.git
```

### Erro: "src refspec main does not match any"

```bash
# Solução: O branch pode chamar-se "master" em vez de "main"
git branch -M main
git push -u origin main
```

### Ficheiro muito grande (> 100MB)

```bash
# Solução: Adicionar ao .gitignore
echo "ficheiro_grande.zip" >> .gitignore

# Remover do Git
git rm --cached ficheiro_grande.zip
git commit -m "Remove large file"
git push
```

### .env expostos acidentalmente

```bash
# Remover do histórico (cuidado!)
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "Remove .env file"
git push
```

---

## 📋 Ficheiros Recomendados no GitHub

✅ Adicionar (com `git add .`):
```
- Código em src/
- Ficheiros de config (package.json, tsconfig.json)
- Documentação (docs/, README.md)
- Prisma schema
```

❌ NÃO Adicionar (via .gitignore):
```
- node_modules/
- .next/
- .env (ficheiros de configuração privada)
- Ficheiros de build
```

---

## 🎁 Sugestão: Adicionar Ficheiros Importantes

Criar ficheiros recomendados para GitHub:

### `README.md` (se ainda não existir)

```markdown
# Plataforma de Voluntariado Local

Plataforma web para conectar voluntários com oportunidades de voluntariado.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📚 Documentação

Ver `docs/` para documentação completa.

## 👥 Equipa

Desenvolvido por 4 estagiários como projeto final.

## 📄 Licença

MIT
```

### `.github/workflows/deploy.yml` (CI/CD opcional)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
```

---

## 🎯 Checklist Final

- [ ] Git inicializado localmente
- [ ] `.gitignore` criado
- [ ] Repositório criado no GitHub
- [ ] Remote adicionado (`git remote add origin ...`)
- [ ] Primeiro push feito (`git push -u origin main`)
- [ ] Ficheiros visíveis no GitHub
- [ ] README.md presente
- [ ] Documentação completa

---

## 💡 Dicas Extras

### 1. Adicionar Colaboradores

GitHub → Settings → Collaborators → Add people

### 2. Criar Releases

GitHub → Releases → Draft a new release → Preencher versão e notas

### 3. GitHub Pages (Documentação)

GitHub → Settings → Pages → Branch: main, folder: /docs

### 4. Issues e Pull Requests

Usar para rastrear bugs e melhorias

### 5. GitHub Actions (CI/CD)

Automatizar testes e deploy

---

## 📞 Se Tiver Dúvidas

```
1. Qual é o erro exato que recebeu?
2. Qual foi o comando que executou?
3. A pasta tem .gitignore?
4. Tem .env ou ficheiros privados expostos?
```

---

**Guia Completo para Publicar no GitHub**  
**Data**: 09 de Julho de 2026  
**Status**: ✅ Pronto para usar
