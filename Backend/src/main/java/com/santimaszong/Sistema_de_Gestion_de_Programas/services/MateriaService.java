package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.MateriaDTO;

import java.util.List;
import java.util.Optional;

public interface MateriaService {
    MateriaDTO createMateria(MateriaDTO user);
    Optional<MateriaDTO> getMateriaById(Long id);
    List<MateriaDTO> listMaterias();
    MateriaDTO updateMateria(Long id, MateriaDTO user);
    void deleteMateria(Long id);
}
