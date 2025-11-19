package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;

import java.util.List;
import java.util.Optional;

public interface ProgramaService {
    ProgramaResponseDTO createPrograma(ProgramaCreateDTO programa);
    ProgramaResponseDTO updatePrograma(Long id, ProgramaCreateDTO programa);

    ProgramaResponseDTO profesorCarga(Long id, ProgramaCreateDTO programa);
    Void profesorRechazarAAdministracion(Long id);
    Void comisionAprobar(Long id);
    Void comisionRechazarAAdministracion(Long id);
    Void comisionRechazarAProfesor(Long id);
    Void secretariaAprobar(Long id);
    Void secretariaRechazarAAdministracion(Long id);
    Void secretariaRechazarAProfesor(Long id);

    Optional<ProgramaResponseDTO> getProgramaById(Long id);
    List<ProgramaResponseDTO> listProgramas();
    void deletePrograma(Long id);
}
