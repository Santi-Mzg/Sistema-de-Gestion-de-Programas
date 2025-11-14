package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.MateriaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.MateriaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;
    private Mapper<MateriaDTO, MateriaEntity> materiaMapper;

    public MateriaServiceImpl(MateriaRepository materiaRepository, Mapper<MateriaDTO, MateriaEntity> materiaMapper) {
        this.materiaRepository = materiaRepository;
        this.materiaMapper = materiaMapper;
    }


    @Override
    public MateriaDTO createMateria(MateriaDTO materiaDTO){
        MateriaEntity materiaEntity = materiaMapper.mapTo(materiaDTO);
        MateriaEntity createdMateriaEntity = materiaRepository.save(materiaEntity);

//        if(createdMateriaEntity==null)
//            throw new Exception("Error al crear el usuario.");

        return materiaMapper.mapFrom(createdMateriaEntity);
    }

    @Override
    public Optional<MateriaDTO> getMateriaById(Long id) {
        Optional<MateriaEntity> foundMateria = materiaRepository.findById(id);

        return foundMateria.map(materiaMapper::mapFrom);
    }

    @Override
    public List<MateriaDTO> listMaterias() {
        List<MateriaEntity> materias = materiaRepository.findAll();
        return materias.stream()
                .map(materiaMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public MateriaDTO updateMateria(Long id, MateriaDTO materiaDTO) {
        if(!materiaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        MateriaEntity materiaEntity = materiaMapper.mapTo(materiaDTO);
        MateriaEntity savedMateriaEntity = materiaRepository.save(materiaEntity);

        return materiaMapper.mapFrom(savedMateriaEntity);
    }

    @Override
    public void deleteMateria(Long id) {
        materiaRepository.deleteById(id);
    }
}
