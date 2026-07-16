package backend.config;

import backend.Security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Kích hoạt CORS để nhận cấu hình từ WebConfig
                .cors(org.springframework.security.config.Customizer.withDefaults())
                // Disable CSRF — REST API không cần CSRF
                .csrf(AbstractHttpConfigurer::disable)
                // Set session management to stateless
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Permit các endpoints trong AuthController
                        .requestMatchers("/api/auth/**").permitAll()
                        // Permit các endpoints trong AuthController cũ / endpoints công khai khác
                        .requestMatchers("/login", "/register", "/logout", "/verifyEmail", "/resetPassword").permitAll()
                        // Permit VNPay payment callback
                        .requestMatchers("/api/payment/vnpay_return").permitAll()
                        // Yêu cầu role ADMIN cho các API admin
                        .requestMatchers("/api/admin/**", "/admin/**").hasRole("ADMIN")
                        // Permit các API và uploads cho frontend (các endpoint cần phân quyền cụ thể có thể điều chỉnh sau)
                        .requestMatchers("/api/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/api-docs/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                // Add JWT filter before UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}