package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCargaAdministradorMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaCarreraMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.ProgramaResponseMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.*;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.access.AccessDeniedException;
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
    private final ProgramaCargaAdministradorMapper adminMapper;
    private final ProgramaCarreraMapper programaCarreraMapper;


    public ProgramaServiceImpl(ProgramaRepository programaRepository,
                               MateriaService materiaService,
                               UserService userService,
                               CarreraService carreraService,
                               UsuarioDepartamentoService udeService,
                               ProgramaResponseMapper responseMapper,
                               ProgramaCargaAdministradorMapper adminMapper,
                               ProgramaCarreraMapper programaCarreraMapper) {

        this.programaRepository = programaRepository;
        this.materiaService = materiaService;
        this.userService = userService;
        this.carreraService = carreraService;
        this.udeService = udeService;
        this.responseMapper = responseMapper;
        this.adminMapper = adminMapper;
        this.programaCarreraMapper = programaCarreraMapper;
    }


    @Override
    public ProgramaResponseDTO create(ProgramaCargaAdministrativoDTO programaDTO){
        ProgramaEntity programaEntity = adminMapper.toEntity(programaDTO);

        MateriaEntity materia = materiaService.getEntityById(programaDTO.getMateriaId());

        programaEntity.setMateria(materia);

        UserEntity profesorResponsable = userService.getEntityById(programaDTO.getProfesorResponsableId());

        Long dptoId = materia.getDepartamento().getId();

        UsuarioDepartamentoEntity ude = udeService.findByUsuarioIdAndDepartamentoId(profesorResponsable.getId(), dptoId);
        programaEntity.setProfesorResponsable(ude);

//        programaEntity.setProfesorResponsable(profesorResponsable.getDepartamentos().stream()
//                .filter(ude -> ude.getDepartamento().getId().equals(dptoId))
//                .findFirst()
//                .orElseThrow(() -> new EntityNotFoundException("Departamento relacionoado no encontrado"))
//        );


        List<ProgramaCarreraDTO> bloquesMultiplesDTO = programaDTO.getBloqueMultiple();
        List<ProgramaCarreraEntity> bloquesMultiplesEntity = getProgramaCarreraEntities(bloquesMultiplesDTO, programaEntity);

        programaEntity.setBloqueMultiple(bloquesMultiplesEntity);


        EstadoPrograma nuevoEstado = EstadoPrograma.INCOMPLETO_POR_ADMINISTRACION;

        boolean completoAdministracion =
                programaEntity.getCargaHorariaTotal() != null &&
                        programaEntity.getCargaHorariaSemanal() != null &&
                        programaEntity.getCreditos() != null &&
                        programaEntity.getCantidadSemanas() != null &&
                        programaEntity.getMateria() != null &&
                        programaEntity.getProfesorResponsable() != null &&
                        programaEntity.getBloqueMultiple() != null;

        if (completoAdministracion) {
            nuevoEstado = EstadoPrograma.COMPLETO_POR_ADMINISTRACION;
        }

        programaEntity.registrarNuevoEstado(nuevoEstado, profesorResponsable, null); // MOCKEADO EL ACTOR

        ProgramaEntity createdProgramaEntity = programaRepository.save(programaEntity);

        return responseMapper.toDTO(createdProgramaEntity);
    }

    @Override
    public ProgramaResponseDTO administrativoCarga(Long id, ProgramaCargaAdministrativoDTO programaDTO, UserEntity actor) {
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

                    MateriaEntity nuevaMateria = materiaService.getEntityById(materiaId);

                    existingProgram.setMateria(nuevaMateria);
                });

        Optional.ofNullable(programaDTO.getProfesorResponsableId())
                .ifPresent(profesorId -> {
                    UserEntity profesorActual = existingProgram.getProfesorResponsable().getUsuario();
                    if(profesorActual != null && profesorActual.getId().equals(profesorId))
                        return;


                    MateriaEntity materiaActual = existingProgram.getMateria();
                    DepartamentoEntity dpto = materiaActual.getDepartamento();

                    UsuarioDepartamentoEntity udeProfesorNuevo = udeService.findByUsuarioIdAndDepartamentoId(profesorId, dpto.getId());

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
    public ProgramaResponseDTO profesorCarga(Long id, ProgramaCargaProfesorDTO programaDTO, UserEntity actor) {
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
    @Transactional(readOnly = true)
    public List<ProgramaResponseDTO> getList(String authName, Long deptId, Long carreraId, Rol rolActivo){

        UsuarioDepartamentoEntity ude = udeService.findByUsuarioLegajoAndDepartamentoId(authName, deptId);


        List<ProgramaEntity> programs = new ArrayList<>();

        if(!ude.hasRole(rolActivo)) {
            throw new AccessDeniedException("No autorizado");
        }

        // 1. Si soy Admin, Director, Secretario o Administrativo veo todos los programas del departamento
        if (rolActivo.equals(Rol.SECRETARIA) || rolActivo.equals(Rol.DIRECCION_ADMINISTRATIVA) || rolActivo.equals(Rol.ADMINISTRACION)) {
            programs = programaRepository.findByMateriaDepartamentoId(deptId);
        }

        // 2. Si es coordinador ve los programas de la carrera
        else if (rolActivo.equals(Rol.COORDINACION_COMISION_CURRICULAR) && carreraId != null) {
            programs = programaRepository.findByBloqueMultipleCarreraId(carreraId);
        }

        else if (rolActivo.equals(Rol.DOCENTE) ) {
            programs = programaRepository.findByProfesorResponsableUsuarioLegajoAndMateriaDepartamentoId(authName, deptId);
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