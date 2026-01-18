package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import org.springframework.security.core.Authentication;

public interface ProgramaService {
    ProgramaResponseDTO create(ProgramaCargaDTO programa, UserEntity actor);
    ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaDTO programa, UserEntity actor);
    ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaDTO programa, UserEntity actor);
    ProgramaResponseDTO actualizarEstado(Authentication auth, Long deptId, Long programId, EstadoUpdateDTO estadoUpdateDTO, Rol rolActivo);
    ProgramaResponseDTO getById(Long id);
    ProgramaResponseDTO getByMateriaIdAndAnio(Long materiaId);
    ProgramaResponseDTO getProgramaVigenteByMateria(Long materiaId);
    List<ProgramaResponseDTO> getList(Authentication auth, Long deptId, Long carreraId, Rol rolActivo);
    List<ProgramaResponseDTO> listAll();
    void delete(Long id);
    void saveDraft(Long departamentoId, Long materiaId, ProgramaDraftDTO dto, UserEntity user, Rol rolActivo);
    ProgramaDraftDTO getDraft(Long departamentoId, Long materiaId, UserEntity user, Rol rolActivo);
    void deleteDraft(Long departamentoId, Long materiaId, UserEntity user, Rol rolActivo);



}
