package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.extensions;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.user.UsuarioDepartamentoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UsuarioDepartamentoEntity;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.ToDTOMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.CarreraToStringMapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils.MateriasToStringMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(
        componentModel = "spring",
        uses = {
                MateriasToStringMapper.class,
                CarreraToStringMapper.class
        }
)
public interface UsuarioDepartamentoMapper extends ToDTOMapper<UsuarioDepartamentoEntity, UsuarioDepartamentoDTO> {

    @Override
    @Mapping(source = "departamento.id", target = "departamentoId")
    @Mapping(source = "departamento.nombre", target = "departamentoNombre")
    @Mapping(source = "carrerasComoComision", target = "carrerasComoComision", qualifiedByName = "carrerasToString")
    @Mapping(source = "materiasComoProfesor", target = "materiasComoProfesor", qualifiedByName = "programasToString")
    UsuarioDepartamentoDTO toDTO(UsuarioDepartamentoEntity userDpto);

}
