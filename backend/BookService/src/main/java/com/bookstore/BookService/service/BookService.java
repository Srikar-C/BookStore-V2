package com.bookstore.BookService.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.BookService.DTO.request.BookCount;
import com.bookstore.BookService.DTO.request.BookCountDTO;
import com.bookstore.BookService.DTO.request.SingleObject;
import com.bookstore.BookService.DTO.request.UserBookCount;
import com.bookstore.BookService.DTO.response.ResponseDTO;
import com.bookstore.BookService.DTO.response.SubResponse;
import com.bookstore.BookService.model.Books;
import com.bookstore.BookService.repository.BookRepository;
import com.bookstore.BookService.util.Helper;

@Service
public class BookService {

    @Autowired
    private BookRepository repo;

    @Autowired
    private Helper help;

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> addNewBook(Books request) {
        ResponseDTO response = new ResponseDTO();

        SubResponse existsBook = isExists(request);
        if (!existsBook.isSuccess()) {
            response = help.error(existsBook.getError());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Books newBook = new Books();
        try {
            newBook.setId(help.generateBookId());
        } catch (Exception e) {
            response = help.error(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
        newBook.setAuthor(request.getAuthor());
        newBook.setCategory(request.getCategory());
        newBook.setDescription(request.getDescription());
        newBook.setPrice(request.getPrice());
        newBook.setQuantity(request.getQuantity());
        newBook.setTitle(request.getTitle());
        newBook.setUrl(request.getUrl());
        newBook.setUpdatedBy(request.getId());
        try {
            Books savedBook = repo.save(newBook);
            response = help.success("Book Created", savedBook);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private SubResponse isExists(Books request) {
        SubResponse response = new SubResponse();
        Map<String, Object> errors = new HashMap<>();
        Books book = null;
        book = repo.findByUrl(request.getUrl());
        if (book != null) {
            errors.put("url", "Url already Exist");
        }

        book = repo.findByTitle(request.getTitle());
        if (book != null) {
            errors.put("title", "Title already Exist");
        }

        book = repo.findByAuthorAndTitle(request.getAuthor(), request.getTitle());
        if (book != null) {
            errors.put("book", "Book already Exist");
        }

        if (errors.size() > 0) {
            response = help.subError(errors);
        } else {
            response = help.subSuccess("No Errors", null);
        }
        return response;

    }

    public ResponseEntity<ResponseDTO> getAllBooks(UserBookCount request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Map<String, BigDecimal> counts = new HashMap<>();
            for (BookCount b : request.getBooks()) {
                counts.put(b.getBookId(), b.getCount());
            }
            List<Books> books = repo.findAll();
            Map<String, Object> hm = new HashMap<>();
            List<BookCountDTO> userBooks = new ArrayList<>();

            for (Books book : books) {
                BookCountDTO b = new BookCountDTO(book.getId(), book.getAuthor(), book.getTitle(),
                        book.getDescription(), book.getUrl(), book.getCategory(), book.getQuantity(), book.getPrice(),
                        counts.getOrDefault(book.getId(), BigDecimal.ZERO));
                userBooks.add(b);
            }
            hm.put("books", userBooks);
            List<String> cats = repo.findDistinctCategory();
            hm.put("category", cats);
            response = help.success("Books Fetched", hm);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getBook(String id) {
        ResponseDTO response = new ResponseDTO();
        try {
            Books b = repo.findById(id).orElse(new Books());
            response = help.success("Book Fetched", b);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> updateBook(String id, Books request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Books b = repo.findById(id).orElse(new Books());
            b.setAuthor(request.getAuthor());
            b.setCategory(request.getCategory());
            b.setDescription(request.getDescription());
            b.setPrice(request.getPrice());
            b.setQuantity(request.getQuantity());
            b.setTitle(request.getTitle());
            b.setUrl(request.getUrl());
            b.setUpdatedBy(request.getId());
            Books savedBook = repo.save(b);
            response = help.success("Updated Successfully", savedBook);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getSuggestions(SingleObject request) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Books> books = repo.findByCategory(request.getRequest());
            List<BookCountDTO> userBooks = new ArrayList<>();
            for (Books book : books) {
                BookCountDTO b = new BookCountDTO(book.getId(), book.getAuthor(), book.getTitle(),
                        book.getDescription(), book.getUrl(), book.getCategory(), book.getQuantity(), book.getPrice(),
                        BigDecimal.ZERO);
                userBooks.add(b);
            }
            response = help.success("Got suggestions", userBooks);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
