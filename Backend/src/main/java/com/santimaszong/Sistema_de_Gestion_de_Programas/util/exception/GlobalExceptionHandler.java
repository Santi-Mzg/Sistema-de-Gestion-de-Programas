package com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Errores de validación de DTOs (@Valid).
     *
     * Son errores esperados provocados por datos inválidos enviados
     * por el cliente, por lo que no es necesario registrar un stack trace.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();
        ex.getBindingResult().getAllErrors().forEach((error -> {
            if (error instanceof FieldError fieldError) {
                String fieldName = fieldError.getField();
                String errorMsg = fieldError.getDefaultMessage();
                errors.put(fieldName, errorMsg);
            } else {
                generalErrors.add(error.getDefaultMessage());
            }
        }));

        String requestedURI = "";

        if (request instanceof HttpServletRequest servletWebRequest) {
            requestedURI = servletWebRequest.getRequestURI();
        }

        log.debug(
            "Validation failed processing {}: {}",
            requestedURI,
            errors
        );

        HttpErrorResponse response = HttpErrorResponse.of(
                "Validation Failed",
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                errors,
                generalErrors,
                requestedURI
        );

        return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    /**
     * Usuario autenticado pero sin permisos suficientes.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<HttpErrorResponse> handleAccessDeniedException(AccessDeniedException ex, HttpServletRequest request) {

        log.warn(
                "Access denied processing {} {}",
                request.getMethod(),
                request.getRequestURI()
        );

        Map<String, String> errors = new HashMap<>();
        errors.put("Error", "No tiene permisos para realizar esta operación");

        HttpErrorResponse response = HttpErrorResponse.of(
                "Access denied",
                HttpStatus.FORBIDDEN.value(),
                errors,
                new ArrayList<>(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN);
    }

    /**
     * Operación inválida debido al estado actual del recurso.
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<HttpErrorResponse> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {

        log.warn(
            "Invalid operation processing {} {}: {}",
            request.getMethod(),
            request.getRequestURI(),
            ex.getMessage()
        );

        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();

        errors.put("Error" ,ex.getMessage());

        HttpErrorResponse response = HttpErrorResponse.of(
                "Invalid operation in the current state",
                HttpStatus.BAD_REQUEST.value(),
                errors,
                generalErrors,
                request.getRequestURI()
        );

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Maneja EntityNotFoundException (Optional vacío)
     * y devuelve un código de estado 404 NOT FOUND.
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<HttpErrorResponse> handleEntityNotFound(EntityNotFoundException ex, HttpServletRequest request) {

        log.warn(
                "Resource not found processing {} {}: {}",
                request.getMethod(),
                request.getRequestURI(),
                ex.getMessage()
        );

        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();

        errors.put("Error" ,ex.getMessage());

        HttpErrorResponse response = HttpErrorResponse.of(
                "Resource not found",
                HttpStatus.NOT_FOUND.value(),
                errors,
                generalErrors,
                request.getRequestURI()
        );

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }


    /**
     * Violaciones de restricciones de base de datos.
     *
     * El detalle técnico de Hibernate/PostgreSQL se registra únicamente
     * en los logs y nunca se devuelve directamente al cliente.
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<HttpErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex, HttpServletRequest request) {
        String message = "Error de integridad de datos";

        log.error(
                "Data integrity violation processing {} {}",
                request.getMethod(),
                request.getRequestURI(),
                ex
        );

        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();


        // Verificamos si es el error de llave duplicada
        if (ex.getMessage().contains("materias_codigo_key")) {
            message = "Ya existe una materia con ese código.";
        }

        errors.put("Error" ,message);

        HttpErrorResponse response = HttpErrorResponse.of(
                message,
                HttpStatus.CONFLICT.value(),
                errors,
                generalErrors,
                request.getRequestURI()
        );

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }


    /**
     * Credenciales incorrectas.
     *
     * AuthenticationManager lanza BadCredentialsException cuando
     * el usuario/password no son válidos.
     *
     * No devolvemos ex.getMessage() para evitar revelar información
     * sobre el proceso interno de autenticación.
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<HttpErrorResponse> handleBadCredentials(
            BadCredentialsException ex,
            HttpServletRequest request) {

        log.warn(
            "Failed authentication attempt at {}",
            request.getRequestURI()
        );

        Map<String, String> errors = new HashMap<>();
        errors.put("Error", "Credenciales inválidas");

        HttpErrorResponse response = HttpErrorResponse.of(
                "Authentication failed",
                HttpStatus.UNAUTHORIZED.value(),
                errors,
                new ArrayList<>(),
                request.getRequestURI()
        );

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

    /**
     * Última barrera para excepciones no controladas.
     *
     * IMPORTANTE:
     * - El stack trace completo queda registrado en los logs.
     * - El cliente recibe únicamente un mensaje genérico.
     * - Nunca exponemos ex.getMessage() en una respuesta HTTP 500.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<HttpErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();

        errors.put("Error", "Ocurrió un error interno.");

        HttpErrorResponse response = HttpErrorResponse.of(
                "Internal Server Error",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                errors,
                generalErrors,
                request.getRequestURI()
        );

        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}