package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.MateriaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;
    private final DepartamentoService departamentoService;
    private final CarreraService carreraService;
    private final AreaService areaService;

    private final MateriaMapper materiaMapper;

    public MateriaServiceImpl(MateriaRepository materiaRepository, DepartamentoService departamentoService, CarreraService carreraService, AreaService areaService, MateriaMapper materiaMapper) {
        this.materiaRepository = materiaRepository;
        this.departamentoService = departamentoService;
        this.carreraService = carreraService;
        this.areaService = areaService;
        this.materiaMapper = materiaMapper;
    }


    @Override
    @Transactional
    public MateriaResponseDTO createMateria(MateriaCreateDTO materiaDTO){
        MateriaEntity materiaEntity = materiaMapper.toEntity(materiaDTO);

        AreaEntity area = areaService.getEntityById(materiaDTO.getAreaId());

        materiaEntity.setDepartamento(area.getDepartamento());
        materiaEntity.setArea(area);

        MateriaEntity createdMateriaEntity = materiaRepository.save(materiaEntity);

        return materiaMapper.toDTO(createdMateriaEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public MateriaResponseDTO getMateriaById(Long id) {
        MateriaEntity foundMateria = materiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no existente"));;

        return materiaMapper.toDTO(foundMateria);
    }

    @Override
    @Transactional(readOnly = true)
    public MateriaEntity getEntityById(Long id) {
        return materiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> listMaterias() {
        List<MateriaEntity> materias = materiaRepository.findAll();
        return materias.stream()
                .map(materiaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> listMateriasDepartamento(Long deptId) {
        DepartamentoEntity departamento = departamentoService.findEntityWithMateriasById(deptId);

        return departamento.getMaterias()
                .stream()
                .map(materiaMapper::toDTO)
                .toList();
    };

    @Override
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> listMateriasCarreraPlan(Long carreraId) {
        List<MateriaEntity> materias = carreraService.listMateriasCarreraPlan(carreraId);

        return materias
                .stream()
                .map(materiaMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Set<MateriaEntity> listEntities(Set<Long> ids) {
        return materiaRepository.findAllByIdAsSet(ids);
    }

    @Override
    @Transactional
    public MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO materiaDTO) {
        return materiaRepository.findById(id).map(existingCarrera -> {
            Optional.ofNullable(materiaDTO.getNombre()).ifPresent(existingCarrera::setNombre);
            Optional.ofNullable(materiaDTO.getCodigo()).ifPresent(existingCarrera::setCodigo);

            MateriaEntity savedMateriaEntity = materiaRepository.save(existingCarrera);

            return materiaMapper.toDTO(savedMateriaEntity);
        }).orElseThrow(() -> new EntityNotFoundException("Materia no existente"));
    }

    @Override
    @Transactional
    public void deleteMateria(Long id) {
        materiaRepository.deleteById(id);
    }
}
