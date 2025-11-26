package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoUpdateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaAdministrativoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaCargaProfesorDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;



@Service
public class ProgramaServiceImpl implements ProgramaService {

    private final ProgramaRepository programaRepository;
    private final HistorialRepository historialRepository;
    private final MateriaRepository materiaRepository;
    private final UserRepository userRepository;
    private final CarreraRepository carreraRepository;
    private final ProgramaMapper programaMapper;

    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               HistorialRepository historialRepository,
                               MateriaRepository materiaRepository,
                               UserRepository userRepository,
                               CarreraRepository carreraRepository,
                               ProgramaMapper programaMapper) {
        this.programaRepository = programaRepository;
        this.materiaRepository = materiaRepository;
        this.userRepository = userRepository;
        this.carreraRepository = carreraRepository;
        this.historialRepository = historialRepository;
        this.programaMapper = programaMapper;
    }


    @Override
    public ProgramaResponseDTO createPrograma(ProgramaCargaAdministrativoDTO programaDTO){
        ProgramaEntity programaEntity = programaMapper.toEntity(programaDTO);

        MateriaEntity materia = materiaRepository.findById(programaDTO.getMateriaId())
                .orElseThrow(
                        () -> new EntityNotFoundException("La Materia con ID " + programaDTO.getMateriaId() + "no fue encontrada.")
                );

        programaEntity.setMateria(materia);

        UserEntity profesorResponsable = userRepository.findById(programaDTO.getProfesorResponsableId())
                .orElseThrow(
                        () -> new EntityNotFoundException("El profesor con ID " + programaDTO.getProfesorResponsableId() + "no fue encontrado.")
                );

        programaEntity.setProfesorResponsable(profesorResponsable);

//        List<CarreraEntity> carreras = carreraRepository.findAllById(programaDTO.getCarrerasIds());
//        if(programaDTO.getCarrerasIds().size() != carreras.size()){
//            throw new EntityNotFoundException("Una o más carreras especificadas no fueron encontradas. Por favor, verifica los IDs.");
//        }

        EstadoPrograma nuevoEstado = EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION;

        boolean completoAdministracion =
                programaEntity.getCargaHorariaPractica() != null &&
                        programaEntity.getFundamentacion() != null &&
                        programaEntity.getObjetivos() != null &&
                        programaEntity.getProgramaAnalitico() != null &&
                        programaEntity.getMetodologia() != null &&
                        programaEntity.getModalidadEvaluacion() != null &&
                        programaEntity.getBibliografia() != null;

        if (completoAdministracion) {
            nuevoEstado = EstadoPrograma.COMPLETO_POR_ADMINISTRACION;
        }
        programaEntity.registrarNuevoEstado(estado);

        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);

        return programaMapper.toDTO(createdProgramaEntity);
    }

    @Override
    public ProgramaResponseDTO updatePrograma(Long id, ProgramaCargaAdministrativoDTO programaDTO) {
        if(!programaRepository.existsById(id)) {
            throw new EntityNotFoundException("La entidad con ID " + id + " no fue encontrada.");
        }

        ProgramaEntity programaEntity = programaMapper.toEntity(programaDTO);
        ProgramaEntity savedProgramaEntity = programaRepository.save(programaEntity);

        return programaMapper.toDTO(savedProgramaEntity);
    }

    @Override
    public ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaProfesorDTO programaDTO) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        if (!existingProgram.getEstadoActual().equals(EstadoPrograma.COMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.INCOMPLETO_POR_PROFESOR)) {
            throw new IllegalStateException("El profesor no puede cargar datos en el estado actual.");
        }


        // Aplicar solo campos modificados (PATCH)
        Optional.ofNullable(programaDTO.getCargaHorariaPractica())
                .ifPresent(existingProgram::setCargaHorariaPractica);

        Optional.ofNullable(programaDTO.getFundamentacion())
                .ifPresent(existingProgram::setFundamentacion);

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

        EstadoPrograma nuevoEstado = EstadoPrograma.INCOMPLETO_POR_PROFESOR;

        boolean completoProfesor =
                existingProgram.getCargaHorariaPractica() != null &&
                        existingProgram.getDescripcion() != null &&
                        existingProgram.getObjetivos() != null &&
                        existingProgram.getProgramaAnalitico() != null &&
                        existingProgram.getMetodologia() != null &&
                        existingProgram.getModalidadEvaluacion() != null &&
                        existingProgram.getBibliografia() != null;

        if (completoProfesor) {
            nuevoEstado = EstadoPrograma.COMPLETO_POR_PROFESOR;
        }

        existingProgram.registrarNuevoEstado(nuevoEstado, null, null);

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return programaMapper.toDTO(saved);
    }

    @Override
    public ProgramaResponseDTO actualizarEstado(Long id, EstadoUpdateDTO estadoUpdateDTO) {
        ProgramaEntity programa = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        switch (estadoUpdateDTO.getAccion()) {

            case APROBAR:
                aprobar(programa);
                break;

            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO.getDestinoRechazo(), estadoUpdateDTO.getJustificacion());
                break;

            default:
                throw new IllegalArgumentException("Acción inválida");
        }

        programaRepository.save(programa);

        return programaMapper.toDTO(programa);
    }

    @Override
    public ProgramaResponseDTO getProgramaById(Long id) {
        ProgramaEntity foundProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        return programaMapper.toDTO(foundProgram);
    }

//    @Override
//    public List<EstadoHistoricoEntity> getHistorial(@PathVariable Long id) {
//        ProgramaEntity foundProgram = programaRepository.findById(id)
//                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));
//
//        return foundProgram.getHistorialEstados();
//    }

    @Override
    public List<ProgramaResponseDTO> listProgramas() {
        List<ProgramaEntity> programs = programaRepository.findAll();
        return programs.stream()
                .map(programaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePrograma(Long id) {
        programaRepository.deleteById(id);
    }



    private void aprobar(ProgramaEntity programa) {
        EstadoPrograma estadoActual = programa.getEstadoActual();
        EstadoPrograma estadoNuevo;

        switch (estadoActual) {
            case COMPLETO_POR_PROFESOR:
                estadoNuevo = EstadoPrograma.APROBADO_POR_COMISION;
                break;

            case APROBADO_POR_COMISION:
                estadoNuevo = EstadoPrograma.APROBADO_POR_SECRETARIA;
                break;

            default:
                throw new IllegalArgumentException("No se puede realizar la acción de aprobar en otro estado que no sea COMPLETO_POR_PROFESOR o APROBADO_POR_COMISION");
        }

        programa.registrarNuevoEstado(estadoNuevo, null, null);
    }

    private void rechazar(ProgramaEntity programa, Rol destinoRechazo, String justificacion) {

        if (destinoRechazo == null) {
            throw new IllegalArgumentException("Debe especificar destino al rechazar");
        }

        EstadoPrograma nuevoEstado = programa.getEstadoActual();

        switch (destinoRechazo) {
            case Rol.ADMINISTRATIVO:
                nuevoEstado = EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
                break;

            case Rol.PROFESOR:
                nuevoEstado = EstadoPrograma.RECHAZADO_A_PROFESOR;
                break;

            default:
                throw new IllegalArgumentException("No se puede realizar la acción de rechazar a menos que sea a ADMINISTRACION o a PROFESOR");
        }

        programa.registrarNuevoEstado(nuevoEstado, null, justificacion);

    }

}
