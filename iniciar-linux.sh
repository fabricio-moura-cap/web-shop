#!/bin/sh
# ======================================================================
#  WebShop Eletronicos - script para iniciar o projeto todo no LINUX
#
#  Como usar:  sh iniciar-linux.sh
#        ou:   chmod +x iniciar-linux.sh  e depois  ./iniciar-linux.sh
#  (no Windows use o iniciar-windows.cmd)
#
#  OBS: este script foi criado com ajuda de Inteligencia Artificial:
#  Claude Opus 5.5 (Anthropic), usando o Claude Code. O resto do
#  projeto nao foi feito com IA.
# ======================================================================

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
