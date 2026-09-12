package com.bookstore.CommonService.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.CommonService.DTO.request.SuggestionDTO;
import com.bookstore.CommonService.DTO.response.ResponseDTO;
import com.bookstore.CommonService.model.Suggestion;
import com.bookstore.CommonService.model.WishList;
import com.bookstore.CommonService.repository.SuggestionRepository;
import com.bookstore.CommonService.repository.WishListRepository;
import com.bookstore.CommonService.util.Helper;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class CommonService {

    @Autowired
    private Helper help;

    @Autowired
    private JWTService jwt;

    @Autowired
    private SuggestionRepository suggestRepo;

    @Autowired
    private WishListRepository wishRepo;

    public ResponseEntity<ResponseDTO> addSuggestions(SuggestionDTO request, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        System.out.println(request.toString() + " " + http.toString());
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
            Suggestion suggestion = new Suggestion();
            suggestion.setId(help.generateSuggestionId());
            suggestion.setUserid(jwt.extractUserId(token));
            suggestion.setUsername(jwt.extractUsername(token));
            suggestion.setSuggestion(request.getSuggestion());
            suggestRepo.save(suggestion);
            response = help.success("Suggestion Sent", null);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
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

    public ResponseEntity<ResponseDTO> addWishlist(String bookid, HttpServletRequest http) {
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
            List<String> bookids = null;
            String userid = jwt.extractUserId(token);
            WishList wishlist = wishRepo.findByUserid(userid);
            if (wishlist == null) {
                wishlist = new WishList();
                System.out.println("hi");
                wishlist.setId(help.generateWishlistId());
                wishlist.setUserid(userid);
                bookids = new ArrayList<>();
                bookids.add(bookid);
            } else {
                bookids = wishlist.getBookIds();
                if (bookids == null) {
                    bookids = new ArrayList<>();
                }
                bookids.add(bookid);
            }
            wishlist.setBookIds(bookids);
            wishRepo.save(wishlist);
            response = help.success("Wishlisted", wishlist);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getWishlists(HttpServletRequest http) {
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
            WishList wishlist = wishRepo.findByUserid(jwt.extractUserId(token));
            if (wishlist == null) {
                response = help.success("Fetched Wishlist", null);
            } else {
                response = help.success("Fetched Wishlist", wishlist.getBookIds());
            }
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> removeWishlist(String bookid, HttpServletRequest http) {
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
            WishList wishList = wishRepo.findByUserid(userid);
            List<String> bookids = wishList.getBookIds();
            bookids.remove(bookid);
            wishList.setBookIds(bookids);
            wishRepo.save(wishList);
            response = help.success("Wishlisted Updated", wishList);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

    public ResponseEntity<ResponseDTO> getSuggestions() {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Suggestion> suggestions = suggestRepo.findAll();
            System.out.println("Got auggestions: " + suggestions.toString());
            response = help.success("Fetched suggestions", suggestions);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> deleteWishlist(String userid) {
        ResponseDTO response = new ResponseDTO();
        System.out.println("userid: " + userid);
        try {
            wishRepo.deleteByUserid(userid);
            response = help.success("Fetched suggestions", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
