package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa;

public record DashboardResumenDTO(
        Long areas,
        Long carreras,
        Long materias,
        Long usuarios,
        Long docentes,
        Long administrativos,
        Long programasTotales,
        Long programasVigentes,
        Long pendienteAdministracion,
        Long pendienteDocente,
        Long rechazadoDocente,
        Long pendienteComisiones,
        Long pendienteSecretaria
) {}