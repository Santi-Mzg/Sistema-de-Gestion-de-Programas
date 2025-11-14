package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramaDTO;

import java.util.List;
import java.util.Optional;

public interface ProgramaService {
    ProgramaDTO createProgram(ProgramaDTO user);
    Optional<ProgramaDTO> getProgramById(Long id);
    List<ProgramaDTO> listPrograms();
    ProgramaDTO updateProgram(Long id, ProgramaDTO user);
    void deleteProgram(Long id);
}
