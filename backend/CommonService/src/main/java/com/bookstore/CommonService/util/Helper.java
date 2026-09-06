package com.bookstore.CommonService.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.bookstore.CommonService.DTO.response.ResponseDTO;

@Component
public class Helper {

    @Autowired
    private JdbcTemplate jdbc;

    public ResponseDTO success(String message, Object object) {
        return new ResponseDTO(true, message, null, object);
    }

    public ResponseDTO error(Object error) {
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

}
