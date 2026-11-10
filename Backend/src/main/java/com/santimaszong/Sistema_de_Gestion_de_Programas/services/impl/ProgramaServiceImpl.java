package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.utils.ProgramaSpecifications;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCargaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseReducedMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Objects;
import java.util.function.Function;


@Service
public class ProgramaServiceImpl implements ProgramaService {

    private final ProgramaRepository programaRepository;
    private final ProgramaCarreraRepository programaCarreraRepository;
    private final ProgramaDraftRepository draftRepository;
    private final DecisionComisionRepository decisionRepository;
    private final MateriaService materiaService;
    private final AreaService areaService;
    private final CarreraService carreraService;
    private final UsuarioDepartamentoService udeService;
    private final EmailService emailService;
    private final ProgramaWorkflowService workflow;
    private final com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma contexto;



    private final ProgramaResponseMapper responseMapper;
    private final ProgramaResponseReducedMapper responseReducedMapper;
    private final ProgramaCargaMapper cargaMapper;
    private final ProgramaCarreraMapper programaCarreraMapper;


    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               ProgramaCarreraRepository programaCarreraRepository,
                               ProgramaDraftRepository draftRepository,
                               DecisionComisionRepository decisionRepository,
                               MateriaService materiaService,
                               AreaService areaService,
                               CarreraService carreraService,
                               UsuarioDepartamentoService udeService,
                               ProgramaResponseMapper responseMapper,
                               ProgramaResponseReducedMapper responseReducedMapper,
                               ProgramaCargaMapper cargaMapper,
                               ProgramaCarreraMapper programaCarreraMapper,
                               EmailService emailService, ProgramaWorkflowService workflow, com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma contexto) {

        this.programaRepository = programaRepository;
        this.programaCarreraRepository = programaCarreraRepository;
        this.draftRepository = draftRepository;
        this.decisionRepository = decisionRepository;
        this.materiaService = materiaService;
        this.areaService = areaService;
        this.carreraService = carreraService;
        this.udeService = udeService;
        this.responseMapper = responseMapper;
        this.responseReducedMapper = responseReducedMapper;
        this.cargaMapper = cargaMapper;
        this.programaCarreraMapper = programaCarreraMapper;
        this.emailService = emailService;
        this.workflow = workflow;
        this.contexto = contexto;
    }


    @Override
    @Transactional
    public ProgramaResponseDTO create(Long deptId, ProgramaCargaDTO datos, UserEntity actor) {
        return responseMapper.toDTO(workflow.crear(deptId, datos, actor));
    }

    @Override
    @Transactional
    public ProgramaResponseDTO administrativoCarga(Long deptId, Long id, ProgramaCargaDTO datos, UserEntity actor) {
        return responseMapper.toDTO(workflow.cargar(deptId, id, datos, actor, Rol.ADMINISTRACION));
    }

    @Override
    @Transactional
    public ProgramaResponseDTO docenteCarga(Long deptId, Long id, ProgramaCargaDTO datos, UserEntity actor) {
        return responseMapper.toDTO(workflow.cargar(deptId, id, datos, actor, Rol.DOCENTE));
    }

    @Override
    @Transactional
    public ProgramaResponseDTO actualizarEstado(Authentication auth, Long deptId, Long carreraId, Long programId, EstadoUpdateDTO datos, Rol rolActivo) {
        return responseMapper.toDTO(workflow.decidir(auth.getName(), deptId, programId, carreraId, rolActivo, datos));
    }

    @Override
    @Transactional
    public ProgramaResponseDTO secretariaCarga(Long deptId, Long id, ProgramaCargaDTO datos, UserEntity actor) {
        return responseMapper.toDTO(workflow.cargar(deptId, id, datos, actor, Rol.SECRETARIA));
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramaResponseDTO getById(Long id) {
        ProgramaEntity foundProgram = programaRepository.findWithAllDetailsById(id)
                .orElseThrow(() -> new EntityNotFoundException("Programa no existente"));

        if (foundProgram != null) contexto.consultarActual(foundProgram);
        return responseMapper.toDTO(foundProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramaResponseDTO getByMateriaIdAndAnio(Long materiaId) {
        Integer anioActual = LocalDate.now().getYear();
        ProgramaEntity foundProgram = programaRepository.findByMateriaIdAndAnio(materiaId, anioActual)
                .orElse(null);

        return responseMapper.toDTO(foundProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramaResponseDTO getProgramaVigenteByMateria(Long materiaId) {
        ProgramaEntity foundProgram = programaRepository.findFirstByMateriaIdAndEstadoActualOrderByAnioDesc(
                    materiaId,
                    EstadoPrograma.APROBADO
                ).orElse(null);

        return responseMapper.toDTO(foundProgram);
    }


    @Override
    @Transactional(readOnly = true)
    public Page<ProgramaResponseReducedDTO> getListAnioActual(Authentication auth, Long deptId, Rol rolActivo, EstadoPrograma estado, String search, Pageable pageable) {
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);
        if (!ude.isActivo()) {
            throw new IllegalStateException("El usuario no se encuentra activo en el departamento");
        }
        if (!ude.hasRole(rolActivo)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        Integer anioActual = LocalDate.now().getYear();

        Specification<ProgramaEntity> spec = ProgramaSpecifications.anio(anioActual).and(ProgramaSpecifications.departamento(deptId));

        // 1. Si soy Admin, Director, Secretario o Administrativo veo todos los programas del departamento
        if (rolActivo.equals(Rol.SYSTEM_ADMIN) || rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.DIRECCION_ADMINISTRATIVA) || rolActivo.equals(Rol.ADMINISTRACION)) {
            spec = spec.and(
                    ProgramaSpecifications.departamento(deptId)
            );
        }
        // 2. Si es docente ve los programas que tiene asignados
        else if (rolActivo.equals(Rol.DOCENTE) ) {
            spec = spec
                    .and(ProgramaSpecifications.departamento(deptId))
                    .and(ProgramaSpecifications.docente(auth.getName()));
        }
        else if (rolActivo == Rol.COORDINADOR_AREA) {
            spec = ProgramaSpecifications.departamento(deptId).and(ProgramaSpecifications.areaCoordinada(ude.getId()));
        }
        else {
            throw new AccessDeniedException(
                    "Rol no soportado por este listado"
            );
        }

        spec = spec
                .and(ProgramaSpecifications.estado(estado))
                .and(ProgramaSpecifications.search(search));

        Page<ProgramaEntity> programs =
                programaRepository.findAll(spec, pageable);

        return programs.map(responseReducedMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProgramaResponseDTO> getListAnioActualCoordinador(Authentication auth, Long deptId, Rol rolActivo, EstadoPrograma estado, String nombreCarrera, String search, Pageable pageable) {
        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(auth.getName(), deptId);
        if (!ude.isActivo()) {
            throw new IllegalStateException("El usuario no se encuentra activo en el departamento");
        }
        if (!ude.hasRole(rolActivo) || !rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR)) { // Si el rol proporcionado no esta en el dept se rechaza
            throw new AccessDeniedException("No autorizado");
        }

        Integer anioActual = LocalDate.now().getYear();

        Specification<ProgramaEntity> spec = Specification.allOf(
                ProgramaSpecifications.anio(anioActual),

                ProgramaSpecifications.coordinador(
                        auth.getName(),
                        nombreCarrera
                ),

                ProgramaSpecifications.estado(estado),
                ProgramaSpecifications.search(search)
        );

        Page<ProgramaEntity> programs =
                programaRepository.findAll(spec, pageable);

        return programs.map(responseMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProgramaResponseReducedDTO> getListPendientes(Authentication auth, Long deptId, Rol rolActivo, Pageable pageable) {
        UsuarioDepartamentoEntity actor = exigirActor(auth, deptId, rolActivo);
        if (rolActivo == Rol.COORDINACION_COMISION_CURRICULAR) {
            throw new AccessDeniedException("Utilice la bandeja de pendientes de comisión curricular");
        }
        Specification<ProgramaEntity> spec = alcanceProgramas(actor, rolActivo)
                .and(ProgramaSpecifications.anio(LocalDate.now().getYear()))
                .and(filtroPendientes(actor, rolActivo));
        return programaRepository.findAll(spec, pageable).map(responseReducedMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ProgramaResponseDTO> getListPendientesCoordinador(Authentication auth, Long deptId, Rol rolActivo, Pageable pageable) {
        UsuarioDepartamentoEntity actor = exigirActor(auth, deptId, rolActivo);
        if (rolActivo != Rol.COORDINACION_COMISION_CURRICULAR) {
            throw new AccessDeniedException("Seleccione el rol de coordinación de comisión curricular");
        }
        Specification<ProgramaEntity> spec = alcanceProgramas(actor, rolActivo)
                .and(ProgramaSpecifications.anio(LocalDate.now().getYear()))
                .and(filtroPendientes(actor, rolActivo));
        return programaRepository.findAll(spec, pageable).map(responseMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramaResponseReducedDTO> getListByMateria(Long materiaId) {
        MateriaEntity materia = materiaService.getEntityById(materiaId);
        return materia.getProgramas().stream()
                .filter(contexto::puedeConsultarActual)
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
    @Transactional(readOnly = true)
    public DashboardResumenDTO getDashboardResumen(Authentication auth, Long deptId, Rol rolActivo) {
        UsuarioDepartamentoEntity actor = exigirActor(auth, deptId, rolActivo);
        Specification<ProgramaEntity> alcance = alcanceProgramas(actor, rolActivo)
                .and(ProgramaSpecifications.anio(LocalDate.now().getYear()));
        boolean gestionDepartamental = switch (rolActivo) {
            case ADMINISTRACION, SECRETARIA, DIRECCION_ADMINISTRATIVA, SYSTEM_ADMIN -> true;
            default -> false;
        };
        // Mantener los campos no aplicables de las respuestas existentes: cero para Área y null para Docente/CCC.
        Long noAplica = rolActivo == Rol.COORDINADOR_AREA ? 0L : null;
        long pendienteSecretariaInicial = programaRepository.count(alcance.and(etapaSecretariaInicial()));
        long pendienteSecretariaFinal = programaRepository.count(alcance.and(etapaSecretariaFinal()));
        return new DashboardResumenDTO(
                gestionDepartamental ? Long.valueOf(areaService.countByDepartamentoId(deptId)) : noAplica,
                gestionDepartamental ? Long.valueOf(carreraService.countByDepartamentoId(deptId)) : noAplica,
                gestionDepartamental ? Long.valueOf(materiaService.countByDepartamentoId(deptId)) : noAplica,
                gestionDepartamental ? Long.valueOf(udeService.countByDepartamentoId(deptId)) : noAplica,
                gestionDepartamental ? Long.valueOf(udeService.countByDepartamentoIdAndRolesContaining(deptId, Rol.DOCENTE)) : noAplica,
                gestionDepartamental ? Long.valueOf(udeService.countByDepartamentoIdAndRolesContaining(deptId, Rol.ADMINISTRACION)) : noAplica,
                programaRepository.count(alcance),
                programaRepository.count(alcance.and(ProgramaSpecifications.estado(EstadoPrograma.APROBADO))),
                contarEnEtapa(alcance, Rol.ADMINISTRACION),
                contarEnEtapa(alcance, Rol.DOCENTE),
                rolActivo == Rol.DOCENTE
                        ? Long.valueOf(programaRepository.count(alcance.and(ProgramaSpecifications.estado(EstadoPrograma.RECHAZADO_A_DOCENTE))))
                        : noAplica,
                contarEnEtapa(alcance, Rol.COORDINACION_COMISION_CURRICULAR),
                pendienteSecretariaInicial + pendienteSecretariaFinal,
                contarEnEtapa(alcance, Rol.COORDINADOR_AREA),
                pendienteSecretariaInicial,
                pendienteSecretariaFinal);
    }

    private UsuarioDepartamentoEntity exigirActor(Authentication auth, Long deptId, Rol rol) {
        if (auth == null) throw new AccessDeniedException("Debe iniciar sesión");
        return contexto.exigir(auth.getName(), deptId, rol);
    }

    /** Alcance de consulta, independiente de la etapa y el año del programa. */
    private Specification<ProgramaEntity> alcanceProgramas(UsuarioDepartamentoEntity actor, Rol rol) {
        Specification<ProgramaEntity> departamento = ProgramaSpecifications.departamento(actor.getDepartamento().getId());
        return switch (rol) {
            case ADMINISTRACION, SECRETARIA, DIRECCION_ADMINISTRATIVA, SYSTEM_ADMIN -> departamento;
            case DOCENTE -> departamento.and(ProgramaSpecifications.docenteResponsable(actor.getId()));
            case COORDINADOR_AREA -> departamento.and(ProgramaSpecifications.areaCoordinada(actor.getId()));
            // El departamento activo determina las carreras asignadas, no el departamento dueño del programa.
            case COORDINACION_COMISION_CURRICULAR -> ProgramaSpecifications.carrerasCoordinadas(actor.getId());
        };
    }

    /** Estar en CCC no implica que este coordinador todavía tenga una decisión pendiente. */
    private Specification<ProgramaEntity> filtroPendientes(UsuarioDepartamentoEntity actor, Rol rol) {
        Specification<ProgramaEntity> etapa = etapaPendiente(rol);
        return rol == Rol.COORDINACION_COMISION_CURRICULAR
                ? etapa.and(ProgramaSpecifications.pendienteComision(actor.getId()))
                : etapa;
    }

    private long contarEnEtapa(Specification<ProgramaEntity> alcance, Rol rol) {
        return programaRepository.count(alcance.and(etapaPendiente(rol)));
    }

    private Specification<ProgramaEntity> etapaPendiente(Rol rol) {
        if (rol == Rol.SECRETARIA) return etapaSecretariaInicial().or(etapaSecretariaFinal());
        List<EstadoPrograma> estados = switch (rol) {
            case ADMINISTRACION -> List.of(EstadoPrograma.RECHAZADO_A_ADMINISTRACION);
            case DOCENTE -> List.of(EstadoPrograma.PENDIENTE_DE_DOCENTE, EstadoPrograma.RECHAZADO_A_DOCENTE);
            case COORDINADOR_AREA -> List.of(EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA);
            case COORDINACION_COMISION_CURRICULAR -> List.of(EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES);
            default -> throw new AccessDeniedException("El rol activo no tiene una bandeja de pendientes en esta consulta");
        };
        return ProgramaSpecifications.estadoIn(estados);
    }

    private Specification<ProgramaEntity> etapaSecretariaInicial() {
        return ProgramaSpecifications.estadoIn(List.of(EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, EstadoPrograma.RECHAZADO_A_SECRETARIA));
    }

    private Specification<ProgramaEntity> etapaSecretariaFinal() {
        return ProgramaSpecifications.estado(EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL);
    }

    @Override
    @Transactional
    public boolean tieneProgramasActivosComoDocente(UsuarioDepartamentoEntity ude) {

        List<EstadoPrograma> estadosActivos = List.of(EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA, EstadoPrograma.PENDIENTE_DE_DOCENTE, EstadoPrograma.RECHAZADO_A_SECRETARIA, EstadoPrograma.RECHAZADO_A_DOCENTE, EstadoPrograma.PENDIENTE_DE_COMISIONES_CURRICULARES, EstadoPrograma.RECHAZADO_A_ADMINISTRACION, EstadoPrograma.PENDIENTE_DE_SECRETARIA_INICIAL, EstadoPrograma.PENDIENTE_DE_SECRETARIA_FINAL);

        Specification<ProgramaEntity> spec = Specification.allOf(
                ProgramaSpecifications.departamento(ude.getDepartamento().getId()),
                ProgramaSpecifications.docente(ude.getUsuario().getLegajo()),
                ProgramaSpecifications.estadoIn(estadosActivos)
        );

        return programaRepository.exists(spec);
    }



    @Override
    @Transactional
    public void delete(Long id) {
        programaRepository.deleteById(id);
    }


}
