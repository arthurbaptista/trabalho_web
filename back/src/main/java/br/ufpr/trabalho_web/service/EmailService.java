package br.ufpr.trabalho_web.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(ObjectProvider<JavaMailSender> mailSender) {
        this.mailSender = mailSender.getIfAvailable();
    }

    public boolean enviarSenhaCadastro(String destinatario, String senha) {
        log.info("Senha de autocadastro para {}: {}", destinatario, senha);

        if (mailSender == null) {
            log.warn("JavaMailSender nao configurado. A senha ficou apenas no log do servidor.");
            return false;
        }

        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setTo(destinatario);
            mensagem.setSubject("Sua senha de acesso - Manutencao de Equipamentos");
            mensagem.setText(
                    "Ola!\n\n"
                            + "Seu cadastro foi realizado com sucesso.\n"
                            + "Sua senha de acesso e: " + senha + "\n\n"
                            + "Use este e-mail e a senha para entrar no sistema."
            );
            mailSender.send(mensagem);
            return true;
        } catch (Exception e) {
            log.warn("Falha ao enviar e-mail de cadastro: {}", e.getMessage());
            return false;
        }
    }
}
