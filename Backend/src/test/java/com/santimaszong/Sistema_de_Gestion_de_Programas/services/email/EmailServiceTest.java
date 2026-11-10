package com.santimaszong.Sistema_de_Gestion_de_Programas.services.email;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.web.util.HtmlUtils;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class EmailServiceTest {
    private final EmailSender sender = mock(EmailSender.class);
    private final EmailService service = new EmailService(sender);
    private UsuarioDepartamentoEntity destinatario;
    private AreaEntity area;
    private ProgramaEntity programa;

    @BeforeEach
    void preparar() {
        UserEntity usuario = new UserEntity();
        usuario.setNombre("Ana");
        usuario.setApellido("Pérez");
        DepartamentoEntity departamento = new DepartamentoEntity();
        departamento.setNombre("Departamento sintético");
        destinatario = new UsuarioDepartamentoEntity();
        destinatario.setUsuario(usuario);
        destinatario.setEmail("destinatario@example.invalid");
        destinatario.setActivo(true);
        area = new AreaEntity();
        area.setNombre("Área sintética");
        area.setDepartamento(departamento);
        MateriaEntity materia = new MateriaEntity();
        materia.setNombre("Materia sintética");
        materia.setCodigo("MAT-1");
        materia.setDepartamento(departamento);
        materia.setArea(area);
        programa = new ProgramaEntity();
        programa.setMateria(materia);
        programa.setAnio(2026);
    }

    @Test
    void secretariaRecibeLasTareasDeCargaInicial() {
        service.sendEmailNotificacionCargaSecretariaInicial(destinatario, programa);
        assertThat(textoEnviado("Programa pendiente de carga de Secretaría inicial"))
                .contains("Ana Pérez", "Materia sintética", "MAT-1", "2026", "Departamento sintético",
                        "contenidos mínimos y bloques múltiples", "enviar el programa al docente", "justificación");
    }

    @Test
    void areaRecibeLasOpcionesDeRevisionSinPedirCargaDeCampos() {
        service.sendEmailNotificacionRevisionArea(destinatario, programa);
        assertThat(textoEnviado("Programa pendiente de revisión de Área"))
                .contains("Área sintética", "Materia sintética", "2026", "comisiones curriculares",
                        "Administración", "Secretaría inicial", "Docente", "justificación");
    }

    @Test
    void asignacionDeAreaInvitaAConsultarPendientes() {
        service.sendEmailAsignacionCoordinadorArea(destinatario, area);
        assertThat(textoEnviado("Asignación de Coordinación de Área - Área sintética"))
                .contains("Ana Pérez", "Área sintética", "Departamento sintético", "Mis áreas",
                        "programas pendientes de revisión");
    }

    @Test
    void remocionAclaraQuePuedeConservarOtrasAreas() {
        service.sendEmailRemocionCoordinadorArea(destinatario, area);
        assertThat(textoEnviado("Remoción de Coordinación de Área - Área sintética"))
                .contains("Área sintética", "ha dejado de desempeñar", "Si coordina otras áreas",
                        "conserva las funciones");
    }

    @Test
    void nuevosMensajesPresentanLosDatosComoTextoYNoComoHtml() {
        destinatario.getUsuario().setNombre("<b>Ana</b>");
        area.setNombre("Área <script>ejemplo</script>");
        service.sendEmailNotificacionRevisionArea(destinatario, programa);
        assertThat(cuerpoEnviado("Programa pendiente de revisión de Área"))
                .contains("&lt;b&gt;Ana&lt;/b&gt;", "&Aacute;rea &lt;script&gt;ejemplo&lt;/script&gt;")
                .doesNotContain("<b>Ana</b>", "<script>");
    }

    @Test
    void conservaLaValidacionDeResponsableAntesDeEnviar() {
        assertThatThrownBy(() -> service.sendEmailNotificacionCargaSecretariaInicial(null, programa))
                .isInstanceOf(IllegalStateException.class);
        destinatario.setActivo(false);
        assertThatThrownBy(() -> service.sendEmailNotificacionRevisionArea(destinatario, programa))
                .isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(sender);
    }

    private String textoEnviado(String asunto) {
        return HtmlUtils.htmlUnescape(cuerpoEnviado(asunto));
    }

    private String cuerpoEnviado(String asunto) {
        ArgumentCaptor<String> cuerpo = ArgumentCaptor.forClass(String.class);
        verify(sender).sendHtmlEmail(eq("destinatario@example.invalid"), eq(asunto), cuerpo.capture());
        verifyNoMoreInteractions(sender);
        assertThat(cuerpo.getValue()).contains("Acceder al Sistema", "Mensaje generado automáticamente");
        return cuerpo.getValue();
    }
}
