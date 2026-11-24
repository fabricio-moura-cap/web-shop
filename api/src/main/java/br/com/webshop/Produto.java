package br.com.webshop;

public class Produto {

	public int id;
	public String nome;
	public double preco;
	public double precoAntigo;
	public String imagem;
	public int estoque;
	public boolean promocao;

	public Produto() {
	}

	public Produto(int id, String nome, double preco, double precoAntigo, String imagem, int estoque, boolean promocao) {
		this.id = id;
		this.nome = nome;
		this.preco = preco;
		this.precoAntigo = precoAntigo;
		this.imagem = imagem;
		this.estoque = estoque;
		this.promocao = promocao;
	}

}
