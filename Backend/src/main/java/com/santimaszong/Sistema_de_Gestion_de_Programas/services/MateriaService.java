package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import java.util.List;
import java.util.Set;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;

public interface MateriaService {
    MateriaResponseDTO createMateria(MateriaCreateDTO user);
    MateriaResponseDTO getMateriaById(Long id);
    MateriaEntity getEntityById(Long id);
    Set<MateriaEntity> listEntities(Set<Long> ids);
    List<MateriaResponseDTO> listMaterias();
    List<MateriaResponseDTO> listMateriasDepartamento(Long deptId);
    List<MateriaResponseDTO> listMateriasCarreraPlan(Long carreraId);
    MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO materia);
    void deleteMateria(Long id);
}
