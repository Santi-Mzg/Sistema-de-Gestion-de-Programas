package com.santimaszong.Sistema_de_Gestion_de_Programas.security;

import lombok.RequiredArgsConstructor;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class ProgramaWebConfig implements WebMvcConfigurer {
    private final ProgramaContextInterceptor contexto;

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, EstadoPrograma.class, EstadoPrograma::fromValue);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(contexto).addPathPatterns("/api/programas/**", "/api/departamentos/*/programas/**",
                "/api/departamentos/*/programas-coordinacion/**", "/api/departamentos/*/dashboard/**",
                "/api/areas/**", "/api/departamentos/*/areas/**", "/api/departamentos/*/mis-areas");
    }
}
