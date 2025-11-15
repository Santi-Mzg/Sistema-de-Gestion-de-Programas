package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.MateriaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.MateriaEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class MateriaMapperImpl implements Mapper<MateriaDTO, MateriaEntity> {

    private ModelMapper modelMapper;

    public MateriaMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public MateriaEntity mapTo(MateriaDTO materiaDTO) {
        return modelMapper.map(materiaDTO, MateriaEntity.class);
    }

    @Override
    public MateriaDTO mapFrom(MateriaEntity materiaEntity) {
        return modelMapper.map(materiaEntity, MateriaDTO.class);
    }
}
