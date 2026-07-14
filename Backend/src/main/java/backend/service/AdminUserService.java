package backend.service;

import backend.model.User;
import backend.model.enums.Role;
import backend.model.enums.UserStatus;
import backend.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public class AdminUserService {
    private UserRepository userRepository;
    public Page<User> getUsers(String keyword, Pageable pageable){
        if(keyword == null || keyword.isBlank()){
            return userRepository.findAll(pageable);
        }
        return userRepository
                .findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        keyword,
                        keyword,
                        pageable
                );

    }
    public User getUser(Long id){
        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

    }
    public void updateRole(Long id, Role role){
        User user = getUser(id);
        user.setRole(role);
        userRepository.save(user);

    }
    public void updateStatus(Long id){
        User user = getUser(id);
        if(user.getStatus() == UserStatus.ACTIVE){
            user.setStatus(UserStatus.BANNED);
        }else{
            user.setStatus(UserStatus.ACTIVE);
        }
        userRepository.save(user);
    }

}

