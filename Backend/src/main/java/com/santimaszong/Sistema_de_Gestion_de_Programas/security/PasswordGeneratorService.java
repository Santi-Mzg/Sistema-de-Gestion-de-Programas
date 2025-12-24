package com.santimaszong.Sistema_de_Gestion_de_Programas.security;

import org.springframework.stereotype.Service;
import java.security.SecureRandom;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PasswordGeneratorService {

    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String DIGITS = "0123456789";
    private static final String PUNCTUATION = "!@#$%&*()_+-=[]|,./?><";
    private static final String ALL_CHARACTERS = LOWER + UPPER + DIGITS + PUNCTUATION;

    private final SecureRandom random = new SecureRandom();

    public String generateSafePassword(int length) {
        if (length < 8) length = 12; // Mínimo de seguridad recomendado

        // Garantizamos al menos uno de cada tipo para cumplir con políticas comunes
        StringBuilder password = new StringBuilder();
        password.append(LOWER.charAt(random.nextInt(LOWER.length())));
        password.append(UPPER.charAt(random.nextInt(UPPER.length())));
        password.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        password.append(PUNCTUATION.charAt(random.nextInt(PUNCTUATION.length())));

        // Rellenamos el resto aleatoriamente
        for (int i = 4; i < length; i++) {
            password.append(ALL_CHARACTERS.charAt(random.nextInt(ALL_CHARACTERS.length())));
        }

        // Mezclamos los caracteres para que no siempre empiecen igual (min, may, num, sim)
        List<Character> charList = password.chars()
                .mapToObj(c -> (char) c)
                .collect(Collectors.toList());
        Collections.shuffle(charList);

        return charList.stream()
                .map(String::valueOf)
                .collect(Collectors.joining());
    }
}