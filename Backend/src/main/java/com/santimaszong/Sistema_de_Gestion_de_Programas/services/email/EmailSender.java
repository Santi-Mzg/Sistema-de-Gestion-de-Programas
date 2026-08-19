package com.santimaszong.Sistema_de_Gestion_de_Programas.services.email;

public interface EmailSender {

    void sendHtmlEmail(
            String to,
            String subject,
            String htmlBody
    );
}