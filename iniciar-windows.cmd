@echo off
REM ======================================================================
REM  WebShop Eletronicos - script para iniciar o projeto todo no WINDOWS
REM
REM  Como usar: de dois cliques no iniciar-windows.cmd
REM             ou rode  iniciar-windows.cmd  no prompt
REM  (no Linux use o iniciar-linux.sh)
REM
REM  OBS: este script foi criado com ajuda de Inteligencia Artificial:
REM  Claude Opus 5.5 (Anthropic), usando o Claude Code. O resto do
REM  projeto nao foi feito com IA.
REM ======================================================================

setlocal EnableDelayedExpansion
cd /d "%~dp0"
title WebShop - Inicializacao

echo.
echo ==========================================
echo    WEBSHOP ELETRONICOS - INICIANDO (WIN)
echo ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
	echo [ERRO] Node.js nao encontrado. Instale o Node.js e tente de novo.
	echo        https://nodejs.org
	pause
	exit /b 1
)

where curl >nul 2>nul
if errorlevel 1 (
	echo [AVISO] curl nao encontrado, nao vou conseguir esperar a API subir.
)

curl -s -o nul http://localhost:8080/produtos >nul 2>nul
if not errorlevel 1 (
	echo [OK] A API ja esta rodando na porta 8080.
) else (
	echo [1/2] Subindo a API em outra janela, aguarde...
	start "WebShop API" /D "%~dp0api" cmd /k node servidor.js

	set PRONTO=0
	for /L %%i in (1,1,30) do (
		if !PRONTO!==0 (
			curl -s -o nul http://localhost:8080/produtos >nul 2>nul && set PRONTO=1
			if !PRONTO!==0 (
				<nul set /p "=."
				ping -n 2 127.0.0.1 >nul
			)
		)
	)
	echo.

	if !PRONTO!==0 (
		echo [ERRO] A API nao respondeu a tempo. Veja a janela "WebShop API".
		pause
		exit /b 1
	)
	echo [OK] API rodando em http://localhost:8080
)

echo [2/2] Abrindo o site no navegador...
start "" "%~dp0frontend\index.html"

echo.
echo Pronto. Para parar a API feche a janela "WebShop API".
echo.
pause
exit /b 0
