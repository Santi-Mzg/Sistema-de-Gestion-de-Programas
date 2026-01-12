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

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;



@Service
public class ProgramaServiceImpl implements ProgramaService {

    private final ProgramaRepository programaRepository;
    private final DecisionComisionRepository decisionRepository;
    private final MateriaService materiaService;
    private final UserService userService;
    private final CarreraService carreraService;
    private final UsuarioDepartamentoService udeService;


    private final ProgramaResponseMapper responseMapper;
    private final ProgramaCargaMapper programaMapper;
    private final ProgramaCarreraMapper programaCarreraMapper;


    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               DecisionComisionRepository decisionRepository,
                               MateriaService materiaService,
                               UserService userService,
                               CarreraService carreraService,
                               UsuarioDepartamentoService udeService,
                               ProgramaResponseMapper responseMapper,
                               ProgramaCargaMapper programaMapper,
                               ProgramaCarreraMapper programaCarreraMapper) {

        this.programaRepository = programaRepository;
        this.decisionRepository = decisionRepository;
        this.materiaService = materiaService;
        this.userService = userService;
        this.carreraService = carreraService;
        this.udeService = udeService;
        this.responseMapper = responseMapper;
        this.programaMapper = programaMapper;
        this.programaCarreraMapper = programaCarreraMapper;
    }


    @Override
    @Transactional
    public ProgramaResponseDTO create(ProgramaCargaDTO programaDTO, UserEntity actor){
        if (programaRepository.existsByMateriaIdAndAnio(programaDTO.getMateriaId(), programaDTO.getAnio())) {
            throw new IllegalStateException("Ya existe un programa registrado para esta materia en el año " + programaDTO.getAnio());
        }

        ProgramaEntity programaEntity = programaMapper.toEntity(programaDTO);

        MateriaEntity materia = materiaService.getEntityById(programaDTO.getMateriaId());

        Long dptoId = materia.getDepartamento().getId();
        String dptoName = materia.getDepartamento().getNombre();

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


        List<ProgramaCarreraCreateDTO> bloquesMultiplesDTO = programaDTO.getBloqueMultiple();
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

        programaEntity.registrarNuevoEstado(estado, actor, Rol.ADMINISTRACION, dptoName, null);

        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);
        return responseMapper.toDTO(createdProgramaEntity);
    }

    @Override
    @Transactional
    public ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaDTO programaDTO, UserEntity actor) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Long dptoId = existingProgram.getMateria().getDepartamento().getId();
        String dptoName = existingProgram.getMateria().getDepartamento().getNombre();

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
                    existingProgram.getBloqueMultiple().clear();
                    existingProgram.getBloqueMultiple().addAll(bloquesMultiplesEntity);
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
            existingProgram.registrarNuevoEstado(EstadoPrograma.COMPLETO_POR_ADMINISTRACION, actor, Rol.ADMINISTRACION, dptoName, null);
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return responseMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaDTO programaDTO, UserEntity actor) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        Long deptId = existingProgram.getMateria().getDepartamento().getId();
        String deptName = existingProgram.getMateria().getDepartamento().getNombre();

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
            existingProgram.registrarNuevoEstado(EstadoPrograma.COMPLETO_POR_PROFESOR, actor, Rol.DOCENTE, deptName, null);

            // 1. Obtener coordinadores únicos de todas las carreras involucradas
            Set<UsuarioDepartamentoEntity> coordinadores = existingProgram.getBloqueMultiple().stream()
                    .map(pc -> pc.getCarreraPlan().getCarrera().getComision())
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            // 2. Crear registros de decisión pendientes y enviar mails
            for (UsuarioDepartamentoEntity coord : coordinadores) {
                DecisionComisionEntity decision = new DecisionComisionEntity();
                decision.setPrograma(existingProgram);
                decision.setComision(coord);
                decision.setAprobado(false); // Aún no aprobó
                decisionRepository.save(decision);

//                emailService.notificarCoordinador(coord.getUsuario().getEmail(), existingProgram.getId());
            }
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);
        return responseMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProgramaResponseDTO actualizarEstado(Authentication auth, Long deptId, Long programId, EstadoUpdateDTO estadoUpdateDTO, Rol rolActivo) {
        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);


        if ((rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR) || rolActivo.equals(Rol.DOCENTE)) && !udeActor.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        ProgramaEntity programa = programaRepository.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        UserEntity actor = userService.getEntityByLegajo(auth.getName());
        String deptName = udeActor.getDepartamento().getNombre();

        switch (rolActivo) {
            case DOCENTE:
                procesarDecisionDocente(programa, estadoUpdateDTO, actor, deptName);
                break;

            case COORDINACION_COMISION_CURRICULAR:
                procesarDecisionCoordinador(programa, estadoUpdateDTO, actor, deptName);
                break;

            case SECRETARIA:
                procesarDecisionSecretaria(programa, estadoUpdateDTO, actor, deptName);
                break;

            default:
                throw new IllegalArgumentException("Acción inválida");
        }

        programaRepository.save(programa);

        return responseMapper.toDTO(programa);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramaResponseDTO getById(Long id) {
        ProgramaEntity foundProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        return responseMapper.toDTO(foundProgram);
    }

    @Override
    @Transactional(readOnly = true)
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
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

        if (!ude.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        List<ProgramaEntity> programs = new ArrayList<>();


        // 1. Si soy Admin, Director, Secretario o Administrativo veo todos los programas del departamento
        if (rolActivo.equals(Rol.SYSTEM_ADMIN) || rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.DIRECCION_ADMINISTRATIVA) || rolActivo.equals(Rol.ADMINISTRACION)) {
            programs = programaRepository.findByMateriaDepartamentoId(deptId);
        }

        // 2. Si es coordinador ve los programas de la carrera
        else if (rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR)) {
            programs = programaRepository.findProgramasByCoordinadorLegajo(auth.getName());
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
    @Transactional
    public void delete(Long id) {
        programaRepository.deleteById(id);
    }


    private void procesarDecisionDocente(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor, String deptName) {

        switch (estadoUpdateDTO.getAccion()) {
            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, actor, Rol.DOCENTE, deptName);
                break;

            case APROBAR:
                throw new IllegalArgumentException("Un DOCENTE no tiene la opcion de APROBAR");
        }
    }

    private void procesarDecisionCoordinador(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor, String deptName) {

        // 1. Buscar la decisión de este coordinador específico
        DecisionComisionEntity decision = decisionRepository.findByProgramaIdAndComisionUsuarioId(programa.getId(), actor.getId())
                .orElseThrow(() -> new IllegalStateException("Usted no es coordinador de este programa"));

        switch (estadoUpdateDTO.getAccion()) {
            case APROBAR:
                decision.setAprobado(true);
                decision.setFechaDecision(LocalDateTime.now());
                decisionRepository.save(decision);

                // 2. ¿Todos los coordinadores involucrados han aprobado?
                long pendientes = decisionRepository.countByProgramaIdAndAprobadoFalse(programa.getId());

                if (pendientes == 0) {
                    // SOLO AQUÍ cambiamos el estado global
                    programa.registrarNuevoEstado(EstadoPrograma.APROBADO_POR_COMISION, actor, Rol.COORDINACION_COMISION_CURRICULAR, deptName, "Aprobación unánime de comisiones");
                    programaRepository.save(programa);
                }

                break;

            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, actor, Rol.COORDINACION_COMISION_CURRICULAR, deptName);
                decisionRepository.deleteByProgramaId(programa.getId());
                break;

        }
    }

    private void procesarDecisionSecretaria(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor, String deptName) {

        switch (estadoUpdateDTO.getAccion()) {
            case APROBAR:
                programa.registrarNuevoEstado(EstadoPrograma.APROBADO_POR_SECRETARIA, actor, Rol.SECRETARIA, deptName, null);
                break;

            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, actor, Rol.SECRETARIA, deptName);
                break;

        }
    }


    private void rechazar(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UserEntity actor, Rol actorRol, String deptName) {

        Rol destinoRechazo = estadoUpdateDTO.getDestinoRechazo();

        if (destinoRechazo == null) {
            throw new IllegalArgumentException("Debe especificar destino al rechazar");
        }

        EstadoPrograma nuevoEstado = switch (destinoRechazo) {
            case Rol.ADMINISTRACION -> EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
            case Rol.DOCENTE -> EstadoPrograma.RECHAZADO_A_PROFESOR;
            default ->
                    throw new IllegalArgumentException("No se puede realizar la acción de rechazar a menos que sea a ADMINISTRACION o a PROFESOR");
        };

        programa.registrarNuevoEstado(nuevoEstado, actor, actorRol, deptName, estadoUpdateDTO.getJustificacion());

    }

    private List<ProgramaCarreraEntity> getProgramaCarreraEntities(List<ProgramaCarreraCreateDTO> bloquesMultiplesDTO, ProgramaEntity programaEntity) {
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = new ArrayList<>();

        for (ProgramaCarreraCreateDTO bloqueDTO : bloquesMultiplesDTO) {
            ProgramaCarreraEntity bloqueEntity = programaCarreraMapper.toEntity(bloqueDTO);
            bloqueEntity.setPrograma(programaEntity);

            CarreraPlanEntity plan = carreraService.getPlanEntityById(bloqueDTO.getCarreraPlanId());

            bloqueEntity.setCarreraPlan(plan);
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