/*
 * WebShop Eletronicos - script principal
 * versao 1.3 - 2010
 */

// endereco do servidor da api
var URL_API = "http://localhost:8080";

var listaProdutos = new Array();
var itensCarrinho = new Array();
var totalCarrinho = 0;

// cria o objeto ajax (funciona no IE tambem)
function criarAjax() {
	var xmlhttp;
	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	return xmlhttp;
}

// formata o preco para o padrao brasileiro
function formatarPreco(valor) {
	var texto = valor.toFixed(2);
	var partes = texto.split(".");
	var inteiro = partes[0];
	var centavos = partes[1];
	var resultado = "";
	var cont = 0;

	// coloca os pontos de milhar
	for (var i = inteiro.length - 1; i >= 0; i--) {
		resultado = inteiro.charAt(i) + resultado;
		cont++;
		if (cont == 3) {
			if (i > 0) {
				resultado = "." + resultado;
			}
			cont = 0;
		}
	}

	return "R$ " + resultado + "," + centavos;
}

/* ===================== PAGINA INICIAL ===================== */

function carregarProdutos() {
	var ajax = criarAjax();
	ajax.open("GET", URL_API + "/produtos", true);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				listaProdutos = eval("(" + ajax.responseText + ")");
				mostrarProdutos();
			} else {
				document.getElementById("lista-produtos").innerHTML = "<p class='erro'>Nao foi possivel carregar os produtos. Verifique se o servidor esta ligado.</p>";
			}
		}
	}
	ajax.send(null);
}

function mostrarProdutos() {
	var html = "";

	for (var i = 0; i < listaProdutos.length; i++) {
		var p = listaProdutos[i];

		html = html + "<div class='produto'>";

		if (p.promocao == true) {
			html = html + "<div class='selo'>OFERTA</div>";
		}

		html = html + "<div class='foto'><img src='imagens/" + p.imagem + "' alt='" + p.nome + "' width='160' height='120' /></div>";
		html = html + "<div class='nome'>" + p.nome + "</div>";

		if (p.precoAntigo > 0) {
			html = html + "<div class='preco-antigo'>de " + formatarPreco(p.precoAntigo) + "</div>";
			html = html + "<div class='preco'>por " + formatarPreco(p.preco) + "</div>";
		} else {
			html = html + "<div class='preco-antigo'>&nbsp;</div>";
			html = html + "<div class='preco'>" + formatarPreco(p.preco) + "</div>";
		}

		var parcela = p.preco / 10;
		html = html + "<div class='parcela'>ou 10x de " + formatarPreco(parcela) + "</div>";

		if (p.estoque > 0) {
			html = html + "<input type='button' class='botao botao-laranja' value='Adicionar ao Carrinho' onclick='adicionarCarrinho(" + p.id + ")' />";
		} else {
			html = html + "<input type='button' class='botao botao-cinza' value='Esgotado' disabled='disabled' />";
		}

		html = html + "</div>";
	}

	if (listaProdutos.length == 0) {
		html = "<p>Nenhum produto cadastrado.</p>";
	}

	document.getElementById("lista-produtos").innerHTML = html;
}

function adicionarCarrinho(id) {
	var ajax = criarAjax();
	ajax.open("POST", URL_API + "/carrinho/adicionar?id=" + id, true);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				var resposta = eval("(" + ajax.responseText + ")");
				if (resposta.sucesso == true) {
					alert("Produto adicionado ao carrinho!");
					atualizarContador();
				} else {
					alert(resposta.mensagem);
				}
			} else {
				alert("Erro ao adicionar produto. Tente novamente.");
			}
		}
	}
	ajax.send(null);
}

// atualiza o numero que aparece no topo
function atualizarContador() {
	var ajax = criarAjax();
	ajax.open("GET", URL_API + "/carrinho", true);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				var dados = eval("(" + ajax.responseText + ")");
				var qtd = 0;
				for (var i = 0; i < dados.itens.length; i++) {
					qtd = qtd + dados.itens[i].quantidade;
				}
				document.getElementById("contador").innerHTML = qtd;
			}
		}
	}
	ajax.send(null);
}

/* ===================== CARRINHO ===================== */

function carregarCarrinho() {
	var ajax = criarAjax();
	ajax.open("GET", URL_API + "/carrinho", true);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				var dados = eval("(" + ajax.responseText + ")");
				itensCarrinho = dados.itens;
				totalCarrinho = dados.total;
				mostrarCarrinho();
			} else {
				document.getElementById("area-carrinho").innerHTML = "<p class='erro'>Nao foi possivel carregar o carrinho. Verifique se o servidor esta ligado.</p>";
			}
		}
	}
	ajax.send(null);
}

function mostrarCarrinho() {
	var html = "";

	if (itensCarrinho.length == 0) {
		html = "<div class='carrinho-vazio'>";
		html = html + "<p>Seu carrinho esta vazio.</p>";
		html = html + "<input type='button' class='botao botao-laranja' value='Ver Produtos' onclick=\"window.location='index.html'\" />";
		html = html + "</div>";
		document.getElementById("area-carrinho").innerHTML = html;
		document.getElementById("area-dados").style.display = "none";
		return;
	}

	html = html + "<table class='tabela-carrinho' cellpadding='0' cellspacing='0' width='100%'>";
	html = html + "<tr>";
	html = html + "<th colspan='2'>Produto</th>";
	html = html + "<th>Quantidade</th>";
	html = html + "<th>Preco Unit.</th>";
	html = html + "<th>Subtotal</th>";
	html = html + "<th>&nbsp;</th>";
	html = html + "</tr>";

	for (var i = 0; i < itensCarrinho.length; i++) {
		var item = itensCarrinho[i];
		var subtotal = item.preco * item.quantidade;
		var classe = "";
		if (i % 2 == 1) {
			classe = "linha-par";
		}

		html = html + "<tr class='" + classe + "'>";
		html = html + "<td width='70'><img src='imagens/" + item.imagem + "' width='60' height='45' alt='' /></td>";
		html = html + "<td>" + item.nome + "</td>";
		html = html + "<td align='center'>";
		html = html + "<input type='button' class='botao-qtd' value='-' onclick='diminuirItem(" + item.id + ")' />";
		html = html + " <b>" + item.quantidade + "</b> ";
		html = html + "<input type='button' class='botao-qtd' value='+' onclick='aumentarItem(" + item.id + ")' />";
		html = html + "</td>";
		html = html + "<td align='right'>" + formatarPreco(item.preco) + "</td>";
		html = html + "<td align='right'><b>" + formatarPreco(subtotal) + "</b></td>";
		html = html + "<td align='center'><a href='#' class='remover' onclick='removerItem(" + item.id + "); return false;'>remover</a></td>";
		html = html + "</tr>";
	}

	html = html + "</table>";

	// calculo do frete
	var frete = 0;
	if (totalCarrinho < 299) {
		frete = 15.90;
	}

	html = html + "<div class='totais'>";
	html = html + "<p>Subtotal: " + formatarPreco(totalCarrinho) + "</p>";
	if (frete > 0) {
		html = html + "<p>Frete: " + formatarPreco(frete) + "</p>";
	} else {
		html = html + "<p class='frete-gratis'>Frete: GRATIS!</p>";
	}
	html = html + "<p class='total'>Total: " + formatarPreco(totalCarrinho + frete) + "</p>";
	html = html + "<p class='parcela'>ou 10x de " + formatarPreco((totalCarrinho + frete) / 10) + " sem juros</p>";
	html = html + "</div>";
	html = html + "<div class='clear'></div>";

	document.getElementById("area-carrinho").innerHTML = html;
	document.getElementById("area-dados").style.display = "block";
}

function aumentarItem(id) {
	var ajax = criarAjax();
	ajax.open("POST", URL_API + "/carrinho/adicionar?id=" + id, true);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				var resposta = eval("(" + ajax.responseText + ")");
				if (resposta.sucesso == false) {
					alert(resposta.mensagem);
				}
				carregarCarrinho();
				atualizarContador();
			}
		}
	}
	ajax.send(null);
}

function diminuirItem(id) {
	var ajax = criarAjax();
	ajax.open("POST", URL_API + "/carrinho/diminuir?id=" + id, true);
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				carregarCarrinho();
				atualizarContador();
			}
		}
	}
	ajax.send(null);
}

function removerItem(id) {
	if (confirm("Deseja mesmo remover este produto do carrinho?")) {
		var ajax = criarAjax();
		ajax.open("POST", URL_API + "/carrinho/remover?id=" + id, true);
		ajax.onreadystatechange = function() {
			if (ajax.readyState == 4) {
				if (ajax.status == 200) {
					carregarCarrinho();
					atualizarContador();
				} else {
					alert("Erro ao remover o produto.");
				}
			}
		}
		ajax.send(null);
	}
}

/* ===================== FINALIZAR ===================== */

function finalizarPedido() {
	var nome = document.getElementById("nome").value;
	var email = document.getElementById("email").value;
	var endereco = document.getElementById("endereco").value;
	var cidade = document.getElementById("cidade").value;
	var uf = document.getElementById("uf").value;
	var cep = document.getElementById("cep").value;
	var pagamento = "boleto";

	if (document.getElementById("pag-cartao").checked) {
		pagamento = "cartao";
	}

	// validacao dos campos
	if (nome != "") {
		if (email != "") {
			if (email.indexOf("@") > 0 && email.indexOf(".") > 0) {
				if (endereco != "") {
					if (cidade != "") {
						if (uf != "") {
							if (cep != "") {
								if (cep.length >= 8) {
									enviarPedido(nome, email, endereco, cidade, uf, cep, pagamento);
								} else {
									alert("CEP invalido!");
									document.getElementById("cep").focus();
								}
							} else {
								alert("Preencha o CEP!");
								document.getElementById("cep").focus();
							}
						} else {
							alert("Selecione o estado (UF)!");
							document.getElementById("uf").focus();
						}
					} else {
						alert("Preencha a cidade!");
						document.getElementById("cidade").focus();
					}
				} else {
					alert("Preencha o endereco!");
					document.getElementById("endereco").focus();
				}
			} else {
				alert("E-mail invalido!");
				document.getElementById("email").focus();
			}
		} else {
			alert("Preencha o e-mail!");
			document.getElementById("email").focus();
		}
	} else {
		alert("Preencha o nome!");
		document.getElementById("nome").focus();
	}
}

function enviarPedido(nome, email, endereco, cidade, uf, cep, pagamento) {
	var parametros = "nome=" + encodeURIComponent(nome);
	parametros = parametros + "&email=" + encodeURIComponent(email);
	parametros = parametros + "&endereco=" + encodeURIComponent(endereco);
	parametros = parametros + "&cidade=" + encodeURIComponent(cidade);
	parametros = parametros + "&uf=" + encodeURIComponent(uf);
	parametros = parametros + "&cep=" + encodeURIComponent(cep);
	parametros = parametros + "&pagamento=" + pagamento;

	var ajax = criarAjax();
	ajax.open("POST", URL_API + "/pedido/finalizar", true);
	ajax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	ajax.onreadystatechange = function() {
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				var resposta = eval("(" + ajax.responseText + ")");
				if (resposta.sucesso == true) {
					var msg = "<h3>Pedido realizado com sucesso!</h3>";
					msg = msg + "<p>Obrigado pela sua compra, <b>" + nome + "</b>!</p>";
					msg = msg + "<p>Numero do pedido: <b>" + resposta.numeroPedido + "</b></p>";
					msg = msg + "<p>" + resposta.mensagem + "</p>";
					msg = msg + "<p>Valor total: <b>" + formatarPreco(resposta.total) + "</b></p>";
					msg = msg + "<p><a href='index.html'>&laquo; Voltar para a loja</a></p>";

					document.getElementById("mensagem-pedido").innerHTML = msg;
					document.getElementById("mensagem-pedido").style.display = "block";
					document.getElementById("area-carrinho").innerHTML = "";
					document.getElementById("area-dados").style.display = "none";
					document.getElementById("contador").innerHTML = "0";
					window.scrollTo(0, 0);
				} else {
					alert(resposta.mensagem);
				}
			} else {
				alert("Erro ao finalizar o pedido. Tente novamente mais tarde.");
			}
		}
	}
	ajax.send(parametros);
}
