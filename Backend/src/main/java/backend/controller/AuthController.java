package backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @GetMapping("/login")
    public void LogIn() {}

    @PostMapping("/login")
    public void LogIn(String username, String password) {}

    @GetMapping("/logout")
    public void LogOut() {}

    @PostMapping("/register")
    public void Register() {}

    @PostMapping("/verifyEmail")
    public void VerifyEmail() {}

    @GetMapping("/resetPassword")
    public void ResetPassword() {}
}
