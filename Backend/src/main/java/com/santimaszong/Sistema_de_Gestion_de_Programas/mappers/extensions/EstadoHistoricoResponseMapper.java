package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.programa.EstadoHistoricoResponseDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.EstadoHistoricoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(
        componentModel = "spring",
        uses = {
            UserReducedMapper.class
        }
)
public interface EstadoHistoricoResponseMapper extends ToDTOMapper<EstadoHistoricoEntity, EstadoHistoricoResponseDTO> {

    @Override
    @Mapping(source = "estado", target = "estado")
    @Mapping(source = "fecha", target = "fecha")
    @Mapping(source = "justificacion", target = "justificacion")
    @Mapping(source = "actor.usuario", target = "actor")
    @Mapping(source = "actorRol", target = "actorRol")
    @Mapping(source = "actor.departamento.nombre", target = "departamentoName")
    EstadoHistoricoResponseDTO toDTO(EstadoHistoricoEntity entity);

}