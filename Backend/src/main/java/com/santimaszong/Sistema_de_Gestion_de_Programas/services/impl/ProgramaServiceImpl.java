package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCargaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseReducedMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;



@Service
public class ProgramaServiceImpl implements ProgramaService {

    private final ProgramaRepository programaRepository;
    private final ProgramaCarreraRepository programaCarreraRepository;
    private final ProgramaDraftRepository draftRepository;
    private final DecisionComisionRepository decisionRepository;
    private final MateriaService materiaService;
    private final UserService userService;
    private final CarreraService carreraService;
    private final UsuarioDepartamentoService udeService;
    private final EmailService emailService;



    private final ProgramaResponseMapper responseMapper;
    private final ProgramaResponseReducedMapper responseReducedMapper;
    private final ProgramaCargaMapper cargaMapper;
    private final ProgramaCarreraMapper programaCarreraMapper;


    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               ProgramaCarreraRepository programaCarreraRepository,
                               ProgramaDraftRepository draftRepository,
                               DecisionComisionRepository decisionRepository,
                               MateriaService materiaService,
                               UserService userService,
                               CarreraService carreraService,
                               UsuarioDepartamentoService udeService,
                               ProgramaResponseMapper responseMapper,
                               ProgramaResponseReducedMapper responseReducedMapper,
                               ProgramaCargaMapper cargaMapper,
                               ProgramaCarreraMapper programaCarreraMapper,
                               EmailService emailService) {

        this.programaRepository = programaRepository;
        this.programaCarreraRepository = programaCarreraRepository;
        this.draftRepository = draftRepository;
        this.decisionRepository = decisionRepository;
        this.materiaService = materiaService;
        this.userService = userService;
        this.carreraService = carreraService;
        this.udeService = udeService;
        this.responseMapper = responseMapper;
        this.responseReducedMapper = responseReducedMapper;
        this.cargaMapper = cargaMapper;
        this.programaCarreraMapper = programaCarreraMapper;
        this.emailService = emailService;
    }


    @Override
    @Transactional
    public ProgramaResponseDTO create(Long deptId, ProgramaCargaDTO programaDTO, UserEntity actor){
        Integer anioActual = LocalDate.now().getYear();

        if (programaRepository.existsByMateriaIdAndAnio(programaDTO.getMateriaId(), anioActual)) {
            programaRepository.deleteByMateriaIdAndAnio(programaDTO.getMateriaId(), anioActual);
            programaRepository.flush();
        }

        ProgramaEntity programaEntity = cargaMapper.toEntity(programaDTO);

        MateriaEntity materia = materiaService.getEntityById(programaDTO.getMateriaId());

        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioIdAndDepartamentoId(actor.getId(), deptId);
        if(!udeActor.hasRole(Rol.ADMINISTRACION)){
            throw new IllegalStateException("El usuario no tiene rol ADMINISTRATIVO");
        }

        programaEntity.setAnio(anioActual);

        programaEntity.setMateria(materia);

        UsuarioDepartamentoEntity udeProfesor = udeService.findByUsuarioIdAndDepartamentoId(programaDTO.getProfesorResponsableId(), deptId);
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
                        !programaEntity.getBloqueMultiple().isEmpty();

        if (completoAdministracion) {
            estado = EstadoPrograma.COMPLETO_POR_ADMINISTRACION;
        }

        programaEntity.registrarNuevoEstado(estado, udeActor, Rol.ADMINISTRACION, null);
        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);

        // EMAIL SEND
        UserEntity profesorResponsable = userService.getEntityById(programaDTO.getProfesorResponsableId());
        emailService.sendEmailNotificacionCargaAdministrativo(udeProfesor.getEmail(), profesorResponsable, materia);

        return responseMapper.toDTO(createdProgramaEntity);
    }

    @Override
    @Transactional
    public ProgramaResponseDTO administrativoCarga(Long deptId, Long id, ProgramaCargaDTO programaDTO, UserEntity actor) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));


        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioIdAndDepartamentoId(actor.getId(), deptId);

        if(!udeActor.hasRole(Rol.ADMINISTRACION)) {
            throw new IllegalStateException("El usuario no tiene rol ADMINISTRATIVO");
        }


        if (!existingProgram.getEstadoActual().equals(EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION)
                && !existingProgram.getEstadoActual().equals(EstadoPrograma.RECHAZADO_A_ADMINISTRACION)) {
            throw new IllegalStateException("El administrativo no puede cargar datos en el estado actual.");
        }

        // Aplicar solo campos modificados (PATCH)
        Optional.ofNullable(programaDTO.getProfesorResponsableId())
                .ifPresent(profesorId -> {
                    UserEntity profesorActual = existingProgram.getProfesorResponsable().getUsuario();
                    if(profesorActual != null && profesorActual.getId().equals(profesorId))
                        return; // Si es el mismo no lo cambia

                    UsuarioDepartamentoEntity udeProfesorNuevo = udeService.findByUsuarioIdAndDepartamentoId(profesorId, deptId);

                    if(!udeProfesorNuevo.hasRole(Rol.DOCENTE)){
                        throw new IllegalStateException("El usuario elegido como profesor no tiene rol DOCENTE");
                    }

                    existingProgram.setProfesorResponsable(udeProfesorNuevo);
                });

        Optional.ofNullable(programaDTO.getBloqueMultiple())
                .ifPresent(bloquesMultiplesDTO -> {
                    existingProgram.getBloqueMultiple().forEach(pc -> {
                        pc.getCorrelativasFuertes().clear();
                        pc.getCorrelativasDebiles().clear();
                    });

                    programaRepository.saveAndFlush(existingProgram);

                    existingProgram.getBloqueMultiple().clear();

                    programaRepository.saveAndFlush(existingProgram);

                    List<ProgramaCarreraEntity> bloquesMultiplesEntity = getProgramaCarreraEntities(bloquesMultiplesDTO, existingProgram);
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
            existingProgram.registrarNuevoEstado(EstadoPrograma.COMPLETO_POR_ADMINISTRACION, udeActor, Rol.ADMINISTRACION, null);
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);

        // EMAIL SEND
        UsuarioDepartamentoEntity udeProfesorResponsable = existingProgram.getProfesorResponsable();
        emailService.sendEmailNotificacionCargaAdministrativo(udeProfesorResponsable.getEmail(), udeProfesorResponsable.getUsuario(), existingProgram.getMateria());


        return responseMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProgramaResponseDTO profesorCarga(Long deptId, Long id, ProgramaCargaDTO programaDTO, UserEntity actor) {
        ProgramaEntity existingProgram = programaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));


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
            existingProgram.registrarNuevoEstado(EstadoPrograma.COMPLETO_POR_PROFESOR, udeActor, Rol.DOCENTE, null);

            // 2. Crear registros de decisión pendientes y enviar mails
            for (ProgramaCarreraEntity pg : existingProgram.getBloqueMultiple()) {
                DecisionComisionEntity decision = new DecisionComisionEntity();
                decision.setProgramaCarrera(pg);
                pg.setDecisionComision(decision);

                decision.setAprobado(false); // Aún no aprobó

                decisionRepository.save(decision);
            }
        }

        ProgramaEntity saved = programaRepository.save(existingProgram);

        // EMAIL SEND
        for(ProgramaCarreraEntity bloque : existingProgram.getBloqueMultiple()) {
            UsuarioDepartamentoEntity udeComision = bloque.getCarreraPlan().getCarrera().getComision();
            emailService.sendEmailNotificacionCargaDocente(udeComision.getEmail(), existingProgram, bloque.getCarreraPlan().getCarrera());
        }

        return responseMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public ProgramaResponseDTO actualizarEstado(Authentication auth, Long deptId, Long carreraId, Long programId, EstadoUpdateDTO estadoUpdateDTO, Rol rolActivo) {
        UsuarioDepartamentoEntity udeActor = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

        if ((rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR) || rolActivo.equals(Rol.DOCENTE)) && !udeActor.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        ProgramaEntity programa = programaRepository.findById(programId)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));


        switch (rolActivo) {
            case DOCENTE:
                procesarDecisionDocente(programa, estadoUpdateDTO, udeActor);
                break;

            case COORDINACION_COMISION_CURRICULAR:
                procesarDecisionCoordinador(programa, carreraId, estadoUpdateDTO, udeActor);
                break;

            case SECRETARIA:
                procesarDecisionSecretaria(programa, estadoUpdateDTO, udeActor);
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
        ProgramaEntity foundProgram = programaRepository.findWithAllDetailsById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        return responseMapper.toDTO(foundProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramaResponseDTO getByMateriaIdAndAnio(Long materiaId) {
        Integer anioActual = LocalDate.now().getYear();
        ProgramaEntity foundProgram = programaRepository.findByMateriaIdAndAnio(materiaId, anioActual)
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
    public List<ProgramaResponseReducedDTO> getListAnioActual(Authentication auth, Long deptId, Rol rolActivo) {
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

        if (!ude.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        Integer anioActual = LocalDate.now().getYear();
        List<ProgramaEntity> programs = new ArrayList<>();

        // 1. Si soy Admin, Director, Secretario o Administrativo veo todos los programas del departamento
        if (rolActivo.equals(Rol.SYSTEM_ADMIN) || rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.DIRECCION_ADMINISTRATIVA) || rolActivo.equals(Rol.ADMINISTRACION)) {
            programs = programaRepository.findByMateriaDepartamentoIdAndAnio(deptId, anioActual);
        }

        // 2. Si es coordinador ve los programas de la carrera
        else if (rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR)) {
            programs = programaRepository.findProgramasByCoordinadorLegajoAndAnio(auth.getName(), anioActual);
        }
        // 3. Si es profesor ve los programas que tiene asignados
        else if (rolActivo.equals(Rol.DOCENTE) ) {
            programs = programaRepository.findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(auth.getName(), deptId, anioActual);
        }

        return programs.stream()
                .map(responseReducedMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseDTO> getListAnioActualCoordinador(Authentication auth, Long deptId, Rol rolActivo) {
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

        if (!ude.hasRole(rolActivo) || !rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        Integer anioActual = LocalDate.now().getYear();
        List<ProgramaEntity> programs = programaRepository.findProgramasByCoordinadorLegajoAndAnio(auth.getName(), anioActual);

        return programs.stream()
                .map(responseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseReducedDTO> getListPendientes(Authentication auth, Long deptId, Rol rolActivo) {
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

        if (!ude.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        Integer anioActual = LocalDate.now().getYear();
        List<ProgramaEntity> programs = new ArrayList<>();

        if (rolActivo.equals(Rol.SYSTEM_ADMIN) || rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.DIRECCION_ADMINISTRATIVA) || rolActivo.equals(Rol.ADMINISTRACION)) {
//            programs = programaRepository.findByMateriaDepartamentoIdAndAnio(deptId, anioActual);
        }
        else if (rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR)) {
            programs = programaRepository.findProgramasPendientesCoordinador(auth.getName(), anioActual, EstadoPrograma.COMPLETO_POR_PROFESOR);
        }
        else if (rolActivo.equals(Rol.DOCENTE) ) {
//            programs = programaRepository.findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoIdAndAnio(auth.getName(), deptId, anioActual);
        }

        return programs.stream()
                .map(responseReducedMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseDTO> getListPendientesCoordinador(Authentication auth, Long deptId, Rol rolActivo) {
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);

        if (!ude.hasRole(rolActivo) || !rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        Integer anioActual = LocalDate.now().getYear();
        List<ProgramaEntity> programs = programaRepository.findProgramasPendientesCoordinador(auth.getName(), anioActual, EstadoPrograma.COMPLETO_POR_PROFESOR);

        return programs.stream()
                .map(responseMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseReducedDTO> getListByMateria(Long materiaId) {
        MateriaEntity materia = materiaService.getEntityById(materiaId);
        return materia.getProgramas().stream()
                .map(responseReducedMapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseReducedDTO> listAll() {
        List<ProgramaEntity> programs = programaRepository.findAll();
        return programs.stream()
                .map(responseReducedMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        programaRepository.deleteById(id);
    }


    // BORRADOR
    @Override
    @Transactional
    public void saveDraft(Long deptId, Long materiaId, ProgramaDraftDTO dto, UserEntity user, Rol rolActivo) {
        Long userId = user.getId();

        UsuarioDepartamentoEntity ude = udeService.findByUsuarioIdAndDepartamentoId(userId, deptId);

        if (!(ude.hasRole(rolActivo))) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        if (!(rolActivo.equals(Rol.ADMINISTRACION) || rolActivo.equals(Rol.DOCENTE))) {
            throw new AccessDeniedException("Solo los administrativos y docentes pueden tener borradores");
        }

        ProgramaDraftEntity draft = draftRepository
                .findByUsuarioIdAndMateriaId(
                        userId,
                        materiaId
                )
                .orElse(new ProgramaDraftEntity());

        draft.setUsuarioId(userId);
        draft.setMateriaId(materiaId);
        draft.setPayloadJson(dto.getPayloadJson());
        draft.setLastUpdated(LocalDateTime.now());

        draftRepository.save(draft);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramaDraftDTO getDraft(Long deptId, Long materiaId, UserEntity user, Rol rolActivo) {
        Long userId = user.getId();

        UsuarioDepartamentoEntity ude = udeService.findByUsuarioIdAndDepartamentoId(userId, deptId);

        if (!(ude.hasRole(rolActivo))) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        if (!(rolActivo.equals(Rol.ADMINISTRACION) || rolActivo.equals(Rol.DOCENTE))) {
            throw new AccessDeniedException("Solo los administrativos y docentes pueden tener borradores");
        }

        return draftRepository
                .findByUsuarioIdAndMateriaId(
                        user.getId(),
                        materiaId
                )
                .map(d -> new ProgramaDraftDTO(d.getPayloadJson()))
                .orElse(null);
    }

    @Override
    @Transactional
    public void deleteDraft(Long deptId, Long materiaId, UserEntity user, Rol rolActivo) {
        Long userId = user.getId();

        UsuarioDepartamentoEntity ude = udeService.findByUsuarioIdAndDepartamentoId(userId, deptId);

        if (!(ude.hasRole(rolActivo))) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        if (!(rolActivo.equals(Rol.ADMINISTRACION) || rolActivo.equals(Rol.DOCENTE))) {
            throw new AccessDeniedException("Solo los administrativos y docentes pueden tener borradores");
        }

        draftRepository.deleteByUsuarioIdAndMateriaId(
                user.getId(),
                materiaId
        );
    }

    private void procesarDecisionDocente(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UsuarioDepartamentoEntity udeActor) {

        switch (estadoUpdateDTO.getAccion()) {
            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, udeActor, Rol.DOCENTE);
                break;

            case APROBAR:
                throw new IllegalArgumentException("Un DOCENTE no tiene la opcion de APROBAR");
        }
    }

    private void procesarDecisionCoordinador(ProgramaEntity programa, Long carreraId, EstadoUpdateDTO estadoUpdateDTO, UsuarioDepartamentoEntity udeActor) {

        // 1. Buscar la decisión de este coordinador específico
        DecisionComisionEntity decision = decisionRepository.findByProgramaIdAndCarreraIdAndComisionId(programa.getId(), carreraId, udeActor.getId())
                .orElseThrow(() -> new IllegalStateException("Usted no es coordinador de este programa"));

        switch (estadoUpdateDTO.getAccion()) {
            case APROBAR:
                ProgramaCarreraEntity bloque = programaCarreraRepository.findByProgramaIdAndCarreraPlanId(programa.getId(), carreraId)
                        .orElseThrow(() -> new IllegalStateException("Esta carrera no está relacionada con este programa"));

                bloque.setContribucion(estadoUpdateDTO.getContribucionCarrera());
                programaCarreraRepository.save(bloque);

                decision.setAprobado(true);
                decision.setFechaDecision(LocalDateTime.now());
                decisionRepository.save(decision);

                // 2. ¿Todos los coordinadores involucrados han aprobado?
                long pendientes = decisionRepository.countByProgramaCarreraProgramaIdAndAprobadoFalse(programa.getId());

                if (pendientes == 0) {
                    // SOLO AQUÍ cambiamos el estado global
                    programa.registrarNuevoEstado(EstadoPrograma.APROBADO_POR_COMISION, udeActor, Rol.COORDINACION_COMISION_CURRICULAR, "Aprobación unánime de comisiones");

                    programa.getBloqueMultiple().forEach(pc -> pc.setDecisionComision(null));

                    programaRepository.save(programa);

                    // EMAIL SEND
                    UsuarioDepartamentoEntity udeSecretaria = programa.getMateria().getDepartamento().getSecretaria();
                    emailService.sendEmailNotificacionAprobacionComision(udeSecretaria.getEmail(), udeSecretaria.getUsuario(), programa.getMateria());
                }

                break;

            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, udeActor, Rol.COORDINACION_COMISION_CURRICULAR);
                programa.getBloqueMultiple().forEach(pc -> pc.setDecisionComision(null));
                programaRepository.save(programa);
                break;

        }
    }

    private void procesarDecisionSecretaria(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UsuarioDepartamentoEntity udeActor) {

        switch (estadoUpdateDTO.getAccion()) {
            case APROBAR:
                programa.registrarNuevoEstado(EstadoPrograma.APROBADO_POR_SECRETARIA, udeActor, Rol.SECRETARIA, null);
                break;

            case RECHAZAR:
                rechazar(programa, estadoUpdateDTO, udeActor, Rol.SECRETARIA);
                break;

        }
    }


    private void rechazar(ProgramaEntity programa, EstadoUpdateDTO estadoUpdateDTO, UsuarioDepartamentoEntity udeActor, Rol actorRol) {

        Rol destinoRechazo = estadoUpdateDTO.getDestinoRechazo();

        if (destinoRechazo == null) {
            throw new IllegalArgumentException("Debe especificar destino al rechazar");
        }

        UsuarioDepartamentoEntity udeDestinatario;

        EstadoPrograma nuevoEstado;
        udeDestinatario = switch (destinoRechazo) {
            case Rol.ADMINISTRACION -> {
                nuevoEstado = EstadoPrograma.RECHAZADO_A_ADMINISTRACION;
                yield programa.getAdministracionResponsable();
            }
            case Rol.DOCENTE -> {
                nuevoEstado = EstadoPrograma.RECHAZADO_A_PROFESOR;
                yield programa.getProfesorResponsable();
            }
            default ->
                    throw new IllegalArgumentException("No se puede realizar la acción de rechazar a menos que sea a ADMINISTRACION o a PROFESOR");
        };
        ;

        programa.registrarNuevoEstado(nuevoEstado, udeActor, actorRol, estadoUpdateDTO.getJustificacion());

        // EMAIL SEND
        emailService.sendEmailNotificacionRechazo(udeDestinatario.getEmail(), udeDestinatario.getUsuario(), actorRol, udeActor.getUsuario(), programa.getMateria(), estadoUpdateDTO.getJustificacion());

    }

    private List<ProgramaCarreraEntity> getProgramaCarreraEntities(List<ProgramaCarreraCreateDTO> bloquesMultiplesDTO, ProgramaEntity programaEntity) {
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = new ArrayList<>();
        List<String> carrerasSinComision = new ArrayList<>();

        for (ProgramaCarreraCreateDTO bloqueDTO : bloquesMultiplesDTO) {
            ProgramaCarreraEntity bloqueEntity = programaCarreraMapper.toEntity(bloqueDTO);
            bloqueEntity.setPrograma(programaEntity);

            CarreraPlanEntity plan = carreraService.getPlanEntityById(bloqueDTO.getCarreraPlanId());
            CarreraEntity carrera = plan.getCarrera();
            if(carrera.getComision() == null){
                carrerasSinComision.add(carrera.getNombre());
                continue;
            }

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

            bloquesMultiplesEntity.add(bloqueEntity);
        }

        if (!carrerasSinComision.isEmpty()) {

            String carreras = String.join(", ", carrerasSinComision);

            throw new IllegalStateException(
                    "Las carreras asociadas al programa deben tener asignada una comisión curricular: "
                            + carreras
            );
        }

        return bloquesMultiplesEntity;
    }
}