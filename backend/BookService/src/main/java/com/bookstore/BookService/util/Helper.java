package com.bookstore.BookService.util;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import com.bookstore.BookService.DTO.response.ResponseDTO;
import com.bookstore.BookService.DTO.response.SubResponse;
import com.bookstore.BookService.model.Books;
import com.bookstore.BookService.repository.BookRepository;

@Component
public class Helper {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private BookRepository repo;

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

    public Long generateDummyCounter() {
        String query = "select nextval('dummycounter')";
        try {
            return jdbc.queryForObject(query, Long.class);
        } catch (Exception e) {
            throw new UnsupportedOperationException("Error in generating Dummy Id");
        }
    }

    public SubResponse isExists(Books request) {
        SubResponse response = new SubResponse();
        Map<String, Object> errors = new HashMap<>();
        Books book = null;
        book = repo.findByUrl(request.getUrl());
        if (book != null) {
            errors.put("url", "Url already Exist");
        }

        book = repo.findByAuthorAndTitle(request.getAuthor(), request.getTitle());
        if (book != null) {
            errors.put("book", "Book already Exist");
        }

        if (errors.size() > 0) {
            response = subError(errors);
        } else {
            response = subSuccess("No Errors", null);
        }
        return response;

    }
}
