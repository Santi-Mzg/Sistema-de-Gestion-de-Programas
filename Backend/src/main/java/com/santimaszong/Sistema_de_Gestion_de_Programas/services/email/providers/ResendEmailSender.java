package com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.providers;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailSender;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class ResendEmailSender implements EmailSender {

    private final Resend resend;
    private final String fromEmail;

    public ResendEmailSender(
            @Value("${resend.api.key}") String apiKey,
            @Value("${resend.from.email}") String fromEmail
    ) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    @Override
    public void sendHtmlEmail(String to, String subject, String htmlBody){

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(to)
                .subject(subject)
                .html(htmlBody)
                .build();

        try {
            resend.emails().send(params);

        } catch (ResendException e) {
            throw new RuntimeException("Error enviando email con Resend", e);
        }
    }
}