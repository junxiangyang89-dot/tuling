package com.example.webpj.filter;

import com.example.webpj.util.JwtUtil;
import org.apache.commons.lang3.StringUtils;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil,
                                   UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        // 排除注册接口和登录接口
        if (path.startsWith("/api/auth/register") || path.startsWith("/api/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String header = request.getHeader(jwtUtil.getTokenHeader());
            if (StringUtils.isNotEmpty(header) && header.startsWith(jwtUtil.getTokenPrefix())) {
                String token = header.substring(jwtUtil.getTokenPrefix().length());
                
                // 确保令牌不为空且格式正确
                if (StringUtils.isNotEmpty(token) && token.trim().length() > 0) {
                    String username = null;
                    try {
                        username = jwtUtil.extractUsername(token);
                    } catch (Exception e) {
                        logger.warn("Invalid JWT token: " + e.getMessage());
                    }

                    if (StringUtils.isNotEmpty(username) &&
                            SecurityContextHolder.getContext().getAuthentication() == null) {

                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtUtil.validateToken(token, userDetails)) {
                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            userDetails,
                                            null,
                                            userDetails.getAuthorities());
                            authentication.setDetails(
                                    new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(authentication);
                        }
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}
