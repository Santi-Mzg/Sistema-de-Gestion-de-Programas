package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;

import java.util.List;
import java.util.Optional;

public interface MateriaService {
    MateriaResponseDTO createMateria(MateriaCreateDTO user);
    Optional<MateriaResponseDTO> getMateriaById(Long id);
    List<MateriaResponseDTO> listMaterias();
    MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO user);
    void deleteMateria(Long id);
}
