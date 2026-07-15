package backend.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    @GetMapping
    public void LogIn() {}

    @PostMapping
    public void LogIn(String username, String password) {}

    @GetMapping
    public void LogOut() {}

    @PostMapping
    public void Register() {}

    @PostMapping
    public void VerifyEmail() {}

    @GetMapping
    public void ResetPassword() {}
}
