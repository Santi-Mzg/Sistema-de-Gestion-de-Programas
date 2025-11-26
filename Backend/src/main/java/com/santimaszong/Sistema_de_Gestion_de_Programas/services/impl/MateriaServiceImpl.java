package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.MateriaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;
    private final MateriaMapper materiaMapper;

    public MateriaServiceImpl(MateriaRepository materiaRepository, MateriaMapper materiaMapper) {
        this.materiaRepository = materiaRepository;
        this.materiaMapper = materiaMapper;
    }


    @Override
    public MateriaResponseDTO createMateria(MateriaCreateDTO materiaDTO){
        MateriaEntity materiaEntity = materiaMapper.toEntity(materiaDTO);

        List<MateriaEntity> correlativasFuertes = materiaRepository.findAllById(materiaDTO.getCorrelativasFuertesIds());
        if(materiaDTO.getCorrelativasFuertesIds().size() != correlativasFuertes.size()){
            throw new EntityNotFoundException("Una o más materias correlativas fuertes especificadas no fueron encontradas. Por favor, verifica los IDs.");
        }

        List<MateriaEntity> correlativasDebiles = materiaRepository.findAllById(materiaDTO.getCorrelativasDebilesIds());
        if(materiaDTO.getCorrelativasDebilesIds().size() != correlativasDebiles.size()){
            throw new EntityNotFoundException("Una o más materias correlativas débiles especificadas no fueron encontradas. Por favor, verifica los IDs.");
        }

        materiaEntity.setCorrelativasFuertes(correlativasFuertes);
        materiaEntity.setCorrelativasDebiles(correlativasDebiles);

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
    public List<MateriaResponseDTO> listMaterias() {
        List<MateriaEntity> materias = materiaRepository.findAll();
        return materias.stream()
                .map(materiaMapper::toDTO)
                .collect(Collectors.toList());
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
