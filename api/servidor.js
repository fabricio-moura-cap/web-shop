/*
 * WebShop Eletronicos - API
 * servidor feito em node puro, sem nenhum modulo de fora
 * para rodar: node servidor.js
 */

var http = require("http");
var url = require("url");
var querystring = require("querystring");

var PORTA = 8080;

// "banco de dados" na memoria
var produtos = new Array();
var carrinho = new Array();
var contadorPedidos = 1000;

produtos.push({ id: 1, nome: "Notebook 14\" Core 2 Duo 2GB HD 320GB", preco: 1899.00, precoAntigo: 2199.00, imagem: "notebook.svg", estoque: 5, promocao: true });
produtos.push({ id: 2, nome: "TV LCD 32\" HD com conversor digital", preco: 1499.00, precoAntigo: 0, imagem: "tv.svg", estoque: 3, promocao: false });
produtos.push({ id: 3, nome: "Celular Dual Chip Camera 2.0MP MP3", preco: 299.00, precoAntigo: 349.00, imagem: "celular.svg", estoque: 10, promocao: true });
produtos.push({ id: 4, nome: "MP4 Player 4GB com Radio FM", preco: 129.90, precoAntigo: 0, imagem: "mp4.svg", estoque: 20, promocao: false });
produtos.push({ id: 5, nome: "Camera Digital 12MP Zoom Optico 4x", preco: 549.00, precoAntigo: 0, imagem: "camera.svg", estoque: 7, promocao: false });
produtos.push({ id: 6, nome: "Monitor LCD 18.5\" Widescreen", preco: 449.00, precoAntigo: 499.00, imagem: "monitor.svg", estoque: 4, promocao: true });
produtos.push({ id: 7, nome: "GPS Automotivo Tela 4.3\" com TTS", preco: 399.00, precoAntigo: 0, imagem: "gps.svg", estoque: 6, promocao: false });
produtos.push({ id: 8, nome: "Pen Drive 4GB USB 2.0", preco: 39.90, precoAntigo: 0, imagem: "pendrive.svg", estoque: 50, promocao: false });
produtos.push({ id: 9, nome: "Webcam 1.3MP com Microfone", preco: 59.90, precoAntigo: 0, imagem: "webcam.svg", estoque: 0, promocao: false });
produtos.push({ id: 10, nome: "Mouse Optico USB 800dpi", preco: 24.90, precoAntigo: 0, imagem: "mouse.svg", estoque: 30, promocao: false });
produtos.push({ id: 11, nome: "Pen Drive 8GB USB 2.0", preco: 69.90, precoAntigo: 79.90, imagem: "pendrive.svg", estoque: 15, promocao: false });
produtos.push({ id: 12, nome: "Celular Flip Bluetooth Camera VGA", preco: 199.00, precoAntigo: 0, imagem: "celular.svg", estoque: 8, promocao: false });


// manda a resposta em json (com o cabecalho pro site conseguir chamar)
function responder(res, status, objeto) {
	res.writeHead(status, {
		"Content-Type": "application/json; charset=utf-8",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type"
	});
	res.end(JSON.stringify(objeto));
}

function calcularTotal() {
	var total = 0;
	for (var i = 0; i < carrinho.length; i++) {
		total = total + (carrinho[i].preco * carrinho[i].quantidade);
	}
	return total;
}


/* ===================== ROTAS ===================== */

function listarProdutos(res) {
	console.log("listando produtos... total: " + produtos.length);
	responder(res, 200, produtos);
}

function verCarrinho(res) {
	var resposta = {};
	resposta.itens = carrinho;
	resposta.total = calcularTotal();
	responder(res, 200, resposta);
}

function adicionar(res, id) {
	var resposta = {};
	console.log("adicionando produto " + id);

	// procura o produto
	var produto = null;
	for (var i = 0; i < produtos.length; i++) {
		if (produtos[i].id == id) {
			produto = produtos[i];
		}
	}

	if (produto != null) {
		if (produto.estoque > 0) {
			// ve se ja esta no carrinho
			var achou = false;
			for (var i = 0; i < carrinho.length; i++) {
				if (carrinho[i].id == id) {
					achou = true;
					if (carrinho[i].quantidade < produto.estoque) {
						carrinho[i].quantidade = carrinho[i].quantidade + 1;
						resposta.sucesso = true;
						resposta.mensagem = "Quantidade atualizada";
					} else {
						resposta.sucesso = false;
						resposta.mensagem = "Desculpe, so temos " + produto.estoque + " unidade(s) deste produto em estoque.";
					}
				}
			}

			if (achou == false) {
				var item = {};
				item.id = produto.id;
				item.nome = produto.nome;
				item.preco = produto.preco;
				item.imagem = produto.imagem;
				item.quantidade = 1;
				carrinho.push(item);
				resposta.sucesso = true;
				resposta.mensagem = "Produto adicionado";
			}
		} else {
			resposta.sucesso = false;
			resposta.mensagem = "Produto esgotado!";
		}
	} else {
		resposta.sucesso = false;
		resposta.mensagem = "Produto nao encontrado!";
	}

	responder(res, 200, resposta);
}

function diminuir(res, id) {
	var resposta = {};
	var posicao = -1;

	for (var i = 0; i < carrinho.length; i++) {
		if (carrinho[i].id == id) {
			posicao = i;
		}
	}

	if (posicao != -1) {
		if (carrinho[posicao].quantidade > 1) {
			carrinho[posicao].quantidade = carrinho[posicao].quantidade - 1;
		} else {
			carrinho.splice(posicao, 1);
		}
		resposta.sucesso = true;
	} else {
		resposta.sucesso = false;
		resposta.mensagem = "Item nao esta no carrinho";
	}

	responder(res, 200, resposta);
}

function remover(res, id) {
	var resposta = {};
	var removeu = false;

	for (var i = 0; i < carrinho.length; i++) {
		if (carrinho[i].id == id) {
			carrinho.splice(i, 1);
			removeu = true;
			break;
		}
	}

	resposta.sucesso = removeu;
	responder(res, 200, resposta);
}

function finalizar(res, dados) {
	var resposta = {};
	var nome = dados.nome;
	var email = dados.email;
	var endereco = dados.endereco;
	var cidade = dados.cidade;
	var uf = dados.uf;
	var cep = dados.cep;
	var pagamento = dados.pagamento;

	if (carrinho.length > 0) {
		if (nome != undefined && nome != "") {
			if (endereco != undefined && endereco != "") {

				var total = calcularTotal();

				// frete
				if (total < 299) {
					total = total + 15.90;
				}

				// desconto boleto
				if (pagamento == "boleto") {
					total = total - (total * 0.05);
				}

				// baixa o estoque
				for (var i = 0; i < carrinho.length; i++) {
					for (var j = 0; j < produtos.length; j++) {
						if (produtos[j].id == carrinho[i].id) {
							produtos[j].estoque = produtos[j].estoque - carrinho[i].quantidade;
							if (produtos[j].estoque < 0) {
								produtos[j].estoque = 0;
							}
						}
					}
				}

				contadorPedidos = contadorPedidos + 1;
				var dias = 3 + Math.floor(Math.random() * 5);

				var mensagem = "";
				if (pagamento == "boleto") {
					mensagem = "Seu pedido sera enviado para " + endereco + " - " + cidade + "/" + uf + " assim que o pagamento do boleto for confirmado. Prazo de entrega: " + dias + " dias uteis.";
				} else {
					mensagem = "Seu pedido sera enviado para " + endereco + " - " + cidade + "/" + uf + " em ate " + dias + " dias uteis. O pagamento sera feito na entrega.";
				}

				console.log("--- NOVO PEDIDO ---");
				console.log("numero: " + contadorPedidos);
				console.log("cliente: " + nome + " (" + email + ")");
				console.log("endereco: " + endereco + " - " + cidade + "/" + uf + " - CEP " + cep);
				console.log("pagamento: " + pagamento);
				console.log("itens: " + carrinho.length);
				console.log("total: " + total);
				console.log("-------------------");

				carrinho = new Array();

				resposta.sucesso = true;
				resposta.numeroPedido = contadorPedidos;
				resposta.total = total;
				resposta.mensagem = mensagem;
			} else {
				resposta.sucesso = false;
				resposta.mensagem = "Endereco nao informado";
			}
		} else {
			resposta.sucesso = false;
			resposta.mensagem = "Nome nao informado";
		}
	} else {
		resposta.sucesso = false;
		resposta.mensagem = "Seu carrinho esta vazio!";
	}

	responder(res, 200, resposta);
}


/* ===================== SERVIDOR ===================== */

var servidor = http.createServer(function(req, res) {
	var endereco = url.parse(req.url, true);
	var caminho = endereco.pathname;
	var id = parseInt(endereco.query.id);

	// o navegador as vezes pergunta antes de mandar o POST
	if (req.method == "OPTIONS") {
		responder(res, 200, {});
		return;
	}

	if (req.method == "GET") {
		if (caminho == "/produtos") {
			listarProdutos(res);
		} else if (caminho == "/carrinho") {
			verCarrinho(res);
		} else {
			responder(res, 404, { erro: "Pagina nao encontrada" });
		}
	} else if (req.method == "POST") {
		if (caminho == "/carrinho/adicionar") {
			adicionar(res, id);
		} else if (caminho == "/carrinho/diminuir") {
			diminuir(res, id);
		} else if (caminho == "/carrinho/remover") {
			remover(res, id);
		} else if (caminho == "/pedido/finalizar") {
			// junta os pedacos do corpo da requisicao
			var corpo = "";
			req.on("data", function(pedaco) {
				corpo = corpo + pedaco;
			});
			req.on("end", function() {
				var dados = querystring.parse(corpo);
				finalizar(res, dados);
			});
		} else {
			responder(res, 404, { erro: "Pagina nao encontrada" });
		}
	} else {
		responder(res, 405, { erro: "Metodo nao permitido" });
	}
});

servidor.listen(PORTA, function() {
	console.log("=====================================");
	console.log("  WEBSHOP API RODANDO NA PORTA " + PORTA + "  ");
	console.log("=====================================");
});
