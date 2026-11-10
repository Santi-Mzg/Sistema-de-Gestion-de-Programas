package com.santimaszong.Sistema_de_Gestion_de_Programas.services.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaCreateDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.materia.MateriaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.AreaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.EstadoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.enums.Rol;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions.MateriaMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.AreaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.CarreraService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.MateriaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.ProgramaRepository;
import com.santimaszong.Sistema_de_Gestion_de_Programas.security.ContextoPrograma;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.MateriaService;
import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ProgramaWorkflowService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class MateriaServiceImpl implements MateriaService {

    private final MateriaRepository materiaRepository;
    private final CarreraService carreraService;
    private final AreaService areaService;
    private final ProgramaRepository programaRepository;
    private final ProgramaWorkflowService circuito;
    private final ContextoPrograma contexto;

    private final MateriaMapper materiaMapper;

    public MateriaServiceImpl(MateriaRepository materiaRepository, CarreraService carreraService,
                              AreaService areaService, MateriaMapper materiaMapper,
                              ProgramaRepository programaRepository, ProgramaWorkflowService circuito,
                              ContextoPrograma contexto) {
        this.materiaRepository = materiaRepository;
        this.carreraService = carreraService;
        this.areaService = areaService;
        this.materiaMapper = materiaMapper;
        this.programaRepository = programaRepository;
        this.circuito = circuito;
        this.contexto = contexto;
    }


    @Override
    @Transactional
    public MateriaResponseDTO createMateria(MateriaCreateDTO materiaDTO){
        MateriaEntity materiaEntity = materiaMapper.toEntity(materiaDTO);

        AreaEntity area = areaService.getEntityById(materiaDTO.getAreaId());

        materiaEntity.setDepartamento(area.getDepartamento());
        materiaEntity.setArea(area);
        materiaEntity.setCodigo(materiaDTO.getCodigo().trim().toUpperCase());
        MateriaEntity createdMateriaEntity = materiaRepository.save(materiaEntity);

        return materiaMapper.toDTO(createdMateriaEntity);
    }

    @Override
    @Transactional(readOnly = true)
    public MateriaResponseDTO getMateriaById(Long id) {
        MateriaEntity foundMateria = materiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no existente"));;

        return materiaMapper.toDTO(foundMateria);
    }

    @Override
    @Transactional(readOnly = true)
    public MateriaEntity getEntityById(Long id) {
        return materiaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Materia no existente"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> listMaterias() {
        List<MateriaEntity> materias = materiaRepository.findAll();
        return materias.stream()
                .map(materiaMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MateriaResponseDTO> listMateriasDepartamento(Long deptId, String search, Pageable pageable) {
        String normalizedSearch =
                search == null || search.isBlank()
                        ? ""
                        : search.trim();

        return materiaRepository.findAllByDepartamentoId(deptId, normalizedSearch, pageable)
                .map(materiaMapper::toDTO);
    };

    @Override
    @Transactional(readOnly = true)
    public Page<MateriaResponseDTO> listMateriasSinPrograma(Long deptId, String legajo, Rol rol,
                                                           String search, Pageable pageable) {
        contexto.exigir(legajo, deptId, rol);
        if (rol != Rol.ADMINISTRACION && rol != Rol.SECRETARIA
                && rol != Rol.DIRECCION_ADMINISTRATIVA && rol != Rol.SYSTEM_ADMIN) {
            throw new AccessDeniedException("El rol activo no permite consultar las materias sin programa del departamento");
        }
        int anioActual = LocalDate.now(ZoneId.of("America/Argentina/Buenos_Aires")).getYear();
        String busqueda = search == null ? "" : search.trim();
        return materiaRepository.findSinProgramaEnAnio(deptId, anioActual, busqueda, pageable)
                .map(materiaMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaResponseDTO> listMateriasCarreraPlan(Long carreraId) {
        List<MateriaEntity> materias = carreraService.listMateriasCarreraPlan(carreraId);

        return materias
                .stream()
                .map(materiaMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MateriaEntity> listEntities(List<Long> ids) {
        return materiaRepository.findAllById(ids);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByDepartamentoId(Long deptId) {
        return materiaRepository.countByDepartamentoId(deptId);
    }

    @Override
    @Transactional
    public MateriaResponseDTO updateMateria(Long id, MateriaCreateDTO datos, String legajo, Long deptId, Rol rol) {
        UsuarioDepartamentoEntity actor = contexto.exigir(legajo, deptId, rol);
        if (rol != Rol.ADMINISTRACION && rol != Rol.SECRETARIA
                && rol != Rol.DIRECCION_ADMINISTRATIVA && rol != Rol.SYSTEM_ADMIN) {
            throw new AccessDeniedException("No puede modificar materias con este rol");
        }

        MateriaEntity materia = getEntityById(id);
        if (!materia.getDepartamento().getId().equals(deptId)) {
            throw new AccessDeniedException("La materia no pertenece al departamento activo");
        }

        if (datos.getNombre() != null) {
            materia.setNombre(datos.getNombre().trim());
        }
        if (datos.getCodigo() != null) {
            materia.setCodigo(datos.getCodigo().trim().toUpperCase(Locale.ROOT));
        }

        if (datos.getAreaId() != null && !datos.getAreaId().equals(materia.getArea().getId())) {
            AreaEntity nuevaArea = areaService.getEntityById(datos.getAreaId());
            if (!nuevaArea.getDepartamento().getId().equals(deptId)) {
                throw new AccessDeniedException("El área debe pertenecer al mismo departamento");
            }

            materia.setArea(nuevaArea);
            materiaRepository.saveAndFlush(materia);

            if (nuevaArea.getCoordinador() == null) {
                List<ProgramaEntity> pendientes = programaRepository.findByMateriaIdAndEstadoActual(
                        id, EstadoPrograma.PENDIENTE_DE_COORDINACION_AREA);
                for (ProgramaEntity pendiente : pendientes) {
                    circuito.omitirPrograma(circuito.bloquear(pendiente.getId()), actor, rol);
                }
            }
        }

        return materiaMapper.toDTO(materia);
    }

    @Override
    @Transactional
    public void deleteMateria(Long id) {
        materiaRepository.deleteById(id);
    }
}
