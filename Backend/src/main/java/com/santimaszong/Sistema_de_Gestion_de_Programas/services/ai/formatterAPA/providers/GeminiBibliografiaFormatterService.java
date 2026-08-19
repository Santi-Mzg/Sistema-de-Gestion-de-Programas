package com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.providers;

import java.util.List;
import java.util.Map;

import com.santimaszong.Sistema_de_Gestion_de_Programas.services.ai.formatterAPA.BibliografiaFormatterService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class GeminiBibliografiaFormatterService implements BibliografiaFormatterService {

    private final WebClient webClient;
    private final String apiKey;

    public GeminiBibliografiaFormatterService(
            @Value("${gemini.api.key}") String apiKey
    ) {
        this.apiKey = apiKey;

        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1")
                .build();
    }

    @Override
    public String formatearAPA(String textoSucio) {
        String prompt = "Actúa como un experto bibliotecario. Toma el siguiente texto y conviértelo estrictamente a formato de Normas APA 7ma edición. Si hay varios elementos, devuélvelos como una lista con cada ítem comenzando con una viñeta estilo punto y devuelve únicamente el texto formateado sin explicaciones. Bibliografía: " + textoSucio;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        Map response = webClient.post()
                .uri(uriBuilder -> uriBuilder
                        .path("/models/gemini-2.5-flash:generateContent")
                        .queryParam("key", apiKey)
                        .build())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List candidates = (List) response.get("candidates");
        Map firstCandidate = (Map) candidates.get(0);
        Map content = (Map) firstCandidate.get("content");
        List parts = (List) content.get("parts");
        Map textPart = (Map) parts.get(0);

        return textPart.get("text").toString();
    }
}