# WebShop Eletronicos

Loja virtual simples de eletronicos (projeto de 2010).

O site mostra os produtos na pagina inicial, deixa adicionar no carrinho,
alterar quantidade, remover e finalizar o pedido. No final aparece uma
mensagem avisando que o pedido sera enviado.

## Estrutura

```
web-shop/
  iniciar-windows.cmd  script que sobe tudo no Windows
  iniciar-linux.sh     script que sobe tudo no Linux
  frontend/            site em HTML, CSS e JavaScript puro
    index.html         pagina inicial com os produtos
    carrinho.html      carrinho e dados de entrega
    css/estilo.css
    js/script.js
    imagens/
  api/
    servidor.js        API em Node.js (sem nenhum modulo de fora)
```

## Requisitos

- Node.js (qualquer versao recente)
- Um navegador (Firefox, Chrome, IE...)

Nao precisa rodar `npm install`, a API so usa o que ja vem com o Node.

Para conferir se ja tem instalado:

```
node -v
```

## Como inicializar o projeto

### Jeito rapido (script)

Na raiz do projeto tem um script para cada sistema. Ele sobe a API, espera
ela ficar no ar e abre o site no navegador:

- **Windows:** de dois cliques no `iniciar-windows.cmd`
  (ou rode `iniciar-windows.cmd` no prompt)
- **Linux:** `sh iniciar-linux.sh`
  (ou `chmod +x iniciar-linux.sh` e depois `./iniciar-linux.sh`)

No Windows a API abre numa janela separada chamada "WebShop API" (feche ela
para parar). No Linux a API roda em segundo plano com log em `api.log`, e o
Ctrl+C para tudo.

### Jeito manual

#### 1. Subir a API

```
cd api
node servidor.js
```

Quando aparecer `WEBSHOP API RODANDO NA PORTA 8080` a API esta no ar em
http://localhost:8080

Para testar se esta funcionando abra no navegador:
http://localhost:8080/produtos

#### 2. Abrir o site

Com a API rodando, basta abrir o arquivo `frontend/index.html` no navegador
(duplo clique no arquivo).

**Importante:** se a API nao estiver ligada o site mostra a mensagem
"Nao foi possivel carregar os produtos".

## Rotas da API

| Metodo | Rota | O que faz |
|--------|------|-----------|
| GET  | /produtos | lista os produtos |
| GET  | /carrinho | mostra o carrinho e o total |
| POST | /carrinho/adicionar?id= | adiciona um produto (ou +1 na quantidade) |
| POST | /carrinho/diminuir?id= | diminui a quantidade |
| POST | /carrinho/remover?id= | remove o produto do carrinho |
| POST | /pedido/finalizar | finaliza o pedido (nome, email, endereco, cidade, uf, cep, pagamento) |

## Por que Node.js?

O site em si e so HTML, CSS e JavaScript, mas precisava de um "servidor" pra
simular o que acontece numa loja de verdade: guardar o carrinho, controlar o
estoque e gerar o numero do pedido. Escolhemos o Node.js porque:

- **E JavaScript**, a mesma linguagem do site. Nao precisou aprender outra
  linguagem so pra fazer o servidor.
- **Nao precisa instalar mais nada**: nem Tomcat, nem Maven, nem pacotes do
  npm. O modulo `http` que ja vem com o Node da conta de tudo.
- **Um arquivo so** (`servidor.js`) e um comando so (`node servidor.js`).
- Sobe em menos de um segundo, bom pra ficar testando.
- Devolve as respostas em JSON, que o JavaScript do site ja entende direto.

A ideia aqui e so **simular** as acoes, por isso nao tem banco de dados.

## Observacoes

- Os dados ficam na memoria. Se reiniciar a API o carrinho e o estoque voltam
  ao inicial.
- O carrinho e um so para todo mundo (nao tem login).
- Pagamento por boleto tem 5% de desconto e o frete e gratis acima de R$ 299,00.
