package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.DepartamentoDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.DepartamentoEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class DepartamentoMapperImpl implements Mapper<DepartamentoDTO, DepartamentoEntity> {

    private ModelMapper modelMapper;

    public DepartamentoMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public DepartamentoEntity mapTo(DepartamentoDTO departamentoDTO) {
        return modelMapper.map(departamentoDTO, DepartamentoEntity.class);
    }

    @Override
    public DepartamentoDTO mapFrom(DepartamentoEntity departamentoEntity) {
        return modelMapper.map(departamentoEntity, DepartamentoDTO.class);
    }
}
