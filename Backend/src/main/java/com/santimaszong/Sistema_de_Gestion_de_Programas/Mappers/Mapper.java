package com.santimaszong.Sistema_de_Gestion_de_Programas.Mappers;

public interface Mapper<A, B> {

    B mapTo(A a);

    A mapFrom(B b);

}
