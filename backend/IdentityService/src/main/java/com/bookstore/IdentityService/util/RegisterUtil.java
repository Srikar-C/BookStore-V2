package com.bookstore.IdentityService.util;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.bookstore.IdentityService.DTO.request.RegisterDTO;
import com.bookstore.IdentityService.DTO.response.SubResponse;
import com.bookstore.IdentityService.model.Users;
import com.bookstore.IdentityService.model.VerifyUsers;
import com.bookstore.IdentityService.repository.UserRepository;
import com.bookstore.IdentityService.repository.VerifyUserRepository;

@Component
public class RegisterUtil {

    @Autowired
    private VerifyUserRepository verifyUserRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private Helper help;

    @Autowired
    private BCryptPasswordEncoder encoder;

    public SubResponse isExists(RegisterDTO request) {
        SubResponse response = new SubResponse();
        Map<String, Object> errors = new HashMap<>();
        Users user = null;
        user = userRepo.findByName(request.getName());
        if (user != null) {
            errors.put("name", "Username already exists");
        }

        user = userRepo.findByEmail(request.getEmail());
        if (user != null) {
            errors.put("email", "Email already exists");
        }

        user = userRepo.findByPhone(request.getPhone());
        if (user != null) {
            errors.put("phone", "Phone Number already exists");
        }
        if (errors.size() > 0) {
            response = help.subError(errors);
        } else {
            response = help.subSuccess("No Errors", null);
        }
        return response;
    }

    public SubResponse create(RegisterDTO request) {
        SubResponse response = new SubResponse();
        Users user = new Users();
        try {
            user.setId(help.generateUserId());
        } catch (Exception e) {
            response = help.subError("Error in creating UserId " + e.getMessage());
            return response;
        }
        user.setName(request.getName().toLowerCase());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(encoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        if (request.getRole().equals("ADMIN")) {
            user.setActive(true);
        } else {
            user.setActive(false);
        }

        try {
            Users registeredUser = userRepo.save(user);
            response = help.subSuccess("User Registered Successfully", registeredUser);
        } catch (Exception e) {
            response = help.subError("Error in registering User " + e.getMessage());
        }
        return response;
    }

    public SubResponse createVerify(RegisterDTO request) {
        SubResponse response = new SubResponse();
        String token = "";
        VerifyUsers verifyUser = new VerifyUsers();

        VerifyUsers check;
        do {
            token = UUID.randomUUID().toString();
            check = verifyUserRepo.findByToken(token);
        } while (check != null);
        verifyUser.setToken(token);
        verifyUser.setEmail(request.getEmail());
        try {
            verifyUser.setOtp(help.generateOTP());
        } catch (Exception e) {
            response = help.subError("Error in generating OTP " + e.getMessage());
            return response;
        }
        verifyUser.setOtpSession(Instant.now());
        verifyUser.setRequestCount(1);
        verifyUser.setUsed(false);

        try {
            VerifyUsers savedVerifyUser = verifyUserRepo.save(verifyUser);
            response = help.subSuccess("User created", savedVerifyUser);
        } catch (Exception e) {
            response = help.subError("Error in registering User " + e.getMessage());
        }
        return response;
    }

}
