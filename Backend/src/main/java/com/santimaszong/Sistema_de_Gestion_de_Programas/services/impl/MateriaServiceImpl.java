package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.MateriaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;
    private final DepartamentoService departamentoService;
    private final AreaService areaService;

    private final MateriaMapper materiaMapper;

    public MateriaServiceImpl(MateriaRepository materiaRepository, DepartamentoService departamentoService, AreaService areaService, MateriaMapper materiaMapper) {
        this.materiaRepository = materiaRepository;
        this.departamentoService = departamentoService;
        this.areaService = areaService;
        this.materiaMapper = materiaMapper;
    }


    @Override
    public MateriaResponseDTO createMateria(MateriaCreateDTO materiaDTO){
        MateriaEntity materiaEntity = materiaMapper.toEntity(materiaDTO);


        DepartamentoEntity departamento = departamentoService.getEntityById(materiaDTO.getDepartamentoId());

        AreaEntity area = areaService.getEntityById(materiaDTO.getAreaId());

        materiaEntity.setDepartamento(departamento);
        materiaEntity.setArea(area);

        MateriaEntity createdMateriaEntity = materiaRepository.save(materiaEntity);

        return materiaMapper.toDTO(createdMateriaEntity);
    }

    @Override
    public MateriaResponseDTO getMateriaById(Long id) {
        MateriaEntity foundMateria = materiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no existente"));;

        return materiaMapper.toDTO(foundMateria);
    }

    @Override
    public MateriaEntity getEntityById(Long id) {
        return materiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no existente"));
    }

    @Override
    public List<MateriaResponseDTO> listMaterias() {
        List<MateriaEntity> materias = materiaRepository.findAll();
        return materias.stream()
                .map(materiaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<MateriaEntity> listEntities(List<Long> ids) {
        return materiaRepository.findAllById(ids);
    }

    @Override
    public MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO materiaDTO) {
        if(!materiaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        MateriaEntity materiaEntity = materiaMapper.toEntity(materiaDTO);
        MateriaEntity savedMateriaEntity = materiaRepository.save(materiaEntity);

        return materiaMapper.toDTO(savedMateriaEntity);
    }

    @Override
    public void deleteMateria(Long id) {
        materiaRepository.deleteById(id);
    }
}
