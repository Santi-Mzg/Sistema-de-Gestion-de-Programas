package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.ProgramRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProgramServiceImpl implements ProgramService {

    private ProgramRepository programRepository;
    private Mapper<ProgramDTO, ProgramEntity> programMapper;

    public ProgramServiceImpl(ProgramRepository programRepository, Mapper<ProgramDTO, ProgramEntity> programMapper) {
        this.programRepository = programRepository;
        this.programMapper = programMapper;
    }


    @Override
    public ProgramDTO createProgram(ProgramDTO programDTO){
        ProgramEntity programEntity = programMapper.mapTo(programDTO);
        ProgramEntity createdProgramEntity = programRepository.save(programEntity);

        return programMapper.mapFrom(createdProgramEntity);
    }

    @Override
    public Optional<ProgramDTO> getProgramById(Long id) {
        Optional<ProgramEntity> foundProgram = programRepository.findById(id);

        return foundProgram.map(programMapper::mapFrom);
    }

    @Override
    public List<ProgramDTO> listPrograms() {
        List<ProgramEntity> programs = programRepository.findAll();
        return programs.stream()
                .map(programMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public ProgramDTO updateProgram(Long id, ProgramDTO programDTO) {
        if(!programRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        ProgramEntity programEntity = programMapper.mapTo(programDTO);
        ProgramEntity savedProgramEntity = programRepository.save(programEntity);

        return programMapper.mapFrom(savedProgramEntity);
    }

    @Override
    public void deleteProgram(Long id) {
        programRepository.deleteById(id);
    }
}
