package com.draxlmaier.assethub.module.auth.service;

import com.draxlmaier.assethub.module.auth.dto.ResetPasswordRequestDTO;
import com.draxlmaier.assethub.module.auth.model.PasswordResetToken;
import com.draxlmaier.assethub.module.auth.repository.PasswordResetTokenRepository;
import com.draxlmaier.assethub.module.employee.model.Employee;
import com.draxlmaier.assethub.module.employee.repository.EmployeeRepository;
import com.draxlmaier.assethub.module.notification.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final EmployeeRepository employeeRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void processForgotPassword(String email) {
        Employee employee = employeeRepository.findByEmail(email).orElse(null);

        if (employee == null) {
            return;
        }

        tokenRepository.deleteByEmployeeId(employee.getId());

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .employee(employee)
                .expiryDate(OffsetDateTime.now().plusMinutes(15))
                .build();
        tokenRepository.save(resetToken);

        String resetLink = "http://localhost:5173/reset-password?token=" + token;
        String emailBody = "Salut " + employee.getFirstName() + ",\n\n"
                + "S-a solicitat resetarea parolei pentru contul tău AssetHub.\n"
                + "Accesează link-ul de mai jos pentru a seta o parolă nouă:\n\n"
                + resetLink + "\n\n"
                + "Acest link este valabil timp de 15 minute. Dacă nu ai solicitat tu această modificare, "
                + "te rugăm să ignori acest mesaj, contul tău este în siguranță.\n\n"
                + "O zi bună,\nEchipa AssetHub";

        emailService.sendEmail(employee.getEmail(), "AssetHub - Solicitare Resetare Parolă", emailBody);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new RuntimeException("Parolele introduse nu coincid!");
        }

        PasswordResetToken resetToken = tokenRepository.findByToken(request.token())
                .orElseThrow(() -> new RuntimeException("Link-ul de resetare este invalid sau a fost deja folosit."));

        if (resetToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("Link-ul de resetare a expirat. Te rugăm să soliciți altul.");
        }

        Employee employee = resetToken.getEmployee();
        employee.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        employeeRepository.save(employee);

        tokenRepository.delete(resetToken);
    }
}