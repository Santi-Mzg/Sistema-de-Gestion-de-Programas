package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ProgramMapperImpl implements Mapper<ProgramDTO, ProgramEntity> {

    private ModelMapper modelMapper;

    public ProgramMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public ProgramEntity mapTo(ProgramDTO programDTO) {
        return modelMapper.map(programDTO, ProgramEntity.class);
    }

    @Override
    public ProgramDTO mapFrom(ProgramEntity programEntity) {
        return modelMapper.map(programEntity, ProgramDTO.class);
    }
}
