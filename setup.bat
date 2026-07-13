@echo off
echo =====================================================
echo Plataforma de Voluntariado Local - Configuracao
echo =====================================================
echo.

echo PASSO 1 - A instalar Node.js...
echo Se nao tiver o Node.js, faca o download em:
echo https://nodejs.org/dist/v20.12.0/node-v20.12.0-x64.msi
echo.
pause

echo PASSO 2 - A instalar dependencias...
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias
    pause
    exit /b 1
)

echo.
echo PASSO 3 - A configurar base de dados PostgreSQL...
echo.
echo Antes de continuar, garanta que o PostgreSQL esta instalado e a correr.
echo Crie uma base de dados com o nome "voluntariado_local".
echo.
echo Se precisar de alterar as configuracoes, edite o ficheiro .env
echo.
pause

echo PASSO 4 - A criar as tabelas na base de dados...
call npx prisma generate
call npx prisma db push
if %errorlevel% neq 0 (
    echo Erro ao criar tabelas. Verifique a ligacao a base de dados no ficheiro .env
    pause
    exit /b 1
)

echo PASSO 5 - A inserir dados de exemplo...
call npx prisma db seed
if %errorlevel% neq 0 (
    echo Aviso: Pode ignorar se ja existem dados.
)

echo.
echo =====================================================
echo Configuracao concluida!
echo =====================================================
echo.
echo A iniciar servidor...
echo Abra o navegador em: http://localhost:3000
echo.
echo Contas de teste:
echo   Admin:      admin@voluntariado.pt / admin123
echo   Instituicao: instituicao@exemplo.pt / instituicao123
echo   Voluntario:  voluntario@exemplo.pt / voluntario123
echo.
call npm run dev
pause
