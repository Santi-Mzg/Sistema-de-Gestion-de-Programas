package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import org.springframework.data.domain.Page;
import java.util.List;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import org.springframework.data.domain.Pageable;

public interface MateriaService {
    MateriaResponseDTO createMateria(MateriaCreateDTO user);
    MateriaResponseDTO getMateriaById(Long id);
    MateriaEntity getEntityById(Long id);
    List<MateriaEntity> listEntities(List<Long> ids);
    List<MateriaResponseDTO> listMaterias();
    Page<MateriaResponseDTO> listMateriasDepartamento(Long deptId, String search, Pageable pageable);
    List<MateriaResponseDTO> listMateriasCarreraPlan(Long carreraId);
    MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO materia);
    long countByDepartamentoId(Long deptId);
    void deleteMateria(Long id);
}
