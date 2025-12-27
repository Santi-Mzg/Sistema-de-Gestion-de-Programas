package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCargaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;



@Service
public class ProgramaServiceImpl implements ProgramaService {

    private final ProgramaRepository programaRepository;
    private final MateriaService materiaService;
    private final UserService userService;
    private final CarreraService carreraService;
    private final UsuarioDepartamentoService udeService;


    private final ProgramaResponseMapper responseMapper;
    private final ProgramaCargaMapper programaMapper;
    private final ProgramaCarreraMapper programaCarreraMapper;


    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               MateriaService materiaService,
                               UserService userService,
                               CarreraService carreraService,
                               UsuarioDepartamentoService udeService,
                               ProgramaResponseMapper responseMapper,
                               ProgramaCargaMapper programaMapper,
                               ProgramaCarreraMapper programaCarreraMapper) {

        this.programaRepository = programaRepository;
        this.materiaService = materiaService;
        this.userService = userService;
        this.carreraService = carreraService;
        this.udeService = udeService;
        this.responseMapper = responseMapper;
        this.programaMapper = programaMapper;
        this.programaCarreraMapper = programaCarreraMapper;
    }


    @Override
    public ProgramaResponseDTO create(ProgramaCargaDTO programaDTO, UserEntity actor){
        ProgramaEntity programaEntity = programaMapper.toEntity(programaDTO);

        MateriaEntity materia = materiaService.getEntityById(programaDTO.getMateriaId());

        Long dptoId = materia.getDepartamento().getId();
        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioIdAndDepartamentoId(actor.getId(), dptoId);
        if(!udeActor.hasRole(Rol.ADMINISTRACION)){
            throw new IllegalStateException("El usuario no tiene rol ADMINISTRATIVO");
        }

        programaEntity.setMateria(materia);

        UserEntity profesorResponsable = userService.getEntityById(programaDTO.getProfesorResponsableId());
        UsuarioDepartamentoEntity udeProfesor = udeService.findByUsuarioIdAndDepartamentoId(profesorResponsable.getId(), dptoId);
        if(!udeProfesor.hasRole(Rol.DOCENTE)){
            throw new IllegalStateException("El usuario elegido como profesor no tiene rol DOCENTE");
        }


        programaEntity.setProfesorResponsable(udeProfesor);


        List<ProgramaCarreraDTO> bloquesMultiplesDTO = programaDTO.getBloqueMultiple();
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = getProgramaCarreraEntities(bloquesMultiplesDTO, programaEntity);

        programaEntity.setBloqueMultiple(bloquesMultiplesEntity);

        EstadoPrograma estado = EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION;

        boolean completoAdministracion =
                programaEntity.getCargaHorariaTotal() != null &&
                        programaEntity.getCargaHorariaSemanal() != null &&
                        programaEntity.getCreditos() != null &&
                        programaEntity.getCantidadSemanas() != null &&
                        programaEntity.getMateria() != null &&
                        programaEntity.getProfesorResponsable() != null &&
                        programaEntity.getBloqueMultiple() != null;

        if (completoAdministracion) {
            estado = EstadoPrograma.COMPLETO_POR_ADMINISTRACION;
        }

        programaEntity.registrarNuevoEstado(estado, profesorResponsable, null);

        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);
        return responseMapper.toDTO(createdProgramaEntity);
    }

    @Override
    public ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaDTO programaDTO, UserEntity actor) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Long dptoId = existingProgram.getMateria().getDepartamento().getId();
        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioIdAndDepartamentoId(actor.getId(), dptoId);

        if(!udeActor.hasRole(Rol.ADMINISTRACION)) {
            throw new IllegalStateException("El usuario no tiene rol ADMINISTRATIVO");
        }


        if (!existingProgram.getEstadoActual().equals(EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.RECHAZADO_A_ADMINISTRACION)) {
            throw new IllegalStateException("El administrativo no puede cargar datos en el estado actual.");
        }

        // Aplicar solo campos modificados (PATCH)
        Optional.ofNullable(programaDTO.getMateriaId())
                .ifPresent(materiaId -> {
                    MateriaEntity materiaActual = existingProgram.getMateria();
                    if(materiaActual != null && materiaActual.getId().equals(materiaId))
                        return; // Si es el mismo no lo cambia

                    MateriaEntity nuevaMateria = materiaService.getEntityById(materiaId);

                    existingProgram.setMateria(nuevaMateria);
                });

        Optional.ofNullable(programaDTO.getProfesorResponsableId())
                .ifPresent(profesorId -> {
                    UserEntity profesorActual = existingProgram.getProfesorResponsable().getUsuario();
                    if(profesorActual != null && profesorActual.getId().equals(profesorId))
                        return; // Si es el mismo no lo cambia

                    UsuarioDepartamentoEntity udeProfesorNuevo = udeService.findByUsuarioIdAndDepartamentoId(profesorId, dptoId);

                    if(!udeProfesorNuevo.hasRole(Rol.DOCENTE)){
                        throw new IllegalStateException("El usuario elegido como profesor no tiene rol DOCENTE");
                    }

                    existingProgram.setProfesorResponsable(udeProfesorNuevo);
                });

        Optional.ofNullable(programaDTO.getBloqueMultiple())
                .ifPresent(bloquesMultiplesDTO -> {
                    List<ProgramaCarreraEntity> bloquesMultiplesEntity = getProgramaCarreraEntities(bloquesMultiplesDTO, existingProgram);
                    existingProgram.setBloqueMultiple(bloquesMultiplesEntity);
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


        boolean completoAdministrativo =
                existingProgram.getMateria() != null &&
                        existingProgram.getProfesorResponsable() != null &&
                        existingProgram.getBloqueMultiple() != null &&
                        existingProgram.getCargaHorariaTotal() != null &&
                        existingProgram.getCargaHorariaSemanal() != null &&
                        existingProgram.getCreditos() != null &&
                        existingProgram.getCantidadSemanas() != null;

        if (completoAdministrativo) {
            existingProgram.registrarNuevoEstado(EstadoPrograma.COMPLETO_POR_ADMINISTRACION, actor, null);
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return responseMapper.toDTO(saved);
    }

    @Override
    public ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaDTO programaDTO, UserEntity actor) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Long deptId = existingProgram.getMateria().getDepartamento().getId();
        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioIdAndDepartamentoId(actor.getId(), deptId);
        if(!udeActor.hasRole(Rol.DOCENTE)) {
            throw new IllegalStateException("El usuario no tiene rol DOCENTE");
        }

        if (!existingProgram.getEstadoActual().equals(EstadoPrograma.COMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.INCOMPLETO_POR_PROFESOR)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.RECHAZADO_A_PROFESOR)) {
            throw new IllegalStateException("El profesor no puede cargar datos en el estado actua;l.");
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


        boolean completoProfesor =
                existingProgram.getCargaHorariaPractica() != null &&
                        existingProgram.getFundamentacion() != null &&
                        existingProgram.getObjetivos() != null &&
                        existingProgram.getProgramaAnalitico() != null &&
                        existingProgram.getMetodologia() != null &&
                        existingProgram.getModalidadEvaluacion() != null &&
                        existingProgram.getBibliografia() != null;

        if (completoProfesor) {
            existingProgram.registrarNuevoEstado(EstadoPrograma.COMPLETO_POR_PROFESOR, actor, null);
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return responseMapper.toDTO(saved);
    }

    @Override
    public ProgramaResponseDTO actualizarEstado(Long id, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor) {
        ProgramaEntity programa = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Long dptoId = programa.getMateria().getDepartamento().getId();
        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioIdAndDepartamentoId(actor.getId(), dptoId);

        if(!udeActor.hasAnyRole(Rol.SECRETARIA, Rol.COORDINACION_COMISION_CURRICULAR)) {
            throw new IllegalStateException("El usuario no tiene rol SECRETARIO ni COORDINADOR");
        }

        switch (estadoUpdateDTO.getAccion()) {

            case APROBAR:
                aprobar(programa, actor);
                break;

            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, actor);
                break;

            default:
                throw new IllegalArgumentException("Acción inválida");
        }

        programaRepository.save(programa);

        return responseMapper.toDTO(programa);
    }

    @Override
    public ProgramaResponseDTO getById(Long id) {
        ProgramaEntity foundProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        return responseMapper.toDTO(foundProgram);
    }

    @Override
    public ProgramaResponseDTO getProgramaVigenteByMateria(Long materiaId) {
        ProgramaEntity foundProgram = programaRepository.findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
                    materiaId,
                    EstadoPrograma.APROBADO_POR_SECRETARIA
                ).orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        return responseMapper.toDTO(foundProgram);
    }


    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseDTO> getList(Authentication auth, Long deptId, Long carreraId, Rol rolActivo) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_SYSTEM_ADMIN"));


        if (!isAdmin){ // Si no es admin checkea roles en dept
            UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

            if (!ude.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
                throw new AccessDeniedException("No autorizado");
            }
        }


        List<ProgramaEntity> programs = new ArrayList<>();


        // 1. Si soy Admin, Director, Secretario o Administrativo veo todos los programas del departamento
        if (rolActivo.equals(Rol.SYSTEM_ADMIN) || rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.DIRECCION_ADMINISTRATIVA) || rolActivo.equals(Rol.ADMINISTRACION)) {
            programs = programaRepository.findByMateriaDepartamentoId(deptId);
        }

        // 2. Si es coordinador ve los programas de la carrera
        else if (rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR) && carreraId != null) {
            programs = programaRepository.findByBloqueMultipleCarreraId(carreraId);
        }
        // 3. Si es profesor ve los programas que tiene asignados
        else if (rolActivo.equals(Rol.DOCENTE) ) {
            programs = programaRepository.findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoId(auth.getName(), deptId);
        }

        return programs.stream()
                .map(responseMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseDTO> listAll() {
        List<ProgramaEntity> programs = programaRepository.findAll();
        return programs.stream()
                .map(responseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(Long id) {
        programaRepository.deleteById(id);
    }

    private void aprobar(ProgramaEntity programa, UserEntity actor) {
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

        programa.registrarNuevoEstado(estadoNuevo, actor, null);
    }

    private void rechazar(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor) {

        Rol destinoRechazo = estadoUpdateDTO.getDestinoRechazo();

        if (destinoRechazo == null) {
            throw new IllegalArgumentException("Debe especificar destino al rechazar");
        }

        EstadoPrograma nuevoEstado = programa.getEstadoActual();

        switch (destinoRechazo) {
            case Rol.ADMINISTRACION:
                nuevoEstado = EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
                break;

            case Rol.DOCENTE:
                nuevoEstado = EstadoPrograma.RECHAZADO_A_PROFESOR;
                break;

            default:
                throw new IllegalArgumentException("No se puede realizar la acción de rechazar a menos que sea a ADMINISTRACION o a PROFESOR");
        }

        programa.registrarNuevoEstado(nuevoEstado, actor, estadoUpdateDTO.getJustificacion());

    }

    private List<ProgramaCarreraEntity> getProgramaCarreraEntities(List<ProgramaCarreraDTO> bloquesMultiplesDTO, ProgramaEntity programaEntity) {
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = new ArrayList<>();

        for (ProgramaCarreraDTO bloqueDTO : bloquesMultiplesDTO) {
            ProgramaCarreraEntity bloqueEntity = programaCarreraMapper.toEntity(bloqueDTO);
            bloqueEntity.setPrograma(programaEntity);

            CarreraEntity carrera = carreraService.getEntityById(bloqueDTO.getCarreraId());

            bloqueEntity.setCarrera(carrera);

            List<MateriaEntity> correlativasFuertes = materiaService.listEntities(bloqueDTO.getCorrelativasFuertesIds());
            if(bloqueDTO.getCorrelativasFuertesIds().size() != correlativasFuertes.size()){
                throw new EntityNotFoundException("Una o más materias correlativas fuertes especificadas no fueron encontradas. Por favor, verifica los IDs.");
            }

            List<MateriaEntity> correlativasDebiles = materiaService.listEntities(bloqueDTO.getCorrelativasDebilesIds());
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