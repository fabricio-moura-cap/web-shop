# WebShop Eletronicos

Loja virtual simples de eletronicos (projeto de 2010).

O site mostra os produtos na pagina inicial, deixa adicionar no carrinho,
alterar quantidade, remover e finalizar o pedido. No final aparece uma
mensagem avisando que o pedido sera enviado.

## Estrutura

```
web-shop/
  frontend/          site em HTML, CSS e JavaScript puro
    index.html       pagina inicial com os produtos
    carrinho.html    carrinho e dados de entrega
    css/estilo.css
    js/script.js
    imagens/
  api/               API em Spring Boot (Java)
    pom.xml
    src/main/java/br/com/webshop/
```

## Requisitos

- Java 17 ou mais novo
- Maven 3.6 ou mais novo
- Um navegador (Firefox, Chrome, IE...)

Para conferir se ja tem instalado:

```
java -version
mvn -v
```

## Como inicializar o projeto

### Jeito rapido (script)

Na raiz do projeto tem o `iniciar.cmd`, que sobe a API, espera ela ficar no
ar e abre o site no navegador. O mesmo arquivo funciona nos dois sistemas:

- **Windows:** de dois cliques no `iniciar.cmd` (ou rode `iniciar.cmd` no prompt)
- **Linux:** `sh iniciar.cmd`

No Windows a API abre numa janela separada chamada "WebShop API" (feche ela
para parar). No Linux a API roda em segundo plano com log em `api.log`, e o
Ctrl+C para tudo.

### Jeito manual

#### 1. Subir a API

Abra o terminal na pasta `api` e rode:

```
cd api
mvn spring-boot:run
```

Ou se preferir gerar o .jar:

```
cd api
mvn package
java -jar target/webshop-api-1.0.jar
```

Quando aparecer `WEBSHOP API RODANDO NA PORTA 8080` a API esta no ar em
http://localhost:8080

Para testar se esta funcionando abra no navegador:
http://localhost:8080/produtos

#### 2. Abrir o site

Com a API rodando, basta abrir o arquivo `frontend/index.html` no navegador
(duplo clique no arquivo).

Se o seu navegador bloquear as requisicoes abrindo direto pelo arquivo, da pra
subir um servidor simples na pasta `frontend`, por exemplo:

```
cd frontend
python -m http.server 5500
```

e acessar http://localhost:5500

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

## Por que Spring Boot?

O site em si e so HTML, CSS e JavaScript, mas precisava de um "servidor" pra
simular o que acontece numa loja de verdade: guardar o carrinho, controlar o
estoque e gerar o numero do pedido. Escolhemos o Spring Boot porque:

- **Java** e a linguagem que a gente ja usava no curso/trabalho, entao nao
  precisou aprender outra linguagem so pra fazer o servidor.
- **Nao precisa instalar Tomcat** nem configurar servidor de aplicacao. O
  Spring Boot ja vem com o servidor embutido, e so rodar um comando e pronto.
- **Pouca configuracao**: sem um monte de XML, so um `pom.xml` e o arquivo
  `application.properties`.
- Fica facil criar as rotas que o JavaScript chama (`@GetMapping`,
  `@PostMapping`) e ele ja devolve as respostas em JSON automaticamente.
- Com o `@CrossOrigin` o site consegue chamar a API mesmo estando em outro
  endereco/porta.
- Se um dia a loja crescer da pra ligar num banco de dados de verdade
  (MySQL, por exemplo) sem ter que refazer tudo.

A ideia aqui e so **simular** as acoes, por isso nao tem banco de dados.

## Observacoes

- Os dados ficam na memoria. Se reiniciar a API o carrinho e o estoque voltam
  ao inicial.
- O carrinho e um so para todo mundo (nao tem login).
- Pagamento por boleto tem 5% de desconto e o frete e gratis acima de R$ 299,00.
