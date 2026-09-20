package com.bookstore.IdentityService.util;

import java.time.Duration;
import java.time.Instant;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.DTO.response.SubResponse;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class Helper {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private JavaMailSender mailSender;

    public ResponseDTO successResponse(String message, Object object) {
        return new ResponseDTO(true, message, null, object);
    }

    public ResponseDTO errorResponse(Object error) {
        return new ResponseDTO(false, "Error", error, null);
    }

    public SubResponse subSuccess(String message, Object object) {
        return new SubResponse(true, message, null, object);
    }

    public SubResponse subError(Object error) {
        return new SubResponse(false, "Error", error, null);
    }

    public String generateUserId() {
        String query = "select 'USR' || lpad(nextval('userid')::TEXT,13,'0')";
        try {
            return jdbc.queryForObject(query, String.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating User Id");
        }
    }

    public Long generateDummyCounter() {
        String query = "select nextval('dummycounter')";
        try {
            return jdbc.queryForObject(query, Long.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating Dummy Id");
        }
    }

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public SubResponse sendOTP(String email, String name, String otp) {
        SubResponse response = new SubResponse();
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Your BookStore OTP Code");
            message.setText("Hello " + name + "\nYour Login OTP: " + otp + "\nOTP Expires in 5 minutes");
            mailSender.send(message);
            response = subSuccess("OTP sent Successfully", otp);
        } catch (Exception e) {
            response = subError(e.getMessage());
        }
        return response;
    }

    public Duration calculateDuration(Instant otPsession) {
        Instant storedTime = Instant.parse(otPsession.toString());
        Instant now = Instant.now();
        Duration duration = Duration.between(storedTime, now);
        return duration;
    }

    public boolean isSpecified(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public ResponseDTO checkUserExistence(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = errorResponse("Not Logged In");
            return response;
        }
        response = successResponse("User Exist", token);
        return response;
    }
    
    private String getTokenFromCookie(Cookie[] cookies) {
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("token")) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
