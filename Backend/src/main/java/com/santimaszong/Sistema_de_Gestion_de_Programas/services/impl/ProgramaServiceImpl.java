package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
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
    private Mapper<ProgramaDTO, ProgramaEntity> programaMapper;

    public ProgramaServiceImpl(ProgramaRepository programaRepository, Mapper<ProgramaDTO, ProgramaEntity> programaMapper) {
        this.programaRepository = programaRepository;
        this.programaMapper = programaMapper;
    }


    @Override
    public ProgramaDTO createPrograma(ProgramaDTO programaDTO){
        ProgramaEntity programaEntity = programaMapper.mapTo(programaDTO);
        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);

        return programaMapper.mapFrom(createdProgramaEntity);
    }

    @Override
    public ProgramaDTO updatePrograma(Long id, ProgramaDTO programaDTO) {
        if(!programaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        ProgramaEntity programaEntity = programaMapper.mapTo(programaDTO);
        ProgramaEntity savedProgramaEntity = programaRepository.save(programaEntity);

        return programaMapper.mapFrom(savedProgramaEntity);
    }

    @Override
    public ProgramaDTO profesorCarga(Long id, ProgramaDTO programaDTO) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.COMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstado().equals(EstadoPrograma.INCOMPLETO_POR_PROFESOR)) {
            throw new IllegalStateException("El profesor no puede cargar datos en el estado actual.");
        }


        // Aplicar solo campos modificados (PATCH)
        Optional.ofNullable(programaDTO.getCargaHorariaPractica())
                .ifPresent(existingProgram::setCargaHorariaPractica);

        Optional.ofNullable(programaDTO.getDescripcion())
                .ifPresent(existingProgram::setDescripcion);

        Optional.ofNullable(programaDTO.getObjetivos())
                .ifPresent(existingProgram::setObjetivos);

        Optional.ofNullable(programaDTO.getProgramaAnalitico())
                .ifPresent(existingProgram::setProgramaAnalitico);

        Optional.ofNullable(programaDTO.getMetodologia())
                .ifPresent(existingProgram::setMetodologia);

        Optional.ofNullable(programaDTO.getModalidadEvaluacion())
                .ifPresent(existingProgram::setModalidadEvaluacion);

        Optional.ofNullable(programaDTO.getBibliografia())
                .ifPresent(existingProgram::setBibliografia);

        // ----------------------------------------------------------
        // EVALUAR SI TODOS LOS CAMPOS OBLIGATORIOS ESTÁN COMPLETOS
        // ----------------------------------------------------------

        boolean completoProfesor =
                existingProgram.getCargaHorariaPractica() != null &&
                existingProgram.getDescripcion() != null &&
                existingProgram.getObjetivos() != null &&
                existingProgram.getProgramaAnalitico() != null &&
                existingProgram.getMetodologia() != null &&
                existingProgram.getModalidadEvaluacion() != null &&
                existingProgram.getBibliografia() != null;

        if (completoProfesor) {
            existingProgram.setEstado(EstadoPrograma.COMPLETO_POR_PROFESOR);
        } else {
            existingProgram.setEstado(EstadoPrograma.INCOMPLETO_POR_PROFESOR);
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return programaMapper.mapFrom(saved);
    }

    @Override
    public Void profesorRechazarAAdministracion(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.COMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstado().equals(EstadoPrograma.INCOMPLETO_POR_PROFESOR)) {
            throw new IllegalStateException("El profesor no puede rechazar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.RECHAZADO_A_ADMINISTRACION_POR_PROFESOR);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Void comisionAprobar(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.COMPLETO_POR_PROFESOR)) {
            throw new IllegalStateException("El coordinador no puede aprobar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.APROBADO_POR_COMISION);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Void comisionRechazarAAdministracion(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.COMPLETO_POR_PROFESOR)) {
            throw new IllegalStateException("El coordinador no puede rechazar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.RECHAZADO_A_ADMINISTRACION_POR_COMISION);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Void comisionRechazarAProfesor(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.COMPLETO_POR_PROFESOR)) {
            throw new IllegalStateException("El coordinador no puede rechazar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.RECHAZADO_A_PROFESOR_POR_COMISION);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Void secretariaAprobar(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.APROBADO_POR_COMISION)) {
            throw new IllegalStateException("El secretario no puede aprobar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.APROBADO_POR_SECRETARIA);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Void secretariaRechazarAAdministracion(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.APROBADO_POR_COMISION)) {
            throw new IllegalStateException("El secretario no puede rechazar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.RECHAZADO_A_ADMINISTRACION_POR_SECRETARIA);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Void secretariaRechazarAProfesor(Long id) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programa no existente"));

        if (!existingProgram.getEstado().equals(EstadoPrograma.APROBADO_POR_COMISION)) {
            throw new IllegalStateException("El secretario no puede rechazar en el estado actual.");
        }

        existingProgram.setEstado(EstadoPrograma.RECHAZADO_A_PROFESOR_POR_SECRETARIA);

        programaRepository.save(existingProgram);

        return null;
    }

    @Override
    public Optional<ProgramaDTO> getProgramaById(Long id) {
        Optional<ProgramaEntity> foundProgram = programaRepository.findById(id);

        return foundProgram.map(programaMapper::mapFrom);
    }

    @Override
    public List<ProgramaDTO> listProgramas() {
        List<ProgramaEntity> programs = programaRepository.findAll();
        return programs.stream()
                .map(programaMapper::mapFrom)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePrograma(Long id) {
        programaRepository.deleteById(id);
    }
}
