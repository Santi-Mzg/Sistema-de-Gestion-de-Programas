package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramDTO;

import java.util.List;
import java.util.Optional;

public interface ProgramService {
    ProgramDTO createProgram(ProgramDTO user);
    Optional<ProgramDTO> getProgramById(Long id);
    List<ProgramDTO> listPrograms();
    ProgramDTO updateProgram(Long id, ProgramDTO user);
    void deleteProgram(Long id);
}
