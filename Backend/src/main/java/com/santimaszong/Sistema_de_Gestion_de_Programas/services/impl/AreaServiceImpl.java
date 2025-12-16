package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.AreaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.AreaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AreaServiceImpl implements AreaService {

    private final DepartamentoRepository departamentoRepository;
    private final AreaRepository areaRepository;

    private final AreaMapper areaMapper;

    public AreaServiceImpl(DepartamentoRepository departamentoRepository, AreaRepository areaRepository, AreaMapper areaMapper) {
        this.departamentoRepository = departamentoRepository;
        this.areaRepository = areaRepository;
        this.areaMapper = areaMapper;
    }


    @Override
    public AreaResponseDTO createArea(AreaCreateDTO areaDTO){
        AreaEntity areaEntity = areaMapper.toEntity(areaDTO);


        DepartamentoEntity departamento = departamentoRepository.findById(areaDTO.getDepartamentoId())
                .orElseThrow(
                        () -> new EntityNotFoundException("El Departamento del area " + areaDTO.getNombre() + " con ID " + areaDTO.getDepartamentoId() + "no fue encontrado.")
                );

        areaEntity.setDepartamento(departamento);

        AreaEntity createdAreaEntity = areaRepository.save(areaEntity);

        return areaMapper.toDTO(createdAreaEntity);
    }

    @Override
    public AreaResponseDTO getAreaById(Long id) {
        AreaEntity foundArea = areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Area no existente"));;

        return areaMapper.toDTO(foundArea);
    }

    @Override
    public List<AreaResponseDTO> listAreas() {
        List<AreaEntity> materias = areaRepository.findAll();
        return materias.stream()
                .map(areaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AreaResponseDTO updateArea(Long id, AreaCreateDTO areaDTO) {
        if(!areaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        AreaEntity areaEntity = areaMapper.toEntity(areaDTO);
        AreaEntity savedAreaEntity = areaRepository.save(areaEntity);

        return areaMapper.toDTO(savedAreaEntity);
    }

    @Override
    public void deleteArea(Long id) {
        areaRepository.deleteById(id);
    }
}
