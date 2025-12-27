package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;

public interface MateriaService {
    MateriaResponseDTO createMateria(Long deptId, MateriaCreateDTO user);
    MateriaResponseDTO getMateriaById(Long id);
    MateriaEntity getEntityById(Long id);
    List<MateriaEntity> listEntities(List<Long> ids);
    List<MateriaResponseDTO> listMaterias();
    List<MateriaResponseDTO> listMateriasDepartamento(Long deptId);
    MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO materia);
    void deleteMateria(Long id);
}
