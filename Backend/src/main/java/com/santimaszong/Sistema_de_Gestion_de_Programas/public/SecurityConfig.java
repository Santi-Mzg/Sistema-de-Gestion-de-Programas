//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.security.config.annotation.web.builders.HttpSecurity;
//import org.springframework.security.web.SecurityFilterChain;
//import static org.springframework.security.config.Customizer.withDefaults;
//
//@Configuration
//public class SecurityConfig {
//
//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                .authorizeHttpRequests(authorize -> authorize
//                        // 1. Permite el acceso sin autenticación a /public/**
//                        .requestMatchers("/public/**").permitAll()
//                        // 2. Cualquier otra solicitud requiere autenticación
//                        .anyRequest().authenticated()
//                )
//                // 3. Define que se use autenticación de formulario (login)
//                .formLogin(withDefaults())
//                // 4. (Opcional) Deshabilita CSRF si es una API REST sin sesiones
//                .csrf(csrf -> csrf.disable());
//
//        return http.build();
//    }
//}