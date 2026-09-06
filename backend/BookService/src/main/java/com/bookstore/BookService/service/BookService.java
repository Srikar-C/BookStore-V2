package com.bookstore.BookService.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.BookService.DTO.request.BookCount;
import com.bookstore.BookService.DTO.request.BookCountDTO;
import com.bookstore.BookService.DTO.request.BookOrderCount;
import com.bookstore.BookService.DTO.request.OrderCount;
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

    public ResponseEntity<ResponseDTO> getAllBooks() {
        ResponseDTO response = new ResponseDTO();
        Map<String, Object> hm = new HashMap<>();
        try {
            List<Books> books = repo.findAllByOrderByQuantityDesc();
            hm.put("books", books);
            List<String> cats = repo.findDistinctCategory();
            hm.put("category", cats);
            response = help.success("Books Fetched", hm);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getAllBooks(UserBookCount request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Map<String, BigDecimal> counts = new HashMap<>();
            for (BookCount b : request.getBooks()) {
                counts.put(b.getBookId(), b.getCount());
            }
            List<Books> books = repo.findAllByOrderByQuantityDesc();
            Map<String, Object> hm = new HashMap<>();
            List<BookCountDTO> userBooks = new ArrayList<>();

            for (Books book : books) {
                BookCountDTO b = new BookCountDTO(book.getId(), book.getAuthor(), book.getTitle(),
                        book.getDescription(), book.getUrl(), book.getCategory(), book.getQuantity(), book.getPrice(),
                        counts.getOrDefault(book.getId(), BigDecimal.ZERO), false);
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
                        BigDecimal.ZERO, false);
                userBooks.add(b);
            }
            response = help.success("Got suggestions", userBooks);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> updateBookCounts(OrderCount request) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<BookOrderCount> order = request.getBooks();
            for (int i = 0; i < order.size(); i++) {
                Books b = repo.findById(order.get(i).getBookId()).orElse(new Books());
                b.setQuantity(b.getQuantity().subtract(order.get(i).getCount()));
                repo.save(b);
                System.out.println("Book updated for Id " + b.getId());
            }
            response = help.success("Book Quantities Updated", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public String insertDummy() {
        List<Books> books = new ArrayList<>();
        String[] categories = {
                "Fiction",
                "Science",
                "Technology",
                "History",
                "Biography",
                "Fantasy",
                "Mystery",
                "Programming"
        };
        for (int i = 1; i <= 100; i++) {
            Books book = new Books();
            book.setId("DMY" + i);
            book.setAuthor("Author" + i);
            book.setDescription(
                    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora blanditiis iusto inventore soluta earum, corrupti distinctio autem vero impedit alias harum, explicabo similique fugiat exercitationem quisquam itaque aliquam omnis illo.");
            book.setTitle("Title" + 1);
            book.setPrice(BigDecimal.valueOf(100 * i));
            Random random = new Random();
            book.setQuantity(BigDecimal.valueOf(10 + random.nextInt(90)));
            book.setCategory(categories[(i - 1) % categories.length]);
            book.setUrl(
                    "https://blog-cdn.reedsy.com/directories/admin/featured_image/591/dissecting-the-cover-of-a-book-8fbcaf.webp");
            books.add(book);
        }
        try {
            repo.saveAll(books);
            return "Inserted 100 rows books";
        } catch (Exception e) {
            return e.toString();
        }
    }

    public ResponseEntity<ResponseDTO> getAllBooks(int pageNumber, int pageSize) {
        ResponseDTO response = new ResponseDTO();
        try {

            Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("quantity").descending());
            Page<Books> books = repo.findAllByOrderByQuantityDesc(pageable);
            Map<String, Object> hm = new HashMap<>();
            hm.put("books", books);
            List<String> cats = repo.findDistinctCategory();
            hm.put("category", cats);

            Map<String, Object> result = new HashMap<>();
            result.put("content", hm);
            result.put("pageNumber", books.getNumber());
            result.put("totalPages", books.getTotalPages());
            result.put("totalElements", books.getTotalElements());
            result.put("pageSize", books.getSize());
            result.put("isFirst", books.isFirst());
            result.put("isLast", books.isLast());
            response = help.success("Fetched Books", result);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
