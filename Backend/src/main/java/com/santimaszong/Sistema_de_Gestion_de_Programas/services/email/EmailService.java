package com.santimaszong.Sistema_de_Gestion_de_Programas.services.email;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;


@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;


    @Async
    public void sendEmailNuevoUsuario(String destinatario, String legajo, String password) {

        try {
            String htmlTemplate = String.format(
                        "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                                "  <h2 style='color: #2563eb;'>Estimado/a,</h2>" +
                                "  <p>Se ha creado una cuenta para ti en el <strong>Sistema de Gestión de Programas</strong>.</p>" +
                                "  <p>Tus credenciales de acceso son:</p>" +
                                "  <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;'>" +
                                "    <p style='margin: 0;'><strong>Legajo:</strong> %s</p>" +
                                "    <p style='margin: 5px 0 0 0;'><strong>Contraseña:</strong> <code style='background:#fff; padding:2px 5px;'>{{password}}</code></p>" +
                                "  </div>" +
                                "  <div style='margin-top: 25px;'>" +
                                "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                                "  </div>" +
                                "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                                "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                                "</div>",
                    legajo
            );

            String htmlBody = htmlTemplate.replace("{{password}}", password);


            sendHtmlEmail(destinatario, "Bienvenido a Sílabus-UNS", htmlBody);
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
    }


    @Async
    public void sendEmailNuevoDepartamento(String destinatario, String departamentoName) {

        try {
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

            sendHtmlEmail(destinatario, "Nuevo acceso a departamento", htmlBody);
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
    }

    @Async
    public void sendEmailRecuperarPassword(String destinatario, String newPassword) {

        try {
            String htmlTemplate =
                    "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                            "  <h2 style='color: #2563eb;'>Recuperación de Contraseña</h2>" +
                            "  <p>Estimado/a,</p>" +
                            "  <p>Ha solicitado restablecer tu contraseña.</p>" +
                            "  <p>Se ha generado una nueva contraseña para que pueda acceder a su cuenta:</p>" +
                            "  <div style='background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px dashed #2563eb;'>" +
                            "    <span style='font-size: 14px; color: #666;'>Contraseña:</span><br/>" +
                            "    <strong style='font-size: 24px; color: #1e40af; letter-spacing: 2px;'>{{password}}</strong>" +
                            "  </div>" +
                            "  <hr style='border: 0; border-top: 1px solid #eee; margin-top: 30px;' />" +
                            "  <p style='font-size: 12px; color: #777;'>Si no solicitaste este cambio, te recomendamos contactar al administrador del departamento.</p>" +
                            "  <div style='margin-top: 25px;'>" +
                            "    <a href='https://sistema-de-gestion-de-programas-fro.vercel.app/login' style='background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Acceder al Sistema</a>" +
                            "  </div>" +
                            "  <hr style='border: 0; border-top: 1px solid #eee;' />" +
                            "  <p style='font-size: 12px; color: #777;'>Mensaje generado automáticamente por el Sistema de Gestión de Programas UNS.</p>" +
                            "</div>";

            String htmlBody = htmlTemplate.replace("{{password}}", newPassword);

            sendHtmlEmail(destinatario, "Nueva contraseña - Sílabus UNS", htmlBody);
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
    }


    @Async
    public void sendEmailNotificacionCargaAdministrativo(
            String destinatario,
            UserEntity profesor,
            MateriaEntity materia
    ) {

        try {
            String htmlBody = String.format(
                    "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                            "  <h2 style='color: #2563eb;'>Gestión de Programas</h2>" +
                            "  <p>Hola <strong>%s</strong> <strong>%s</strong>,</p>" +
                            "  <p>Le informamos que ha sido asignado como <strong>Profesor Responsable</strong> del programa para la materia:</p>" +
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
                    profesor.getNombre(), profesor.getApellido(), materia.getNombre(), materia.getCodigo()
            );

            sendHtmlEmail(
                    destinatario,
                    "Nuevo Programa Cargado - " + materia.getNombre(),
                    htmlBody
            );
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
    }

    @Async
    public void sendEmailNotificacionCargaDocente(
            String destinatario,
            ProgramaEntity programa,
            CarreraEntity carrera
    ) {

        try {
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

            sendHtmlEmail(destinatario, "Programa pendiente de revisión", htmlBody);
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
    }


    @Async
    public void sendEmailNotificacionAprobacionComision(
            String destinatario,
            UserEntity secretaria,
            MateriaEntity materia
    ) {

        try {
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

            sendHtmlEmail(destinatario, "Programa aprobado por comisión", htmlBody);
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
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

        try {
            String htmlBody = String.format(
                    "<div style='font-family: sans-serif; padding: 20px; color: #333;'>" +
                            "  <h2 style='color: #dc2626;'>Solicitud de Correcciones</h2>" + // Rojo para indicar atención
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
                    rolEmisor,
                    materia.getNombre(),
                    materia.getCodigo(),
                    justificacion
            );

            sendHtmlEmail(destinatarioEmail, "Correcciones requeridas", htmlBody);
        } catch (IOException e) {
            throw new RuntimeException("Error al crear el email para: " + destinatario, e);
        }
    }


    private void sendHtmlEmail(String to, String subject, String htmlBody) throws IOException {

        Email from = new Email(fromEmail, "Sílabus-UNS");
        Email toEmail = new Email(to);
        Content content = new Content("text/html", htmlBody);
        Mail mail = new Mail(from, subject, toEmail, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();

        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        Response response = sg.api(request);

        if (response.getStatusCode() >= 400) {
            throw new RuntimeException("Error SendGrid: " + response.getBody());
        }

    }



}