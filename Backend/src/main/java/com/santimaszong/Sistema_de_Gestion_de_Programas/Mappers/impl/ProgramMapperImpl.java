package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.ProgramaDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.ProgramaEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class ProgramMapperImpl implements Mapper<ProgramaDTO, ProgramaEntity> {

    private ModelMapper modelMapper;

    public ProgramMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public ProgramaEntity mapTo(ProgramaDTO programaDTO) {

        return modelMapper.map(programaDTO, ProgramaEntity.class);
    }

    @Override
    public ProgramaDTO mapFrom(ProgramaEntity programaEntity) {
        return modelMapper.map(programaEntity, ProgramaDTO.class);
    }



}
