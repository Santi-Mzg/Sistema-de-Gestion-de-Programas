package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.AreaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.AreaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;
    private final DepartamentoService departamentoService;

    private final AreaMapper areaMapper;

    public AreaServiceImpl(DepartamentoService departamentoService, AreaRepository areaRepository, AreaMapper areaMapper) {
        this.areaRepository = areaRepository;
        this.departamentoService = departamentoService;
        this.areaMapper = areaMapper;
    }


    @Override
    @Transactional
    public AreaResponseDTO createArea(Long deptId, AreaCreateDTO areaDTO){
        AreaEntity areaEntity = areaMapper.toEntity(areaDTO);


        DepartamentoEntity departamento = departamentoService.getEntityById(deptId);

        areaEntity.setDepartamento(departamento);

        AreaEntity createdAreaEntity = areaRepository.save(areaEntity);

        return areaMapper.toDTO(createdAreaEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public AreaResponseDTO getAreaById(Long id) {
        AreaEntity foundArea = areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Area no existente"));;

        return areaMapper.toDTO(foundArea);
    }

    @Override
    @Transactional(readOnly = true)
    public AreaEntity getEntityById(Long id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Area no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponseDTO> listAreas() {
        List<AreaEntity> materias = areaRepository.findAll();
        return materias.stream()
                .map(areaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponseDTO> listAreasDepartamento(Long id) {
        DepartamentoEntity departamento = departamentoService.findEntityWithAreasById(id);

        return departamento.getAreas()
                .stream()
                .map(areaMapper::toDTO)
                .toList();
    };

    @Override
    @Transactional
    public AreaResponseDTO updateArea(Long id, AreaCreateDTO areaDTO) {
        if(!areaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        AreaEntity areaEntity = areaMapper.toEntity(areaDTO);
        AreaEntity savedAreaEntity = areaRepository.save(areaEntity);

        return areaMapper.toDTO(savedAreaEntity);
    }

    @Override
    @Transactional
    public void deleteArea(Long id) {
        areaRepository.deleteById(id);
    }
}
