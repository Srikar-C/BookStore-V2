package com.bookstore.BookService.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;

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

        SubResponse existsBook = help.isExists(request);
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

    public ResponseEntity<ResponseDTO> getSuggestions(Books request) {
        ResponseDTO response = new ResponseDTO();
        System.out.println("request for suggestions" + request.toString());
        try {
            List<Books> books = repo.findByCategory(request.getCategory());
            List<BookCountDTO> userBooks = new ArrayList<>();
            Set<String> addedBookIds = new HashSet<>();
            addSuggestions(request, books, userBooks, addedBookIds);
            if (books.size() < 6) {
                books = repo.findByTitle(request.getTitle());
                addSuggestions(request, books, userBooks, addedBookIds);
            }
            if (userBooks.size() >= 6) {
                userBooks = userBooks.subList(0, 6);
                response = help.success("Got suggestions", userBooks);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
            if (books.size() < 6) {
                books = repo.findAllByOrderByQuantityDesc();
                addSuggestions(request, books, userBooks, addedBookIds);
            }
            if (userBooks.size() >= 6) {
                userBooks = userBooks.subList(0, 6);
            }
            response = help.success("Got suggestions", userBooks);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private void addSuggestions(Books request, List<Books> books, List<BookCountDTO> userBooks,
            Set<String> addedBookIds) {
        for (Books book : books) {
            if (userBooks.size() >= 6) {
                break;
            }
            if (book.getId().equals(request.getId())) {
                continue;
            }
            if (book.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            if (addedBookIds.contains(book.getId())) {
                continue;
            }
            BookCountDTO b = new BookCountDTO(book.getId(), book.getAuthor(), book.getTitle(),
                    book.getDescription(), book.getUrl(), book.getCategory(), book.getQuantity(),
                    book.getPrice(),
                    BigDecimal.ZERO, false);
            userBooks.add(b);
            addedBookIds.add(book.getId());
        }
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

    public String insertDummy(int count) {
        List<Books> books = new ArrayList<>();
        List<String> cats = repo.findDistinctCategory();
        for (int i = 1; i <= count; i++) {
            Books book = new Books();
            Long counter = help.generateDummyCounter();
            book.setId("DMY" + counter);
            book.setAuthor("Author" + counter);
            book.setDescription(
                    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora blanditiis iusto inventore soluta earum, corrupti distinctio autem vero impedit alias harum, explicabo similique fugiat exercitationem quisquam itaque aliquam omnis illo.");
            book.setTitle("Title" + counter);
            book.setPrice(BigDecimal.valueOf(100 * counter));
            Random random = new Random();
            book.setQuantity(BigDecimal.valueOf(10 + random.nextInt(350)));
            book.setCategory(cats.get(random.nextInt(cats.size() - 1)));
            book.setUrl(
                    "https://blog-cdn.reedsy.com/directories/admin/featured_image/591/dissecting-the-cover-of-a-book-8fbcaf.webp");
            books.add(book);
        }
        try {
            repo.saveAll(books);
            return "Inserted " + count + " rows books";
        } catch (Exception e) {
            return e.toString();
        }
    }

    public ResponseEntity<ResponseDTO> getAllBooksPaged(int pageNumber, int pageSize, String search, String category,
            String sortBy) {
        ResponseDTO response = new ResponseDTO();
        try {
            System.out.println(pageNumber + " " + pageSize + " " + search + " " + category + " " + sortBy);
            boolean hasCategory = category != null && !category.isEmpty() && !category.isBlank()
                    && !category.equals("All");
            boolean hasSearch = search != null && !search.isEmpty() && !search.isBlank();

            String[] sortParts = sortBy.split(",");
            String sortField = sortParts[0];
            String sortDirection = sortParts.length > 1 ? sortParts[1] : "asc";
            Sort.Direction direction = sortDirection.equalsIgnoreCase("desc")
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(pageNumber, pageSize,
                    Sort.by(direction, sortField));
            Page<Books> books;

            if (hasCategory && hasSearch) {
                books = repo.findByCategoryAndTitleContainingIgnoreCase(category, search, pageable);
            } else if (hasCategory) {
                books = repo.findByCategory(category, pageable);
            } else if (hasSearch) {
                books = repo.findByTitleContainingIgnoreCase(search, pageable);
            } else {
                books = repo.findAll(pageable);
            }

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

    public ResponseEntity<ResponseDTO> deleteBook(String id) {
        ResponseDTO response = new ResponseDTO();
        try {
            repo.deleteById(id);
            response = help.success("Book Deleted Successfully", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

}
