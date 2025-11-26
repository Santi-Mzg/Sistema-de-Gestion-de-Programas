package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoUpdateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaAdministrativoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;

import java.util.List;

public interface ProgramaService {
    ProgramaResponseDTO createPrograma(ProgramaCargaAdministrativoDTO programa);
    ProgramaResponseDTO updatePrograma(Long id, ProgramaCargaAdministrativoDTO programa);

    ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaProfesorDTO programa);
    ProgramaResponseDTO actualizarEstado(Long id, EstadoUpdateDTO estadoUpdateDTO);

    ProgramaResponseDTO getProgramaById(Long id);
    List<ProgramaResponseDTO> listProgramas();
    void deletePrograma(Long id);
}
