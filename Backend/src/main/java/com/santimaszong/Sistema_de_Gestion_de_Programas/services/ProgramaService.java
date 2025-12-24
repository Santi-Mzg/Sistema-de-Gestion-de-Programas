package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoUpdateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaAdministrativoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;

public interface ProgramaService {
    ProgramaResponseDTO create(ProgramaCargaAdministrativoDTO programa);
    ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaAdministrativoDTO programa, UserEntity actor);
    ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaProfesorDTO programa, UserEntity actor);
    ProgramaResponseDTO actualizarEstado(Long id, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor);
    ProgramaResponseDTO getById(Long id);
    List<ProgramaResponseDTO> getList(String authName, Long departamentoId, Long carreraId, Rol rolActivo);
    List<ProgramaResponseDTO> listAll();
    void delete(Long id);
}
