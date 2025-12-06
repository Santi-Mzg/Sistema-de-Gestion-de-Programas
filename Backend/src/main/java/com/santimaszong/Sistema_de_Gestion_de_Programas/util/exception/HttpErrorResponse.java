package com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception;

import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
public class HttpErrorResponse {
    private LocalDateTime timestamp;
    private String message;
    private int status;
    private Map<String, String> errors;
    private List<String> generalErrors;
    private String path;

    public static HttpErrorResponse of(String message, int status, Map<String, String> errors, List<String> generalErrors, String path) {
        HttpErrorResponse response = new HttpErrorResponse();
        response.timestamp = LocalDateTime.now();
        response.message = message;
        response.status = status;
        response.errors = errors;
        response.generalErrors = generalErrors;
        response.path = path;
        return response;
    }
}

