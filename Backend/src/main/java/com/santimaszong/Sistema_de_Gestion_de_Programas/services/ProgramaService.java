package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramaDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Optional;

public interface ProgramaService {
    ProgramaDTO createPrograma(ProgramaDTO programa);
    ProgramaDTO updatePrograma(Long id, ProgramaDTO programa);

    ProgramaDTO profesorCarga(Long id, ProgramaDTO programa);
    Void profesorRechazarAAdministracion(Long id);
    Void comisionAprobar(Long id);
    Void comisionRechazarAAdministracion(Long id);
    Void comisionRechazarAProfesor(Long id);
    Void secretariaAprobar(Long id);
    Void secretariaRechazarAAdministracion(Long id);
    Void secretariaRechazarAProfesor(Long id);

    Optional<ProgramaDTO> getProgramaById(Long id);
    List<ProgramaDTO> listProgramas();
    void deletePrograma(Long id);
}
