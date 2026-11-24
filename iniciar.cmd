:<<"::FIM_WINDOWS"
@echo off
REM ======================================================================
REM  WebShop Eletronicos - script para iniciar o projeto todo
REM
REM  Funciona no WINDOWS e no LINUX (o mesmo arquivo serve para os dois).
REM    Windows:  de dois cliques no iniciar.cmd ou rode  iniciar.cmd
REM    Linux:    rode  sh iniciar.cmd   (ou  bash iniciar.cmd)
REM
REM  Como funciona: a primeira linha e um "label" para o cmd do Windows
REM  (entao ele ignora) e um "heredoc" para o shell do Linux (que pula
REM  toda a parte do Windows). Cada sistema so executa a sua parte.
REM
REM  OBS: este script (e somente este arquivo) foi criado com ajuda de
REM  Inteligencia Artificial: Claude Opus 5.5 (Anthropic), usando o
REM  Claude Code. O resto do projeto nao foi feito com esse script.
REM ======================================================================

REM ---------------------------- PARTE WINDOWS ---------------------------
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
::FIM_WINDOWS

# ----------------------------- PARTE LINUX -----------------------------
# (o Windows nunca chega aqui por causa do "exit /b" acima)

cd "$(dirname "$0")" || exit 1
PASTA=$(pwd)

echo ""
echo "=========================================="
echo "   WEBSHOP ELETRONICOS - INICIANDO (LINUX)"
echo "=========================================="
echo ""

if ! command -v node >/dev/null 2>&1; then
	echo "[ERRO] Node.js nao encontrado! Instale o Node.js e tente de novo."
	echo "       ex: sudo apt install nodejs"
	exit 1
fi

# funcao que testa se a api respondeu (usa curl ou wget, o que tiver)
api_no_ar() {
	if command -v curl >/dev/null 2>&1; then
		curl -s -o /dev/null http://localhost:8080/produtos
	else
		if command -v wget >/dev/null 2>&1; then
			wget -q -O /dev/null http://localhost:8080/produtos
		else
			return 1
		fi
	fi
}

PID_API=""

if api_no_ar; then
	echo "[OK] A API ja esta rodando na porta 8080."
else
	echo "[1/2] Subindo a API (log em api.log), aguarde..."
	node "$PASTA/api/servidor.js" > "$PASTA/api.log" 2>&1 &
	PID_API=$!

	# quando apertar Ctrl+C derruba a api junto
	trap 'echo ""; echo "Parando a API..."; kill $PID_API 2>/dev/null; exit 0' INT TERM

	PRONTO=0
	i=0
	while [ $i -lt 30 ]; do
		if api_no_ar; then
			PRONTO=1
			break
		fi
		if ! kill -0 $PID_API 2>/dev/null; then
			echo ""
			echo "[ERRO] A API parou de rodar. Veja o arquivo api.log"
			exit 1
		fi
		printf "."
		sleep 1
		i=$((i + 1))
	done
	echo ""

	if [ $PRONTO -eq 0 ]; then
		echo "[ERRO] A API nao respondeu a tempo. Veja o arquivo api.log"
		kill $PID_API 2>/dev/null
		exit 1
	fi
	echo "[OK] API rodando em http://localhost:8080"
fi

echo "[2/2] Abrindo o site no navegador..."
SITE="$PASTA/frontend/index.html"
if command -v xdg-open >/dev/null 2>&1; then
	xdg-open "$SITE" >/dev/null 2>&1 &
else
	if command -v open >/dev/null 2>&1; then
		open "$SITE"
	else
		echo "Nao consegui abrir o navegador, abra manualmente:"
		echo "  file://$SITE"
	fi
fi

echo ""
if [ -n "$PID_API" ]; then
	echo "Pronto! Aperte Ctrl+C para parar a API."
	wait $PID_API
else
	echo "Pronto!"
fi
