package com.santimaszong.Sistema_de_Gestion_de_Programas.services.email;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
public class EmailService {

    private final EmailSender emailSender;

    public EmailService(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    public void sendEmailNotificacionCargaSecretariaInicial(
            UsuarioDepartamentoEntity destinatario, ProgramaEntity programa) {
        exigirResponsableActivo(destinatario, "Secretaría inicial");
        String contenido = "<p>Administración ha completado la información inicial del programa.</p>"
                + resumenPrograma(programa)
                + "<p>Ingrese con el rol de <strong>Secretaría Académica</strong> para revisar los datos "
                + "de Administración, completar los <strong>contenidos mínimos y bloques múltiples</strong> "
                + "y enviar el programa al docente responsable. Si necesita una corrección de Administración, "
                + "puede devolverlo con la justificación correspondiente.</p>";
        emailSender.sendHtmlEmail(destinatario.getEmail(), "Programa pendiente de carga de Secretaría inicial",
                mensajeCircuito("Carga inicial de Secretaría Académica", destinatario.getUsuario(), contenido));
    }

    public void sendEmailNotificacionRevisionArea(
            UsuarioDepartamentoEntity destinatario, ProgramaEntity programa) {
        exigirResponsableActivo(destinatario, "Coordinación de Área");
        String contenido = "<p>El docente responsable ha completado la carga del programa, "
                + "que requiere su revisión como <strong>Coordinador de Área</strong>.</p>"
                + resumenPrograma(programa)
                + "<p><strong>Área:</strong> " + textoHtml(programa.getMateria().getArea().getNombre()) + "</p>"
                + "<p>Seleccione el departamento y el rol de Coordinador de Área y revise sus pendientes. "
                + "Puede aceptar para enviarlo a las comisiones curriculares o devolverlo a Administración, "
                + "Secretaría inicial o Docente, indicando una justificación.</p>";
        emailSender.sendHtmlEmail(destinatario.getEmail(), "Programa pendiente de revisión de Área",
                mensajeCircuito("Revisión de Coordinación de Área", destinatario.getUsuario(), contenido));
    }

    public void sendEmailAsignacionCoordinadorArea(UsuarioDepartamentoEntity destinatario, AreaEntity area) {
        String contenido = "<p>Se le ha asignado el cargo de <strong>Coordinador de Área</strong>.</p>"
                + resumenArea(area)
                + "<p>Seleccione el departamento y el rol de Coordinador de Área para acceder a "
                + "<strong>Mis áreas</strong>. Revise sus <strong>programas pendientes de revisión</strong>: "
                + "puede haber programas esperando su intervención.</p>";
        emailSender.sendHtmlEmail(destinatario.getEmail(), "Asignación de Coordinación de Área - " + area.getNombre(),
                mensajeCircuito("Asignación de Coordinación de Área", destinatario.getUsuario(), contenido));
    }

    public void sendEmailRemocionCoordinadorArea(UsuarioDepartamentoEntity destinatario, AreaEntity area) {
        String contenido = "<p>Se le informa que ha dejado de desempeñar el cargo de "
                + "<strong>Coordinador de Área</strong> en el área indicada.</p>"
                + resumenArea(area)
                + "<p>Ya no tiene las funciones de coordinación de esta área. "
                + "Si coordina otras áreas, conserva las funciones correspondientes a esas asignaciones.</p>";
        emailSender.sendHtmlEmail(destinatario.getEmail(), "Remoción de Coordinación de Área - " + area.getNombre(),
                mensajeCircuito("Actualización de Coordinación de Área", destinatario.getUsuario(), contenido));
    }

    private void exigirResponsableActivo(UsuarioDepartamentoEntity destinatario, String etapa) {
        if (destinatario == null || !destinatario.isActivo()) {
            throw new IllegalStateException("Debe asignar un responsable activo de " + etapa);
        }
    }

    private String resumenPrograma(ProgramaEntity programa) {
        return "<div style='background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>"
                + "<p><strong>Materia:</strong> " + textoHtml(programa.getMateria().getNombre())
                + " (" + textoHtml(programa.getMateria().getCodigo()) + ")</p>"
                + "<p><strong>Año académico:</strong> " + programa.getAnio() + "</p>"
                + "<p><strong>Departamento:</strong> "
                + textoHtml(programa.getMateria().getDepartamento().getNombre()) + "</p></div>";
    }

    private String resumenArea(AreaEntity area) {
        return "<div style='background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>"
                + "<p><strong>Área:</strong> " + textoHtml(area.getNombre()) + "</p>"
                + "<p><strong>Departamento:</strong> " + textoHtml(area.getDepartamento().getNombre()) + "</p></div>";
    }

    private String mensajeCircuito(String titulo, UserEntity destinatario, String contenido) {
        return "<div style='font-family: sans-serif; padding: 20px; color: #333;'>"
                + "<h2 style='color: #2563eb;'>" + textoHtml(titulo) + "</h2>"
                + "<p>Hola <strong>" + textoHtml(destinatario.getNombre()) + " "
                + textoHtml(destinatario.getApellido()) + "</strong>,</p>"
                + contenido
                + "<div style='margin-top: 25px;'>"
                + "<a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' "
                + "style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>"
                + "Acceder al Sistema</a></div>"
                + "<hr style='border: 0; border-top: 1px solid #eee; margin-top: 25px;' />"
                + "<p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p></div>";
    }

    private String textoHtml(String valor) {
        return HtmlUtils.htmlEscape(valor == null ? "" : valor);
    }

    // EMAILS SERVICES
    @Async
    public void sendEmailNuevoUsuario(String destinatario, String rawToken) {
        String htmlTemplate = String.format(
                    "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                            "  <h2 style='color: #2563eb;'>Estimado/a,</h2>" +
                            "  <p>Se ha creado una cuenta para ti en el <strong>Sistema de Gestión de Programas</strong>.</p>" +
                            "  <p>Para configurar tus credenciales haz click en el siguiente link de acceso:</p>" +
                            "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;'>" +
                            "    <p style='margin: 5px 0 0 0;'><strong>Link:</strong> <code style='background:#fff; padding:2px 5px;'>{{link}}</code></p>" +
                            "  </div>" +
                            "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                            "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                            "</div>"
        );

        String htmlBody = htmlTemplate.replace("{{link}}", "https://sistema-de-gestion-de-programas-fro.vercel.app/set-password?token="+rawToken);

        emailSender.sendHtmlEmail(destinatario, "Bienvenido a Sílabus-UNS", htmlBody);
    }


    @Async
    public void sendEmailNuevoDepartamento(String destinatario, String departamentoName) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                            "  <h2 style='color: #2563eb;'>Estimado/a,</h2>" +
                            "  <p>Se ha agregado a su cuenta acceso a un nuevo departamento en el <strong>Sistema de Gestión de Programas</strong>.</p>" +
                            "  <p>Tiene acceso al departamento:</p>" +
                            "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;'>" +
                            "    <p style='margin: 0;'><strong>Departamento:</strong> %s</p>" +
                            "  </div>" +
                            "  <div style='margin-top: 25px;'>" +
                            "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                            "  </div>" +
                            "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                            "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                            "</div>",
                departamentoName
        );
        emailSender.sendHtmlEmail(destinatario, "Nuevo acceso a departamento", htmlBody);
    }

    @Async
    public void sendEmailRecuperarPassword(String destinatario, String rawToken) {
        String htmlTemplate =
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #2563eb;'>Recuperación de Contraseña</h2>" +
                        "  <p>Estimado/a,</p>" +
                        "  <p>Ha solicitado restablecer tu contraseña.</p>" +
                        "  <p>Se ha generado una link de recuperación de contraseña:</p>" +
                        "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;'>" +
                        "    <p style='margin: 5px 0 0 0;'><strong>Link:</strong> <code style='background:#fff; padding:2px 5px;'>{{link}}</code></p>" +
                        "  </div>" +
                        "  <hr style='border: 0; border-top: 1px solid #eee; margin-top: 30px;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Si no solicitaste este cambio, te recomendamos cambiar tu contraseña manualmente en el sistema.</p>" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                        "  </div>" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                        "</div>";

        String htmlBody = htmlTemplate.replace("{{link}}", "https://sistema-de-gestion-de-programas-fro.vercel.app/set-password?token="+rawToken);

        emailSender.sendHtmlEmail(destinatario, "Cambio de contraseña - Sílabus UNS", htmlBody);
    }


    @Async
    public void sendEmailNotificacionCargaAdministrativo(
            String destinatario,
            UserEntity docente,
            MateriaEntity materia
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #2563eb;'>Gestión de Programas</h2>" +
                        "  <p>Hola <strong>%s</strong> <strong>%s</strong>,</p>" +
                        "  <p>Le informamos que tiene acciones pendientes como <strong>Docente Responsable</strong> del programa para la materia:</p>" +
                        "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>Materia:</strong> %s (%s)</p>" +
                        "  </div>" +
                        "  <p>Ya puede ingresar al sistema para revisar los contenidos y cargar la información correspondiente.</p>" +
                        "  <br />" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                        "  </div>" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                docente.getNombre(), docente.getApellido(), materia.getNombre(), materia.getCodigo()
        );

        emailSender.sendHtmlEmail(
                destinatario,
                "Nuevo Programa Cargado - " + materia.getNombre(),
                htmlBody
        );
    }

    @Async
    public void sendEmailNotificacionCargaDocente(
            String destinatario,
            ProgramaEntity programa,
            CarreraEntity carrera
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #2563eb;'>Gestión de Programas - Nueva Revisión</h2>" +
                        "  <p>Estimado/a coordinador/a de la Comisión Curricular de la carrera <strong>%s<strong>,</p>" +
                        "  <p>Se les informa que el docente responsable ha finalizado la carga del programa para la materia:</p>" +
                        "  <div style='background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>Materia:</strong> %s (%s)</p>" +
                        "    <p style='margin: 5px 0 0 0;'><strong>Año Académico:</strong> %d</p>" +
                        "  </div>" +
                        "  <p>El programa se encuentra disponible en su bandeja de entrada para la revisión y posterior emisión de la decisión curricular.</p>" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                        "  </div>" +
                        "  <br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                carrera.getNombre(),
                programa.getMateria().getNombre(),
                programa.getMateria().getCodigo(),
                programa.getAnio()
        );

        emailSender.sendHtmlEmail(destinatario, "Programa pendiente de revisión", htmlBody);

    }


    @Async
    public void sendEmailNotificacionAprobacionComision(
            String destinatario,
            UserEntity secretaria,
            MateriaEntity materia
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #2563eb;'>Revisión de Secretaría Académica</h2>" +
                        "  <p>Se comunica que el programa de la materia <strong>%s</strong> ha sido <strong>aceptado por todas las comisiones curriculares</strong> asociadas.</p>" +
                        "  <div style='background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>Materia:</strong> %s (%s)</p>" +
                        "    <p style='margin: 5px 0 0 0;'><strong>Departamento:</strong> %s</p>" +
                        "  </div>" +
                        "  <p>El programa se encuentra ahora en estado <strong>PENDIENTE REVISIÓN ACADÉMICA</strong>. Se requiere su intervención para la aprobación final o solicitud de correcciones.</p>" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                        "  </div>" +
                        "  <br /><br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                materia.getNombre(),
                materia.getNombre(),
                materia.getCodigo(),
                materia.getDepartamento()

        );

        emailSender.sendHtmlEmail(destinatario, "Programa aprobado por comisión", htmlBody);
    }

    @Async
    public void sendEmailNotificacionRechazo(
            String destinatarioEmail,
            UserEntity destinatario,
            Rol rolEmisor,
            UserEntity emisor,
            MateriaEntity materia,
            String justificacion
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #dc2626;'>Solicitud de Correcciones</h2>" +
                        "  <p>Hola <strong>%s</strong>,</p>" +
                        "  <p>Le informamos que <strong>%s</strong> (%s) ha solicitado correcciones en el programa de la materia:</p>" +
                        "  <div style='background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>Materia:</strong> %s (%s)</p>" +
                        "  </div>" +
                        "  <p><strong>Motivo del rechazo / Justificación:</strong></p>" +
                        "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; font-style: italic;'>" +
                        "    %s" +
                        "  </div>" +
                        "  <p>Por favor, ingrese al sistema para realizar los ajustes solicitados y reenviar el programa para su revisión.</p>" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                        "  </div>" +
                        "  <br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Este es un mensaje automático del Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                destinatario.getNombre(),
                emisor.getNombre(),
                rolEmisor.getDisplayName(),
                materia.getNombre(),
                materia.getCodigo(),
                justificacion
        );
        emailSender.sendHtmlEmail(destinatarioEmail, "Correcciones requeridas", htmlBody);
    }

    @Async
    public void sendEmailNotificacionRechazoComision(
            String destinatarioEmail,
            UserEntity destinatario,
            UserEntity emisor,
            MateriaEntity materia,
            CarreraEntity carreraComision,
            String justificacion
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #dc2626;'>Solicitud de Correcciones</h2>" +
                        "  <p>Hola <strong>%s</strong>,</p>" +
                        "<p>Le informamos que <strong>%s</strong>, en representación de la Comisión Curricular de la carrera <strong>%s</strong>, ha solicitado correcciones en el programa de la materia:</p>" +
                        "  <div style='background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>Materia:</strong> %s (%s)</p>" +
                        "  </div>" +
                        "  <p><strong>Motivo del rechazo / Justificación:</strong></p>" +
                        "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; font-style: italic;'>" +
                        "    %s" +
                        "  </div>" +
                        "  <p>Por favor, ingrese al sistema para realizar los ajustes solicitados y reenviar el programa para su revisión.</p>" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                        "  </div>" +
                        "  <br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Este es un mensaje automático del Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                destinatario.getNombre(),
                emisor.getNombre(),
                carreraComision.getNombre(),
                materia.getNombre(),
                materia.getCodigo(),
                justificacion
        );
        emailSender.sendHtmlEmail(destinatarioEmail, "Correcciones requeridas", htmlBody);
    }

    @Async
    public void sendEmailNotificacionRechazoOtrasComisiones(
            String destinatarioEmail,
            UserEntity destinatario,
            UserEntity emisor,
            MateriaEntity materia,
            CarreraEntity carreraComision,
            Rol destinoRechazo,
            String justificacion
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #dc2626;'>Programa rechazado por una comisión curricular</h2>" +
                        "  <p>Hola <strong>%s</strong>,</p>" +

                        "  <p>Le informamos que la comisión curricular de la carrera <strong>%s</strong>, " +
                        "  en la revisión del programa ha solicitado correcciones.</p>" +

                        "  <div style='background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0 0 5px 0;'><strong>Materia:</strong> %s (%s)</p>" +
                        "    <p style='margin: 0 0 5px 0;'><strong>Rechazado por:</strong> %s</p>" +
                        "    <p style='margin: 0;'><strong>Devuelto a:</strong> %s</p>" +
                        "  </div>" +

                        "  <p><strong>Motivo / Justificación:</strong></p>" +

                        "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0; font-style: italic;'>" +
                        "    %s" +
                        "  </div>" +

                        "  <p>El programa deberá ser corregido y posteriormente volverá a ingresar al circuito de revisión.</p>" +

                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' " +
                        "       style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>" +
                        "       Acceder al Sistema" +
                        "    </a>" +
                        "  </div>" +

                        "  <br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Este es un mensaje automático del Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",

                destinatario.getNombre(),
                carreraComision.getNombre(),
                materia.getNombre(),
                materia.getCodigo(),
                emisor.getNombre(),
                destinoRechazo.getDisplayName(),
                justificacion
        );

        emailSender.sendHtmlEmail(
                destinatarioEmail,
                "Programa devuelto para correcciones",
                htmlBody
        );
    }

    public void sendEmailAsignacionCargo(
            String destinatarioEmail,
            UserEntity destinatario,
            String cargo,
            String tipoAmbito,
            String nombreAmbito
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #2563eb;'>Asignación de Cargo</h2>" +
                        "  <p>Hola <strong>%s</strong>,</p>" +
                        "  <p>Le informamos que ha sido asignado para desempeñar el cargo de <strong>%s</strong> en:</p>" +
                        "  <div style='background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>%s:</strong> %s</p>" +
                        "  </div>" +
                        "  <p>A partir de este momento podrá acceder desde el sistema a las funciones correspondientes a este cargo.</p>" +
                        "  <div style='margin-top: 25px;'>" +
                        "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' " +
                        "       style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>" +
                        "       Acceder al Sistema" +
                        "    </a>" +
                        "  </div>" +
                        "  <br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Este es un mensaje automático del Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                destinatario.getNombre(),
                cargo,
                tipoAmbito,
                nombreAmbito
        );

        emailSender.sendHtmlEmail(
                destinatarioEmail,
                "Asignación de cargo - " + cargo,
                htmlBody
        );
    }

    public void sendEmailRemocionCargo(
            String destinatarioEmail,
            UserEntity destinatario,
            String cargo,
            String tipoAmbito,
            String nombreAmbito
    ) {
        String htmlBody = String.format(
                "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                        "  <h2 style='color: #6b7280;'>Actualización de Cargo</h2>" +
                        "  <p>Hola <strong>%s</strong>,</p>" +
                        "  <p>Le informamos que ha dejado de desempeñar el cargo de <strong>%s</strong> en:</p>" +
                        "  <div style='background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 15px; margin: 20px 0;'>" +
                        "    <p style='margin: 0;'><strong>%s:</strong> %s</p>" +
                        "  </div>" +
                        "  <p>En consecuencia, ya no tendrá acceso a las funciones asociadas a este cargo.</p>" +
                        "  <br />" +
                        "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                        "  <p style='font-size: 12px; color: #777;'>Este es un mensaje automático del Sistema de Gestión de Programas UNS.</p>" +
                        "</div>",
                destinatario.getNombre(),
                cargo,
                tipoAmbito,
                nombreAmbito
        );

        emailSender.sendHtmlEmail(
                destinatarioEmail,
                "Actualización de cargo - " + cargo,
                htmlBody
        );
    }
}
