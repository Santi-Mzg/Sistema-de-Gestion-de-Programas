package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.ProgramaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProgramaServiceImpl implements ProgramaService {

    private ProgramaRepository programaRepository;
    private Mapper<ProgramaDTO, ProgramaEntity> programMapper;

    public ProgramaServiceImpl(ProgramaRepository programaRepository, Mapper<ProgramaDTO, ProgramaEntity> programMapper) {
        this.programaRepository = programaRepository;
        this.programMapper = programMapper;
    }


    @Override
    public ProgramaDTO createProgram(ProgramaDTO programaDTO){
        ProgramaEntity programaEntity = programMapper.mapTo(programaDTO);
        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);

        return programMapper.mapFrom(createdProgramaEntity);
    }

    @Override
    public Optional<ProgramaDTO> getProgramById(Long id) {
        Optional<ProgramaEntity> foundProgram = programaRepository.findById(id);

        return foundProgram.map(programMapper::mapFrom);
    }

    @Override
    public List<ProgramaDTO> listPrograms() {
        List<ProgramaEntity> programs = programaRepository.findAll();
        return programs.stream()
                .map(programMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public ProgramaDTO updateProgram(Long id, ProgramaDTO programaDTO) {
        if(!programaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        ProgramaEntity programaEntity = programMapper.mapTo(programaDTO);
        ProgramaEntity savedProgramaEntity = programaRepository.save(programaEntity);

        return programMapper.mapFrom(savedProgramaEntity);
    }

    @Override
    public void deleteProgram(Long id) {
        programaRepository.deleteById(id);
    }
}
