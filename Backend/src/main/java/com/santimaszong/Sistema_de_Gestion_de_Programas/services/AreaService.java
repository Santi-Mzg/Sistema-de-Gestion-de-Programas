package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface AreaService {
    AreaResponseDTO createArea(Long deptId, AreaCreateDTO area);
    AreaResponseDTO getAreaById(Long id);
    AreaEntity getEntityById(Long id);
    List<AreaResponseDTO> listAreas();
    Page<AreaResponseDTO> listAreasDepartamento(Long deptId, String search, Pageable pageable);
    AreaResponseDTO updateArea(Long id, AreaCreateDTO area);
    long countByDepartamentoId(Long deptId);
    void deleteArea(Long id);
}
