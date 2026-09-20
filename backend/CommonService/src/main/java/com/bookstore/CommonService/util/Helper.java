package com.bookstore.CommonService.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.bookstore.CommonService.DTO.response.ResponseDTO;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class Helper {

    @Autowired
    private JdbcTemplate jdbc;

    public ResponseDTO successResponse(String message, Object object) {
        return new ResponseDTO(true, message, null, object);
    }

    public ResponseDTO errorResponse(Object error) {
        return new ResponseDTO(false, "Error", error, null);
    }

    public String generateSuggestionId() {
        String query = "select 'SGT' || lpad(nextval('suggestid')::TEXT,13,'0')";
        try {
            return jdbc.queryForObject(query, String.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating Suggestion Id");
        }
    }

    public String generateWishlistId() {
        String query = "select 'WSH' || lpad(nextval('wishlistid')::TEXT,13,'0')";
        try {
            return jdbc.queryForObject(query, String.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating Wishlist Id");
        }
    }

    public String generateAccessId() {
        String query = "select 'APS' || lpad(nextval('accessid')::TEXT,13,'0')";
        try {
            return jdbc.queryForObject(query, String.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating Access Id");
        }
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
