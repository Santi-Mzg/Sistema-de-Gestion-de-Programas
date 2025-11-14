package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.DepartamentoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.DepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartamentoServiceImpl implements DepartamentoService {

    private final DepartamentoRepository departamentoRepository;
    private Mapper<DepartamentoDTO, DepartamentoEntity> departamentoMapper;

    public DepartamentoServiceImpl(DepartamentoRepository departamentoRepository, Mapper<DepartamentoDTO, DepartamentoEntity> departamentoMapper) {
        this.departamentoRepository = departamentoRepository;
        this.departamentoMapper = departamentoMapper;
    }


    @Override
    public DepartamentoDTO createDepartamento(DepartamentoDTO departamentoDTO) {
        DepartamentoEntity departamentoEntity = departamentoMapper.mapTo(departamentoDTO);
        DepartamentoEntity createdDepartamentoEntity = departamentoRepository.save(departamentoEntity);

//        if(createdDepartamentoEntity==null)
//            throw new Exception("Error al crear el usuario.");

        return departamentoMapper.mapFrom(createdDepartamentoEntity);
    }

    @Override
    public Optional<DepartamentoDTO> getDepartamentoById(Long id) {
        Optional<DepartamentoEntity> foundDepartamento = departamentoRepository.findById(id);

        return foundDepartamento.map(departamentoMapper::mapFrom);
    }

    @Override
    public List<DepartamentoDTO> listDepartamentos() {
        List<DepartamentoEntity> departamentos = departamentoRepository.findAll();
        return departamentos.stream()
                .map(departamentoMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public DepartamentoDTO updateDepartamento(Long id, DepartamentoDTO departamentoDTO) {
        if(!departamentoRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        DepartamentoEntity departamentoEntity = departamentoMapper.mapTo(departamentoDTO);
        DepartamentoEntity savedDepartamentoEntity = departamentoRepository.save(departamentoEntity);

        return departamentoMapper.mapFrom(savedDepartamentoEntity);
    }

    @Override
    public void deleteDepartamento(Long id) {
        departamentoRepository.deleteById(id);
    }
}
