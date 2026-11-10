package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.area.AreaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UserResponseReducedDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.AreaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.UserReducedMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.AreaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UsuarioDepartamentoRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaWorkflowService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.email.EmailService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.util.exception.ValidacionProgramaException;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.DepartamentoService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AreaServiceImpl implements AreaService {

    private final AreaRepository areaRepository;
    private final DepartamentoService departamentoService;

    private final AreaMapper areaMapper;
    private final UsuarioDepartamentoRepository usuarios;
    private final ContextoPrograma contexto;
    private final ProgramaWorkflowService circuito;
    private final EmailService correo;
    private final UserReducedMapper userMapper;

    public AreaServiceImpl(DepartamentoService departamentoService, AreaRepository areaRepository, AreaMapper areaMapper,
                           UsuarioDepartamentoRepository usuarios, ContextoPrograma contexto,
                           ProgramaWorkflowService circuito, EmailService correo, UserReducedMapper userMapper) {
        this.areaRepository = areaRepository;
        this.departamentoService = departamentoService;
        this.areaMapper = areaMapper;
        this.usuarios = usuarios;
        this.contexto = contexto;
        this.circuito = circuito;
        this.correo = correo;
        this.userMapper = userMapper;
    }


    @Override
    @Transactional
    public AreaResponseDTO createArea(Long deptId, AreaCreateDTO areaDTO){
        AreaEntity areaEntity = areaMapper.toEntity(areaDTO);


        DepartamentoEntity departamento = departamentoService.getEntityById(deptId);

        areaEntity.setDepartamento(departamento);

        AreaEntity createdAreaEntity = areaRepository.save(areaEntity);

        return areaMapper.toDTO(createdAreaEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public AreaResponseDTO getAreaById(Long id) {
        AreaEntity foundArea = areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Area no existente"));;

        return areaMapper.toDTO(foundArea);
    }

    @Override
    @Transactional(readOnly = true)
    public AreaEntity getEntityById(Long id) {
        return areaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Area no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponseDTO> listAreas() {
        List<AreaEntity> materias = areaRepository.findAll();
        return materias.stream()
                .map(areaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AreaResponseDTO> listAreasDepartamento(Long id, String search, Pageable pageable) {
        String normalizedSearch =
                search == null || search.isBlank()
                        ? ""
                        : search.trim();

        var requestAttributes = org.springframework.web.context.request.RequestContextHolder.getRequestAttributes();
        if (requestAttributes instanceof org.springframework.web.context.request.ServletRequestAttributes attrs
                && "COORDINADOR_AREA".equals(attrs.getRequest().getHeader("X-Rol-Activo"))) {
            String legajo = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
            return areaRepository.findByDepartamentoIdAndCoordinadorUsuarioLegajoAndNombreContainingIgnoreCase(
                    id, legajo, normalizedSearch, pageable).map(areaMapper::toDTO);
        }
        return areaRepository.findAllByDepartamentoId(id, normalizedSearch, pageable)
                .map(areaMapper::toDTO);
    };

    @Override
    @Transactional
    public AreaResponseDTO updateArea(Long id, AreaCreateDTO datos) {
        AreaEntity area = getEntityById(id);
        if (datos.getNombre() == null || datos.getNombre().isBlank()) throw new IllegalArgumentException("El nombre del área es obligatorio");
        area.setNombre(datos.getNombre().trim());
        return areaMapper.toDTO(areaRepository.save(area));
    }

    @Override
    @Transactional
    public AreaResponseDTO updateCoordinador(String legajo, Long deptId, Rol rol, Long areaId, Long usuarioId) {
        UsuarioDepartamentoEntity actor = exigirGestionCoordinacion(legajo, deptId, rol);
        AreaEntity area = areaRepository.findForUpdateById(areaId)
                .orElseThrow(() -> new EntityNotFoundException("Área no existente"));
        if (!area.getDepartamento().getId().equals(deptId)) {
            throw new AccessDeniedException("El área no pertenece al departamento activo");
        }
        UsuarioDepartamentoEntity anterior = area.getCoordinador();
        UsuarioDepartamentoEntity siguiente = usuarioId == null ? null
                : usuarios.findByUsuarioIdAndDepartamentoId(usuarioId, deptId)
                    .orElseThrow(() -> new ValidacionProgramaException("El usuario no pertenece al departamento"));
        if (siguiente != null && !siguiente.isActivo()) {
            throw new ValidacionProgramaException("El usuario no está activo en el departamento");
        }
        if (anterior == siguiente || (anterior != null && siguiente != null && anterior.getId().equals(siguiente.getId()))) {
            return areaMapper.toDTO(area);
        }
        area.setCoordinador(siguiente);
        areaRepository.saveAndFlush(area);
        if (anterior != null) {
            if (areaRepository.countByCoordinadorId(anterior.getId()) == 0) {
                anterior.getRoles().remove(Rol.COORDINADOR_AREA);
            }
            correo.sendEmailRemocionCoordinadorArea(anterior, area);
        }
        if (siguiente != null) {
            siguiente.getRoles().add(Rol.COORDINADOR_AREA);
            correo.sendEmailAsignacionCoordinadorArea(siguiente, area);
        } else {
            circuito.omitirArea(area, actor, rol);
        }
        return areaMapper.toDTO(area);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseReducedDTO> candidatosCoordinacion(String legajo, Long deptId, Rol rol) {
        exigirGestionCoordinacion(legajo, deptId, rol);
        return usuarios.findByDepartamentoId(deptId).stream()
                .filter(UsuarioDepartamentoEntity::isActivo)
                .map(u -> userMapper.toDTO(u.getUsuario())).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AreaResponseDTO> misAreas(String legajo, Long deptId) {
        UsuarioDepartamentoEntity actor = contexto.exigir(legajo, deptId, Rol.COORDINADOR_AREA);
        return areaRepository.findByCoordinadorId(actor.getId()).stream().map(areaMapper::toDTO).toList();
    }

    private UsuarioDepartamentoEntity exigirGestionCoordinacion(String legajo, Long deptId, Rol rol) {
        UsuarioDepartamentoEntity actor = contexto.exigir(legajo, deptId, rol);
        if (rol != Rol.SECRETARIA && rol != Rol.DIRECCION_ADMINISTRATIVA && rol != Rol.SYSTEM_ADMIN) {
            throw new AccessDeniedException("No puede asignar la coordinación de un área");
        }
        return actor;
    }

    @Override
    @Transactional
    public void deleteArea(Long id) {
        areaRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByDepartamentoId(Long deptId) {
        return areaRepository.countByDepartamentoId(deptId);
    }

}
