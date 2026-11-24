package br.com.webshop;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Random;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// controller que faz tudo da loja
@RestController
@CrossOrigin(origins = "*")
public class LojaController {

	// "banco de dados" na memoria
	public static ArrayList<Produto> produtos = new ArrayList<Produto>();
	public static ArrayList<ItemCarrinho> carrinho = new ArrayList<ItemCarrinho>();
	public static int contadorPedidos = 1000;

	static {
		produtos.add(new Produto(1, "Notebook 14\" Core 2 Duo 2GB HD 320GB", 1899.00, 2199.00, "notebook.svg", 5, true));
		produtos.add(new Produto(2, "TV LCD 32\" HD com conversor digital", 1499.00, 0, "tv.svg", 3, false));
		produtos.add(new Produto(3, "Celular Dual Chip Camera 2.0MP MP3", 299.00, 349.00, "celular.svg", 10, true));
		produtos.add(new Produto(4, "MP4 Player 4GB com Radio FM", 129.90, 0, "mp4.svg", 20, false));
		produtos.add(new Produto(5, "Camera Digital 12MP Zoom Optico 4x", 549.00, 0, "camera.svg", 7, false));
		produtos.add(new Produto(6, "Monitor LCD 18.5\" Widescreen", 449.00, 499.00, "monitor.svg", 4, true));
		produtos.add(new Produto(7, "GPS Automotivo Tela 4.3\" com TTS", 399.00, 0, "gps.svg", 6, false));
		produtos.add(new Produto(8, "Pen Drive 4GB USB 2.0", 39.90, 0, "pendrive.svg", 50, false));
		produtos.add(new Produto(9, "Webcam 1.3MP com Microfone", 59.90, 0, "webcam.svg", 0, false));
		produtos.add(new Produto(10, "Mouse Optico USB 800dpi", 24.90, 0, "mouse.svg", 30, false));
		produtos.add(new Produto(11, "Pen Drive 8GB USB 2.0", 69.90, 79.90, "pendrive.svg", 15, false));
		produtos.add(new Produto(12, "Celular Flip Bluetooth Camera VGA", 199.00, 0, "celular.svg", 8, false));
	}

	@GetMapping("/produtos")
	public ArrayList<Produto> listarProdutos() {
		System.out.println("listando produtos... total: " + produtos.size());
		return produtos;
	}

	@GetMapping("/carrinho")
	public HashMap<String, Object> verCarrinho() {
		HashMap<String, Object> resposta = new HashMap<String, Object>();
		double total = 0;
		for (int i = 0; i < carrinho.size(); i++) {
			total = total + (carrinho.get(i).preco * carrinho.get(i).quantidade);
		}
		resposta.put("itens", carrinho);
		resposta.put("total", total);
		return resposta;
	}

	@PostMapping("/carrinho/adicionar")
	public HashMap<String, Object> adicionar(@RequestParam("id") int id) {
		HashMap<String, Object> resposta = new HashMap<String, Object>();
		System.out.println("adicionando produto " + id);

		// procura o produto
		Produto produto = null;
		for (int i = 0; i < produtos.size(); i++) {
			if (produtos.get(i).id == id) {
				produto = produtos.get(i);
			}
		}

		if (produto != null) {
			if (produto.estoque > 0) {
				// ve se ja esta no carrinho
				boolean achou = false;
				for (int i = 0; i < carrinho.size(); i++) {
					if (carrinho.get(i).id == id) {
						achou = true;
						if (carrinho.get(i).quantidade < produto.estoque) {
							carrinho.get(i).quantidade = carrinho.get(i).quantidade + 1;
							resposta.put("sucesso", true);
							resposta.put("mensagem", "Quantidade atualizada");
						} else {
							resposta.put("sucesso", false);
							resposta.put("mensagem", "Desculpe, so temos " + produto.estoque + " unidade(s) deste produto em estoque.");
						}
					}
				}

				if (achou == false) {
					ItemCarrinho item = new ItemCarrinho();
					item.id = produto.id;
					item.nome = produto.nome;
					item.preco = produto.preco;
					item.imagem = produto.imagem;
					item.quantidade = 1;
					carrinho.add(item);
					resposta.put("sucesso", true);
					resposta.put("mensagem", "Produto adicionado");
				}
			} else {
				resposta.put("sucesso", false);
				resposta.put("mensagem", "Produto esgotado!");
			}
		} else {
			resposta.put("sucesso", false);
			resposta.put("mensagem", "Produto nao encontrado!");
		}

		return resposta;
	}

	@PostMapping("/carrinho/diminuir")
	public HashMap<String, Object> diminuir(@RequestParam("id") int id) {
		HashMap<String, Object> resposta = new HashMap<String, Object>();
		int posicao = -1;

		for (int i = 0; i < carrinho.size(); i++) {
			if (carrinho.get(i).id == id) {
				posicao = i;
			}
		}

		if (posicao != -1) {
			if (carrinho.get(posicao).quantidade > 1) {
				carrinho.get(posicao).quantidade = carrinho.get(posicao).quantidade - 1;
			} else {
				carrinho.remove(posicao);
			}
			resposta.put("sucesso", true);
		} else {
			resposta.put("sucesso", false);
			resposta.put("mensagem", "Item nao esta no carrinho");
		}

		return resposta;
	}

	@PostMapping("/carrinho/remover")
	public HashMap<String, Object> remover(@RequestParam("id") int id) {
		HashMap<String, Object> resposta = new HashMap<String, Object>();
		boolean removeu = false;

		for (int i = 0; i < carrinho.size(); i++) {
			if (carrinho.get(i).id == id) {
				carrinho.remove(i);
				removeu = true;
				break;
			}
		}

		resposta.put("sucesso", removeu);
		return resposta;
	}

	@PostMapping("/pedido/finalizar")
	public HashMap<String, Object> finalizar(@RequestParam("nome") String nome,
			@RequestParam("email") String email,
			@RequestParam("endereco") String endereco,
			@RequestParam("cidade") String cidade,
			@RequestParam("uf") String uf,
			@RequestParam("cep") String cep,
			@RequestParam("pagamento") String pagamento) {

		HashMap<String, Object> resposta = new HashMap<String, Object>();

		if (carrinho.size() > 0) {
			if (nome != null && !nome.equals("")) {
				if (endereco != null && !endereco.equals("")) {

					// calcula o total
					double total = 0;
					for (int i = 0; i < carrinho.size(); i++) {
						total = total + (carrinho.get(i).preco * carrinho.get(i).quantidade);
					}

					// frete
					if (total < 299) {
						total = total + 15.90;
					}

					// desconto boleto
					if (pagamento.equals("boleto")) {
						total = total - (total * 0.05);
					}

					// baixa o estoque
					for (int i = 0; i < carrinho.size(); i++) {
						for (int j = 0; j < produtos.size(); j++) {
							if (produtos.get(j).id == carrinho.get(i).id) {
								produtos.get(j).estoque = produtos.get(j).estoque - carrinho.get(i).quantidade;
								if (produtos.get(j).estoque < 0) {
									produtos.get(j).estoque = 0;
								}
							}
						}
					}

					contadorPedidos = contadorPedidos + 1;
					Random r = new Random();
					int dias = 3 + r.nextInt(5);

					String mensagem = "";
					if (pagamento.equals("boleto")) {
						mensagem = "Seu pedido sera enviado para " + endereco + " - " + cidade + "/" + uf + " assim que o pagamento do boleto for confirmado. Prazo de entrega: " + dias + " dias uteis.";
					} else {
						mensagem = "Seu pedido sera enviado para " + endereco + " - " + cidade + "/" + uf + " em ate " + dias + " dias uteis. O pagamento sera feito na entrega.";
					}

					System.out.println("--- NOVO PEDIDO ---");
					System.out.println("numero: " + contadorPedidos);
					System.out.println("cliente: " + nome + " (" + email + ")");
					System.out.println("endereco: " + endereco + " - " + cidade + "/" + uf + " - CEP " + cep);
					System.out.println("pagamento: " + pagamento);
					System.out.println("itens: " + carrinho.size());
					System.out.println("total: " + total);
					System.out.println("-------------------");

					carrinho.clear();

					resposta.put("sucesso", true);
					resposta.put("numeroPedido", contadorPedidos);
					resposta.put("total", total);
					resposta.put("mensagem", mensagem);
				} else {
					resposta.put("sucesso", false);
					resposta.put("mensagem", "Endereco nao informado");
				}
			} else {
				resposta.put("sucesso", false);
				resposta.put("mensagem", "Nome nao informado");
			}
		} else {
			resposta.put("sucesso", false);
			resposta.put("mensagem", "Seu carrinho esta vazio!");
		}

		return resposta;
	}

}
