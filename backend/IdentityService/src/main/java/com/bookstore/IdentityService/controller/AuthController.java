package com.bookstore.IdentityService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.IdentityService.DTO.request.OTPDTO;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/auths")
public class AuthController {

    @Autowired
    private AuthService service;

    @GetMapping("me")
    public ResponseEntity<ResponseDTO> getCurrentUser(HttpServletRequest request) {
        return service.getCurrentUser(request);
    }

    @GetMapping("admin")
    public ResponseEntity<ResponseDTO> isAdmin(HttpServletRequest request) {
        return service.checkAdmin(request);
    }

    @GetMapping("logout")
    public ResponseEntity<ResponseDTO> logout(HttpServletResponse request) {
        return service.logout(request);
    }

    @PostMapping
    public ResponseEntity<ResponseDTO> passwordVerify(@RequestBody OTPDTO request, HttpServletRequest http) {
        return service.passwordVerify(request, http);
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> deleteUser(HttpServletRequest req, HttpServletResponse resp) {
        return service.deleteUser(req, resp);
    }
}
