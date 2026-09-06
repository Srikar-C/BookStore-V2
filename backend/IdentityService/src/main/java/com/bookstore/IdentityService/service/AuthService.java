package com.bookstore.IdentityService.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.IdentityService.DTO.request.OTPDTO;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.model.Users;
import com.bookstore.IdentityService.repository.UserRepository;
import com.bookstore.IdentityService.util.Helper;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {

    @Autowired
    private Helper help;

    @Autowired
    private JWTService jwt;

    @Autowired
    private UserRepository repo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    public ResponseEntity<ResponseDTO> getCurrentUser(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
            String username = jwt.extractUsername(token);
            Users user = repo.findByName(username);
            response = help.success("User Fetched", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String getTokenFromCookie(Cookie[] cookies) {
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("token")) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public ResponseEntity<ResponseDTO> checkAdmin(HttpServletRequest request) {
        ResponseDTO response = new ResponseDTO();
        try {
            String token = null;
            if (request.getCookies() != null) {
                token = getTokenFromCookie(request.getCookies());
            }
            if (token == null) {
                response = help.error("Not Logged In");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            String username = jwt.extractUsername(token);
            Users user = repo.findByName(username);
            if (user.getRole().equals("ADMIN")) {
                response = help.success("User Fetched", null);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                response = help.error("Forbidden");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> logout(HttpServletResponse request) {
        ResponseDTO response = new ResponseDTO();
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true in production
        cookie.setPath("/");
        cookie.setMaxAge(0); // Deletes the cookie

        request.addCookie(cookie);

        response = help.success("Successfully Logged Out", null);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    public ResponseEntity<ResponseDTO> passwordVerify(OTPDTO request, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
            String userid = jwt.extractUserId(token);
            Users user = repo.findById(userid).orElse(new Users());
            if (user == null) {
                response = help.error("No User");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (!encoder.matches(request.getEmail(), user.getPassword())) {
                response = help.error("Incorrect Password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            response = help.success("Password Correct", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> deleteUser(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
            System.out.println("user token: " + token);
            String userid = jwt.extractUserId(token);
            repo.deleteById(userid);
            response = help.success("Identity Deleted", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
