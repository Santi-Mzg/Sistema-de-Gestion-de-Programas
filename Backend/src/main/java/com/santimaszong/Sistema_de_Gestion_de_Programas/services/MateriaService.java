package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;

public interface MateriaService {
    MateriaResponseDTO createMateria(MateriaCreateDTO user);
    MateriaResponseDTO getMateriaById(Long id);
    List<MateriaResponseDTO> listMaterias();
    MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO materia);
    void deleteMateria(Long id);
}
