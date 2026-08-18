package com.bookstore.IdentityService.service;

import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.IdentityService.DTO.request.LoginDTO;
import com.bookstore.IdentityService.DTO.request.OTPDTO;
import com.bookstore.IdentityService.DTO.request.RegisterDTO;
import com.bookstore.IdentityService.DTO.request.ResetDTO;
import com.bookstore.IdentityService.DTO.request.SingleObject;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.DTO.response.SubResponse;
import com.bookstore.IdentityService.model.Users;
import com.bookstore.IdentityService.model.VerifyUsers;
import com.bookstore.IdentityService.repository.UserRepository;
import com.bookstore.IdentityService.repository.VerifyUserRepository;
import com.bookstore.IdentityService.util.Helper;
import com.bookstore.IdentityService.util.RegisterUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class UserService {

    @Autowired
    private Helper help;

    @Autowired
    private RegisterUtil registerUtil;

    @Autowired
    private VerifyUserRepository verifyUserRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JWTService jwt;

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> register(RegisterDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            // Existence Check in Main Table
            SubResponse existMain = registerUtil.isExists(request);
            if (!existMain.isSuccess()) {
                response = help.error(existMain.getError());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Create in Users Table
            SubResponse creation = registerUtil.create(request);
            if (!creation.isSuccess()) {
                response = help.error(creation.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            if (request.getRole().equals("ADMIN")) {
                response = help.success("Successfully Registered", creation.getData());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }

            // Create in Verify Table
            SubResponse verifyCreation = registerUtil.createVerify(request);
            if (!verifyCreation.isSuccess()) {
                response = help.error(verifyCreation.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            // Sending OTP To Email
            Users user = (Users) creation.getData();
            VerifyUsers verifyUser = (VerifyUsers) verifyCreation.getData();
            SubResponse sendingOTPToEmail = help.sendOTP(user.getEmail(), user.getName(), verifyUser.getOtp());
            if (!sendingOTPToEmail.isSuccess()) {
                response = help.error(sendingOTPToEmail.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            response = help.success("User Registered. Please Verify", verifyUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getEmail(SingleObject request) {
        ResponseDTO response = new ResponseDTO();
        try {
            VerifyUsers user = verifyUserRepo.findByToken(request.getToken());
            response = help.success("Fetched User", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> verifyOTP(OTPDTO request) {
        ResponseDTO response = new ResponseDTO();
        if (!help.isSpecified(request.getOtp())) {
            response = help.error("OTP is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        try {
            VerifyUsers verifyUser = verifyUserRepo.findByEmail(request.getEmail());
            if (verifyUser == null) {
                response = help.error("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (verifyUser.isUsed()) {
                response = help.error("OTP already Used, Please request again");
                return ResponseEntity.status(HttpStatus.GONE).body(response);
            }
            Duration time = help.calculateDuration(verifyUser.getOtpSession());
            System.out.println("TIme: " + time + " " + time.getSeconds());
            if (time.getSeconds() >= 301) {
                response = help.error("OTP Expired, Request again");
                return ResponseEntity.status(HttpStatus.GONE).body(response);
            }
            if (!request.getOtp().toString().equals(verifyUser.getOtp())) {
                response = help.error("Invalid OTP");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            verifyUser.setUsed(true);
            VerifyUsers updatedVerifyUsers = verifyUserRepo.save(verifyUser);

            Users user = userRepo.findByEmail(updatedVerifyUsers.getEmail());
            user.setActive(true);
            Users updatedUser = userRepo.save(user);
            response = help.success("OTP Verified", updatedUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> sendOTP(OTPDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            VerifyUsers verifyUsers = verifyUserRepo.findByEmail(request.getEmail());
            if (verifyUsers == null) {
                response = help.error("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (verifyUsers.getRequestCount() > 5) {
                Duration time = help.calculateDuration(verifyUsers.getOtpSession());
                System.out.println("TIme: " + time + " " + time.getSeconds());
                if (time.getSeconds() < 901) {
                    response = help.error("OTP Limit Exceeded, Try after 15 minutes");
                    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
                } else {
                    verifyUsers.setRequestCount(0);
                }
            }
            String otp = help.generateOTP();

            Users user = userRepo.findByEmail(request.getEmail());

            SubResponse sendingOTPTOEmail = help.sendOTP(verifyUsers.getEmail(), user.getName(), otp);
            if (!sendingOTPTOEmail.isSuccess()) {
                response = help.error(sendingOTPTOEmail.getError());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            verifyUsers.setOtp(otp);
            verifyUsers.setOtpSession(Instant.now());
            verifyUsers.setRequestCount(verifyUsers.getRequestCount() + 1);
            verifyUsers.setUsed(false);
            verifyUserRepo.save(verifyUsers);
            response = help.success("OTP Sent Successfully", verifyUsers);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> resetPassword(ResetDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Users user = userRepo.findByEmail(request.getEmail());
            if (!request.getPassword().toString().equals(request.getCfnpassword().toString())) {
                response = help.error("Passwords Not Same");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            user.setPassword(encoder.encode(request.getPassword()));
            userRepo.save(user);
            response = help.success("Password Changed Successfully", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> login(LoginDTO request, HttpServletResponse http) {
        ResponseDTO response = new ResponseDTO();
        request.setName(request.getName().toLowerCase());
        try {
            Users user = userRepo.findByEmailOrName(request.getName(), request.getName());
            if (user == null) {
                response = help.error("User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            if (!user.isActive()) {
                response = help.error("User Not Verified");
                String otp = help.generateOTP();
                SubResponse sendingOTPTOEmail = help.sendOTP(user.getEmail(), user.getName(), otp);
                if (!sendingOTPTOEmail.isSuccess()) {
                    response = help.error(sendingOTPTOEmail.getError());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                VerifyUsers verifyUsers = verifyUserRepo.findByEmail(request.getName());
                verifyUsers.setOtp(otp);
                verifyUsers.setOtpSession(Instant.now());
                verifyUsers.setRequestCount(verifyUsers.getRequestCount() + 1);
                verifyUsers.setUsed(false);
                verifyUserRepo.save(verifyUsers);
                response = help.success("OTP Sent Successfully", verifyUsers);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
            if (!encoder.matches(request.getPassword(), user.getPassword())) {
                response = help.error("Incorrect Password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            String token = jwt.generateToken(user);
            Cookie cookie = new Cookie("token", token);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // true in production (HTTPS)
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            http.addCookie(cookie);
            response = help.success("User Found", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
