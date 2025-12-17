package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoUpdateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaAdministrativoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;

public interface ProgramaService {
    ProgramaResponseDTO createPrograma(ProgramaCargaAdministrativoDTO programa);
    ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaAdministrativoDTO programa, UserEntity actor);

    ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaProfesorDTO programa, UserEntity actor);
    ProgramaResponseDTO actualizarEstado(Long id, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor);

    ProgramaResponseDTO getProgramaById(Long id);
    List<ProgramaResponseDTO> listProgramas();

    void deletePrograma(Long id);
}
