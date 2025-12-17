package com.santimaszong.Sistema_de_Gestion_de_Programas.mappers.utils;

import com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Named;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserToStringMapper {

    @Named("userToString")
    default String userToString(UserEntity u) {
        if (u == null) return null;
        return u.getApellido() + ", " + u.getNombre();
    }

    @Named("usersToString")
    default List<String> usersToString(List<UserEntity> users) {
        if (users == null) return null;
        return users.stream()
                .map(m -> m.getApellido() + ", " + m.getNombre())
                .toList();
    }
}