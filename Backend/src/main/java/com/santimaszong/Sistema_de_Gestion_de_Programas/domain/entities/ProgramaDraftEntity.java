package com.santimaszong.Sistema_de_Gestion_de_Programas.domain.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "programa_drafts",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_draft_usuario_materia",
                        columnNames = {"usuario_id", "materia_id"}
                )
        }
)
public class ProgramaDraftEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "materia_id", nullable = false)
    private Long materiaId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String payloadJson;

    @Column(nullable = false)
    private LocalDateTime lastUpdated;

}
