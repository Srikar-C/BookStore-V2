package com.bookstore.CommonService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.CommonService.DTO.request.SuggestionDTO;
import com.bookstore.CommonService.DTO.response.ResponseDTO;
import com.bookstore.CommonService.service.CommonService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/common")
@CrossOrigin(origins = "http://localhost:3000")
public class CommonController {

    @Autowired
    private CommonService service;

    @PostMapping("suggestion")
    public ResponseEntity<ResponseDTO> addSuggestions(@RequestBody SuggestionDTO request, HttpServletRequest http) {
        return service.addSuggestions(request, http);
    }

    @GetMapping("suggestion")
    public ResponseEntity<ResponseDTO> getSuggestions() {
        return service.getSuggestions();
    }

    @GetMapping("{bookid}")
    public ResponseEntity<ResponseDTO> addWishlist(@PathVariable String bookid, HttpServletRequest http) {
        return service.addWishlist(bookid, http);
    }

    @PutMapping("{bookid}")
    public ResponseEntity<ResponseDTO> removeWishlist(@PathVariable String bookid, HttpServletRequest http) {
        return service.removeWishlist(bookid, http);
    }

    @GetMapping("wishlist")
    public ResponseEntity<ResponseDTO> getAllWishlist(HttpServletRequest http) {
        return service.getWishlists(http);
    }
}
