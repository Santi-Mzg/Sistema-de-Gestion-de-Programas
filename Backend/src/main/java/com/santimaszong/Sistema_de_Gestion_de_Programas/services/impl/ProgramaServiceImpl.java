package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCargaAdministradorMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCargaProfesorMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
    private final ProgramaCarreraRepository programaCarreraRepository;

    private final ProgramaResponseMapper responseMapper;
    private final ProgramaCargaAdministradorMapper adminMapper;
    private final ProgramaCargaProfesorMapper profesorMapper;
    private final ProgramaCarreraMapper programaCarreraMapper;


    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               HistorialRepository historialRepository,
                               MateriaRepository materiaRepository,
                               UserRepository userRepository,
                               CarreraRepository carreraRepository,
                               ProgramaCarreraRepository programaCarreraRepository,
                               ProgramaResponseMapper responseMapper,
                               ProgramaCargaAdministradorMapper adminMapper,
                               ProgramaCargaProfesorMapper profesorMapper,
                               ProgramaCarreraMapper programaCarreraMapper) {

        this.programaRepository = programaRepository;
        this.materiaRepository = materiaRepository;
        this.userRepository = userRepository;
        this.carreraRepository = carreraRepository;
        this.programaCarreraRepository = programaCarreraRepository;
        this.historialRepository = historialRepository;
        this.responseMapper = responseMapper;
        this.adminMapper = adminMapper;
        this.profesorMapper = profesorMapper;
        this.programaCarreraMapper = programaCarreraMapper;
    }


    @Override
    public ProgramaResponseDTO createPrograma(ProgramaCargaAdministrativoDTO programaDTO){
        ProgramaEntity programaEntity = adminMapper.toEntity(programaDTO);

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


        List<ProgramaCarreraCreateDTO> bloquesMultiplesDTO = programaDTO.getCarreras();
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = getProgramaCarreraEntities(bloquesMultiplesDTO, programaEntity);

        programaEntity.setCarreras(bloquesMultiplesEntity);


        EstadoPrograma nuevoEstado = EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION;

        boolean completoAdministracion =
                programaEntity.getCargaHorariaTotal() != null &&
                        programaEntity.getCargaHorariaSemanal() != null &&
                        programaEntity.getCreditos() != null &&
                        programaEntity.getCantidadSemanas() != null &&
                        programaEntity.getMateria() != null &&
                        programaEntity.getProfesorResponsable() != null &&
                        programaEntity.getCarreras() != null;

        if (completoAdministracion) {
            nuevoEstado = EstadoPrograma.COMPLETO_POR_ADMINISTRACION;
        }
        programaEntity.registrarNuevoEstado(nuevoEstado, null, null);

        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);

        return responseMapper.toDTO(createdProgramaEntity);
    }

    @Override
    public ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaAdministrativoDTO programaDTO) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        if (!existingProgram.getEstadoActual().equals(EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.RECHAZADO_A_ADMINISTRACION)) {
            throw new IllegalStateException("El administrativo no puede cargar datos en el estado actual.");
        }

        // Aplicar solo campos modificados (PATCH)
        Optional.ofNullable(programaDTO.getMateriaId())
                .ifPresent(materiaId -> {
                    MateriaEntity materiaActual = existingProgram.getMateria();
                    if(materiaActual != null && materiaActual.getId().equals(materiaId))
                        return;

                    MateriaEntity nuevaMateria = materiaRepository.findById(materiaId)
                            .orElseThrow(() -> new EntityNotFoundException("Materia no encontrada"));

                    existingProgram.setMateria(nuevaMateria);
                });

        Optional.ofNullable(programaDTO.getProfesorResponsableId())
                .ifPresent(profesorId -> {
                    UserEntity profesorActual = existingProgram.getProfesorResponsable();
                    if(profesorActual != null && profesorActual.getId().equals(profesorId))
                        return;

                    UserEntity profesorNuevo = userRepository.findById(profesorId)
                            .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

                    existingProgram.setProfesorResponsable(profesorNuevo);
                });

        Optional.ofNullable(programaDTO.getCarreras())
                .ifPresent(bloquesMultiplesDTO -> {
                    List<ProgramaCarreraEntity> bloquesMultiplesEntity = getProgramaCarreraEntities(bloquesMultiplesDTO, existingProgram);
                    existingProgram.setCarreras(bloquesMultiplesEntity);
                });

        Optional.ofNullable(programaDTO.getCargaHorariaTotal())
                .ifPresent(existingProgram::setCargaHorariaTotal);

        Optional.ofNullable(programaDTO.getCargaHorariaSemanal())
                .ifPresent(existingProgram::setCargaHorariaSemanal);

        Optional.ofNullable(programaDTO.getCreditos())
                .ifPresent(existingProgram::setCreditos);

        Optional.ofNullable(programaDTO.getCantidadSemanas())
                .ifPresent(existingProgram::setCantidadSemanas);

        // ----------------------------------------------------------
        // EVALUAR SI TODOS LOS CAMPOS OBLIGATORIOS ESTÁN COMPLETOS
        // ----------------------------------------------------------

        EstadoPrograma nuevoEstado = EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION;

        boolean completoAdministrativo =
                existingProgram.getMateria() != null &&
                        existingProgram.getProfesorResponsable() != null &&
                        existingProgram.getCarreras() != null &&
                        existingProgram.getCargaHorariaTotal() != null &&
                        existingProgram.getCargaHorariaSemanal() != null &&
                        existingProgram.getCreditos() != null &&
                        existingProgram.getCantidadSemanas() != null;

        if (completoAdministrativo) {
            nuevoEstado = EstadoPrograma.COMPLETO_POR_ADMINISTRACION;
        }

        existingProgram.registrarNuevoEstado(nuevoEstado, null, null);

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return responseMapper.toDTO(saved);
    }

    @Override
    public ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaProfesorDTO programaDTO) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        if (!existingProgram.getEstadoActual().equals(EstadoPrograma.COMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.INCOMPLETO_POR_PROFESOR)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.RECHAZADO_A_PROFESOR)) {
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
                        existingProgram.getFundamentacion() != null &&
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
        return responseMapper.toDTO(saved);
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

        return responseMapper.toDTO(programa);
    }

    @Override
    public ProgramaResponseDTO getProgramaById(Long id) {
        ProgramaEntity foundProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        return responseMapper.toDTO(foundProgram);
    }

    @Override
    public List<ProgramaResponseDTO> listProgramas() {
        List<ProgramaEntity> programs = programaRepository.findAll();
        return programs.stream()
                .map(responseMapper::toDTO)
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

    private List<ProgramaCarreraEntity> getProgramaCarreraEntities(List<ProgramaCarreraCreateDTO> bloquesMultiplesDTO, ProgramaEntity programaEntity) {
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = new ArrayList<>();

        for (ProgramaCarreraCreateDTO bloqueDTO : bloquesMultiplesDTO) {
            ProgramaCarreraEntity bloqueEntity = programaCarreraMapper.toEntity(bloqueDTO);
            bloqueEntity.setPrograma(programaEntity);

            CarreraEntity carrera = carreraRepository.findById(bloqueDTO.getCarreraId())
                    .orElseThrow(() -> new EntityNotFoundException("Carrera no encontrada"));

            bloqueEntity.setCarrera(carrera);

            List<MateriaEntity> correlativasFuertes = materiaRepository.findAllById(bloqueDTO.getCorrelativasFuertesIds());
            if(bloqueDTO.getCorrelativasFuertesIds().size() != correlativasFuertes.size()){
                throw new EntityNotFoundException("Una o más materias correlativas fuertes especificadas no fueron encontradas. Por favor, verifica los IDs.");
            }

            List<MateriaEntity> correlativasDebiles = materiaRepository.findAllById(bloqueDTO.getCorrelativasDebilesIds());
            if(bloqueDTO.getCorrelativasDebilesIds().size() != correlativasDebiles.size()){
                throw new EntityNotFoundException("Una o más materias correlativas débiles especificadas no fueron encontradas. Por favor, verifica los IDs.");
            }

            bloqueEntity.setCorrelativasFuertes(correlativasFuertes);
            bloqueEntity.setCorrelativasDebiles(correlativasDebiles);

            bloquesMultiplesEntity.addLast(bloqueEntity);
        }
        return bloquesMultiplesEntity;
    }
}