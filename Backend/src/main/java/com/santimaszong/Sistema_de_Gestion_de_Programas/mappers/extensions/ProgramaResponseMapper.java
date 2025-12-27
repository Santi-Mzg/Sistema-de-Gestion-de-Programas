package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;


import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.ProgramaResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.UserToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                ProgramaCarreraMapper.class,
                EstadoHistoricoResponseMapper.class,
                UserReducedMapper.class,
                MateriaMapper.class
        }
)
public interface ProgramaResponseMapper extends ToDTOMapper<ProgramaEntity, ProgramaResponseDTO> {


    @Override
    @Mapping(source = "materia", target = "materia")
    @Mapping(source = "profesorResponsable.usuario", target = "profesorResponsable")
    @Mapping(source = "bloqueMultiple", target = "bloqueMultiple")
    @Mapping(source = "historialEstados", target = "historialEstados")
    @Mapping(source = "estadoActual", target = "estado")
    ProgramaResponseDTO toDTO(ProgramaEntity entity);

}