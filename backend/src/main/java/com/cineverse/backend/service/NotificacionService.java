package com.cineverse.backend.service;

import com.cineverse.backend.dto.NotificacionResponse;
import com.cineverse.backend.entity.Notificacion;
import com.cineverse.backend.entity.Usuario;
import com.cineverse.backend.exception.RecursoNoEncontradoException;
import com.cineverse.backend.repository.NotificacionRepository;
import com.cineverse.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            UsuarioRepository usuarioRepository) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificacionResponse> listar(String email) {
        Usuario usuario = buscarUsuario(email);
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId())
                .stream()
                .map(NotificacionResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public long noLeidas(String email) {
        Usuario usuario = buscarUsuario(email);
        return notificacionRepository.countByUsuarioIdAndLeidaFalse(usuario.getId());
    }

    @Transactional
    public void marcarLeida(Long id, String email) {
        Usuario usuario = buscarUsuario(email);
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Notificación no encontrada"));

        if (!notificacion.getUsuario().getId().equals(usuario.getId())) {
            throw new RecursoNoEncontradoException("Notificación no encontrada");
        }

        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
    }

    @Transactional
    public void marcarTodasLeidas(String email) {
        Usuario usuario = buscarUsuario(email);
        List<Notificacion> noLeidas = notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuario.getId())
                .stream()
                .filter(n -> !Boolean.TRUE.equals(n.getLeida()))
                .toList();

        noLeidas.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(noLeidas);
    }

    @Transactional
    public void notificar(Usuario usuario, String mensaje) {
        notificacionRepository.save(new Notificacion(usuario, mensaje));
    }

    private Usuario buscarUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado"));
    }
}
