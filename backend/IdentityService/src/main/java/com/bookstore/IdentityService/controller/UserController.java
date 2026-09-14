package com.bookstore.IdentityService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.IdentityService.DTO.request.LoginDTO;
import com.bookstore.IdentityService.DTO.request.OTPDTO;
import com.bookstore.IdentityService.DTO.request.RegisterDTO;
import com.bookstore.IdentityService.DTO.request.ResetDTO;
import com.bookstore.IdentityService.DTO.request.SingleObject;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserService service;

    // @GetMapping
    // public String Test() {
    // return "hello";
    // }

    @GetMapping("dummy/{count}/{role}")
    public String insertDummy(@PathVariable Integer count, @PathVariable String role) {
        return service.insertDummy(count, role);
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseDTO> login(@Valid @RequestBody LoginDTO request, HttpServletResponse http) {
        return service.login(request, http);
    }

    @PostMapping("/register")
    public ResponseEntity<ResponseDTO> register(@Valid @RequestBody RegisterDTO request) {
        return service.register(request);
    }

    @PostMapping("/email")
    public ResponseEntity<ResponseDTO> getEmail(@RequestBody SingleObject request) {
        return service.getEmail(request);
    }

    @PostMapping("/verifyOTP")
    public ResponseEntity<ResponseDTO> verifyOTP(@RequestBody OTPDTO request) {
        return service.verifyOTP(request);
    }

    @PostMapping("/sendOTP")
    public ResponseEntity<ResponseDTO> sendOTP(@RequestBody OTPDTO request) {
        return service.sendOTP(request);
    }

    @PatchMapping("/reset")
    public ResponseEntity<ResponseDTO> resetPassword(@RequestBody ResetDTO request) {
        return service.resetPassword(request);
    }

    // @GetMapping
    // public ResponseEntity<ResponseDTO> getAllUsers(HttpServletRequest http) {
    // return service.getAllUsers(http);
    // }

    @GetMapping
    public ResponseEntity<ResponseDTO> getAllUsersPaged(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "USER") String role,
            HttpServletRequest http) {
        return service.getAllUsers(page, size, role, http);
    }

    @GetMapping("{userid}")
    public ResponseEntity<ResponseDTO> accessPrivilege(@PathVariable String userid, HttpServletRequest http) {
        return service.accessPrivilege(userid, http);
    }

    @GetMapping("/users")
    public ResponseEntity<ResponseDTO> getAllUsers() {
        return service.getAllUsers();
    }

}
