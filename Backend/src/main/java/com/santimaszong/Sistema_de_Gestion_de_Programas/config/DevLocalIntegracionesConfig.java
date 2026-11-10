package com.santimaszong.Sistema_de_Gestion_de_Programas.config;

import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.BibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailSender;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration(proxyBeanMethods = false)
@Profile("dev-local")
public class DevLocalIntegracionesConfig {
    private static final Logger log = LoggerFactory.getLogger(DevLocalIntegracionesConfig.class);

    @Bean
    EmailSender emailSenderLocal() {
        // No registrar destinatarios, cuerpos, enlaces ni tokens de invitación.
        return (to, subject, htmlBody) -> log.info("DEV LOCAL: correo simulado, sin envío externo");
    }

    @Bean
    BibliografiaFormatterService bibliografiaFormatterLocal() {
        return texto -> {
            throw new ValidacionProgramaException("El formato APA con IA está deshabilitado en desarrollo local.");
        };
    }
}
