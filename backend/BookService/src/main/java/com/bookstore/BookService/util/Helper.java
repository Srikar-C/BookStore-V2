package com.bookstore.BookService.util;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.bookstore.BookService.DTO.response.ResponseDTO;
import com.bookstore.BookService.DTO.response.SubResponse;

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

    public SubResponse subSuccess(String message, Object object) {
        return new SubResponse(true, message, null, object);
    }

    public SubResponse subError(Object error) {
        return new SubResponse(false, "Error", error, null);
    }

    public String generateBookId() {
        String query = "select 'BKS' || lpad(nextval('bookid')::TEXT,13,'0')";
        try {
            return jdbc.queryForObject(query, String.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating User Id");
        }
    }
}
