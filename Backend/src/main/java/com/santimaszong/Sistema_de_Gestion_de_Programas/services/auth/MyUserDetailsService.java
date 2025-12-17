package com.santimaszong.Sistema_de_Gestion_de_Programas.services.auth;

import com.santimaszong.Sistema_de_Gestion_de_Programas.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String legajo) throws UsernameNotFoundException {
        return userRepo.findByLegajo(legajo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con legajo: " + legajo));
    }
}