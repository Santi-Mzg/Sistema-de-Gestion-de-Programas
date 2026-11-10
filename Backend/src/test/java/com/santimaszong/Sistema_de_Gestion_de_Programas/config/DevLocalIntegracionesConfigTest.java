package com.santimaszong.Sistema_de_Gestion_de_Programas.config;

import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.BibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.providers.GeminiBibliografiaFormatterService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailSender;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.providers.ResendEmailSender;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DevLocalIntegracionesConfigTest {
    private final ApplicationContextRunner runner = new ApplicationContextRunner()
            .withUserConfiguration(DevLocalIntegracionesConfig.class,
                    ResendEmailSender.class, GeminiBibliografiaFormatterService.class);

    @Test
    void perfilLocalNoNecesitaCredencialesNiCreaClientesExternos() {
        runner.withPropertyValues("spring.profiles.active=dev-local").run(context -> {
            assertThat(context).hasNotFailed()
                    .hasSingleBean(EmailSender.class)
                    .hasSingleBean(BibliografiaFormatterService.class)
                    .doesNotHaveBean(ResendEmailSender.class)
                    .doesNotHaveBean(GeminiBibliografiaFormatterService.class);
            assertThatCode(() -> context.getBean(EmailSender.class)
                    .sendHtmlEmail("destinatario@example.invalid", "Prueba", "Contenido sintético"))
                    .doesNotThrowAnyException();
            assertThatThrownBy(() -> context.getBean(BibliografiaFormatterService.class).formatearAPA("Texto sintético"))
                    .isInstanceOf(ValidacionProgramaException.class)
                    .hasMessageContaining("deshabilitado en desarrollo local");
        });
    }

    @Test
    void sinPerfilLocalSeConservanLosProveedoresOriginales() {
        runner.withPropertyValues("resend.api.key=placeholder-sin-acceso", "resend.from.email=prueba@example.invalid",
                "gemini.api.key=placeholder-sin-acceso").run(context -> {
            assertThat(context).hasNotFailed()
                    .hasSingleBean(EmailSender.class)
                    .hasSingleBean(BibliografiaFormatterService.class)
                    .doesNotHaveBean(DevLocalIntegracionesConfig.class);
            assertThat(context.getBean(EmailSender.class)).isInstanceOf(ResendEmailSender.class);
            assertThat(context.getBean(BibliografiaFormatterService.class)).isInstanceOf(GeminiBibliografiaFormatterService.class);
            // Se comprueba selección de beans; no se invocan servicios externos.
        });
    }
}
