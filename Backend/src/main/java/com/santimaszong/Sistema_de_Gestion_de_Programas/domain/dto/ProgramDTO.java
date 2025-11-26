package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto;

<<<<<<< Updated upstream:Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/ProgramDTO.java
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Area;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Carrera;
=======
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.EstadoHistoricoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaCarreraEntity;
>>>>>>> Stashed changes:Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaResponseDTO.java
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProgramDTO {

    private Long id;

    // --- BLOQUE ÚNICO ---
    private String nombreDepartamento;
    private String nombreMateria;
    private String codigoMateria;
<<<<<<< Updated upstream:Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/ProgramDTO.java

    private Area areaMateria;

    private UserEntity profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    private List<Carrera> carreras;

    private String plan;
    private String ubicacionEnPlan;

    private String correlativas;
    private String requisitos;
    private String tipoFormacion;
=======
    private String areaMateria;
    private String profesorResponsable;

    // --- BLOQUE MÚLTIPLE ---
    private List<ProgramaCarreraEntity> carreras;
>>>>>>> Stashed changes:Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaResponseDTO.java

    // --- BLOQUE ÚNICO ---
    private int cargaHorariaTotal;
    private int cargaHorariaSemanal;
    private int cargaHorariaPractica;
    private int creditos;
    private int cantidadSemanas;

    private String fundamentacion;
    private String objetivos;
    private String programaAnalitico;
    private String metodologia;
    private String modalidadEvaluacion;
    private String bibliografia;
<<<<<<< Updated upstream:Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/ProgramDTO.java
=======

    private String estado;
    private List<EstadoHistoricoEntity> historialEstados;

>>>>>>> Stashed changes:Backend/src/main/java/com/santimaszong/Sistema_de_Gestion_de_Programas/domain/dto/programa/ProgramaResponseDTO.java
}
