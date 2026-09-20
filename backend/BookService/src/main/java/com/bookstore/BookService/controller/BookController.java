package com.bookstore.BookService.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.BookService.DTO.request.OrderCount;
import com.bookstore.BookService.DTO.response.ResponseDTO;
import com.bookstore.BookService.model.Books;
import com.bookstore.BookService.service.BookService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/books")
@CrossOrigin(origins = "http://localhost:3000")
public class BookController {

    @Autowired
    private BookService service;

    // @GetMapping
    // public String Test() {
    // return "books";
    // }

    @GetMapping("dummy/{count}")
    public String insertDummy(@PathVariable int count) {
        return service.insertDummy(count);
    }

    // get books with cart
    // @PostMapping
    // public ResponseEntity<ResponseDTO> getAllBooks(@RequestBody UserBookCount
    // request) {
    // return service.getAllBooks(request);
    // }

    @GetMapping("all")
    public ResponseEntity<ResponseDTO> getAllBooks() {
        return service.getAllBooks();
    }

    @GetMapping
    public ResponseEntity<ResponseDTO> getAllBooksPaged(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam String search,
            @RequestParam String category,
            @RequestParam(defaultValue = "quantity,desc") String sortBy) {
        return service.getAllBooksPaged(page, size, search, category, sortBy);
    }

    @PostMapping("book")
    public ResponseEntity<ResponseDTO> addNewBook(@Valid @RequestBody Books request) {
        return service.addNewBook(request);
    }

    @GetMapping("{id}")
    public ResponseEntity<ResponseDTO> getBook(@PathVariable String id) {
        return service.getBook(id);
    }

    @PostMapping("{id}")
    public ResponseEntity<ResponseDTO> updateBook(@PathVariable String id, @Valid @RequestBody Books request) {
        return service.updateBook(id, request);
    }

    @PostMapping("suggestions")
    public ResponseEntity<ResponseDTO> getSuggestions(@RequestBody Books request) {
        return service.getSuggestions(request);
    }

    @PutMapping
    public ResponseEntity<ResponseDTO> updateBooksAsPerOrder(@RequestBody OrderCount request) {
        return service.updateBookCounts(request);
    }

    @PutMapping("updateBooks")
    public ResponseEntity<ResponseDTO> revertBooksAsPerOrder(@RequestBody OrderCount request) {
        return service.revertBooksCount(request);
    }

    @DeleteMapping("{id}")
    public ResponseEntity<ResponseDTO> deleteBook(@PathVariable String id) {
        return service.deleteBook(id);
    }
}
