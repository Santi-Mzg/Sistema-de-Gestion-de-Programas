package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.impl;

import com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers.Mapper;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.dto.CarreraDTO;
import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.CarreraEntity;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
public class CarreraMapperImpl implements Mapper<CarreraDTO, CarreraEntity> {

    private ModelMapper modelMapper;

    public CarreraMapperImpl(ModelMapper modelMapper) {
        this.modelMapper = modelMapper;
    }

    @Override
    public CarreraEntity mapTo(CarreraDTO carreraDTO) {
        return modelMapper.map(carreraDTO, CarreraEntity.class);
    }

    @Override
    public CarreraDTO mapFrom(CarreraEntity carreraEntity) {
        return modelMapper.map(carreraEntity, CarreraDTO.class);
    }
}
