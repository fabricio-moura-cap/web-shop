package br.com.webshop;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebshopApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebshopApplication.class, args);
		System.out.println("=====================================");
		System.out.println("  WEBSHOP API RODANDO NA PORTA 8080  ");
		System.out.println("=====================================");
	}

}
