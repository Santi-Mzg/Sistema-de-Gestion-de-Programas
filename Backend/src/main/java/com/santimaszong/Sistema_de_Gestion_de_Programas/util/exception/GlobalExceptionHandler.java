package com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

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

        HttpErrorResponse response = HttpErrorResponse.of(
                "Validation Failed",
                HttpStatus.UNPROCESSABLE_ENTITY.value(),
                errors,
                generalErrors,
                requestedURI
        );

        return new ResponseEntity<>(response, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<HttpErrorResponse> handleIllegalStateException(IllegalStateException ex, HttpServletRequest request) {

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

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<HttpErrorResponse> handleDuplicateKey(DataIntegrityViolationException ex, HttpServletRequest request) {
        String message = "Error de integridad de datos";

        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();

        errors.put("Error" ,ex.getMessage());

        // Verificamos si es el error de llave duplicada
        if (ex.getMessage().contains("materias_codigo_key")) {
            message = "Ya existe una materia con ese código.";
        }

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
     * Manejador para excepciones genéricas o no controladas
     * Devuelve un código de estado 500 INTERNAL SERVER ERROR.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<HttpErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {

        Map<String, String> errors = new HashMap<>();
        List<String> generalErrors = new ArrayList<>();

        errors.put("Error" ,ex.getMessage());

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