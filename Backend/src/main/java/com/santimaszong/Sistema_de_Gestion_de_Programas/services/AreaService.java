package com.santimaszong.Sistema_de_Gestion_de_Programas.services;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;

import java.util.List;

public interface AreaService {
    AreaResponseDTO createArea(AreaCreateDTO user);
    AreaResponseDTO getAreaById(Long id);
    AreaEntity getEntityById(Long id);
    List<AreaResponseDTO> listAreas();
    AreaResponseDTO updateArea(Long id, AreaCreateDTO area);
    void deleteArea(Long id);
}
