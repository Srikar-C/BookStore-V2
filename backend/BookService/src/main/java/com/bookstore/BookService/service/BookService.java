package com.bookstore.BookService.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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

    private static final Logger logger = LoggerFactory.getLogger(BookService.class);

    private final BookRepository repo;

    private final Helper help;

    public BookService(BookRepository repo, Helper help) {
        this.repo = repo;
        this.help = help;
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> addNewBook(Books request) {
        ResponseDTO response = new ResponseDTO();

        SubResponse existsBook = help.isExists(request);
        if (!existsBook.isSuccess()) {
            response = help.errorResponse(existsBook.getError());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        Books newBook = new Books();
        try {
            newBook.setId(help.generateBookId());
        } catch (Exception e) {
            logger.error("Failed to generate book id", e);
            response = help.errorResponse(e);
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
            response = help.successResponse("Book Created", savedBook);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Failed to create book", e);
            response = help.errorResponse(e);
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
            response = help.successResponse("Books Fetched", hm);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch books", e);
            response = help.errorResponse(e);
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
            response = help.successResponse("Books Fetched", hm);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch books with user counts", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getBook(String id) {
        ResponseDTO response = new ResponseDTO();
        try {
            Optional<Books> book = repo.findById(id);
            if (book.isEmpty()) {
                response = help.errorResponse("Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            Books b = book.get();
            response = help.successResponse("Book Fetched", b);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch book {}", id, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> updateBook(String id, Books request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Optional<Books> existingBook = repo.findById(id);
            if (existingBook.isEmpty()) {
                response = help.errorResponse("Book not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            Books b = existingBook.get();
            b.setAuthor(request.getAuthor());
            b.setCategory(request.getCategory());
            b.setDescription(request.getDescription());
            b.setPrice(request.getPrice());
            b.setQuantity(request.getQuantity());
            b.setTitle(request.getTitle());
            b.setUrl(request.getUrl());
            b.setUpdatedBy(request.getId());
            Books savedBook = repo.save(b);
            response = help.successResponse("Updated Successfully", savedBook);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to update book {}", id, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getSuggestions(Books request) {
        ResponseDTO response = new ResponseDTO();
        logger.debug("Generating suggestions for book id {}", request.getId());
        try {
            List<Books> books = repo.findByCategory(request.getCategory());
            List<BookCountDTO> userBooks = new ArrayList<>();
            Set<String> addedBookIds = new HashSet<>();
            addSuggestions(request, books, userBooks, addedBookIds);
            if (userBooks.size() < 6) {
                books = repo.findByTitle(request.getTitle());
                addSuggestions(request, books, userBooks, addedBookIds);
            }
            if (userBooks.size() >= 6) {
                userBooks = userBooks.subList(0, 6);
                response = help.successResponse("Got suggestions", userBooks);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            }
            if (userBooks.size() < 6) {
                books = repo.findAllByOrderByQuantityDesc();
                addSuggestions(request, books, userBooks, addedBookIds);
            }
            if (userBooks.size() >= 6) {
                userBooks = userBooks.subList(0, 6);
            }
            response = help.successResponse("Got suggestions", userBooks);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to generate suggestions for book {}", request.getId(), e);
            response = help.errorResponse(e);
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

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> updateBookCounts(OrderCount request) {
        ResponseDTO response = new ResponseDTO();
        try {
            List<BookOrderCount> order = request.getBooks();
            for (int i = 0; i < order.size(); i++) {
                BookOrderCount item = order.get(i);
                if (item.getCount() == null || item.getCount().compareTo(BigDecimal.ZERO) <= 0) {
                    response = help.errorResponse("Book quantity must be greater than zero");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                Optional<Books> existingBook = repo.findById(item.getBookId());
                if (existingBook.isEmpty()) {
                    response = help.errorResponse("Book not found: " + item.getBookId());
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                }
                Books b = existingBook.get();
                if (b.getQuantity() == null || b.getQuantity().compareTo(item.getCount()) < 0) {
                    response = help.errorResponse("Insufficient quantity for book: " + item.getBookId());
                    return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
                }
                b.setQuantity(b.getQuantity().subtract(item.getCount()));
                repo.save(b);
                logger.debug("Book quantity updated for id {}", b.getId());
            }
            response = help.successResponse("Book Quantities Updated", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to update book quantities", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public String insertDummy(int count) {
        List<Books> books = new ArrayList<>();
        List<String> cats = repo.findDistinctCategory();
        Random random = new Random();
        if (cats.isEmpty()) {
            return "Cannot insert dummy books without categories";
        }
        for (int i = 1; i <= count; i++) {
            Books book = new Books();
            Long counter = help.generateDummyCounter();
            book.setId("DMY" + counter);
            book.setAuthor("Author" + counter);
            book.setDescription(
                    "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tempora blanditiis iusto inventore soluta earum, corrupti distinctio autem vero impedit alias harum, explicabo similique fugiat exercitationem quisquam itaque aliquam omnis illo.");
            book.setTitle("Title" + counter);
            book.setPrice(BigDecimal.valueOf(100 * counter));
            book.setQuantity(BigDecimal.valueOf(10 + random.nextInt(350)));
            book.setCategory(cats.get(random.nextInt(cats.size())));
            book.setUrl(
                    "https://blog-cdn.reedsy.com/directories/admin/featured_image/591/dissecting-the-cover-of-a-book-8fbcaf.webp");
            books.add(book);
        }
        try {
            repo.saveAll(books);
            return "Inserted " + count + " rows books";
        } catch (Exception e) {
            logger.error("Failed to insert dummy books", e);
            return e.toString();
        }
    }

    public ResponseEntity<ResponseDTO> getAllBooksPaged(int pageNumber, int pageSize, String search, String category,
            String sortBy) {
        ResponseDTO response = new ResponseDTO();
        try {
            if (pageNumber < 0 || pageSize < 1 || pageSize > 100) {
                response = help.errorResponse("Invalid pagination values");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            logger.debug("Fetching books page={}, size={}, search={}, category={}, sortBy={}",
                    pageNumber, pageSize, search, category, sortBy);
            boolean hasCategory = category != null && !category.isEmpty() && !category.isBlank()
                    && !category.equals("All");
            boolean hasSearch = search != null && !search.isEmpty() && !search.isBlank();

            String[] sortParts = (sortBy == null || sortBy.isBlank() ? "createdAt,desc" : sortBy).split(",");
            String sortField = sortParts[0];
            Set<String> sortableFields = Set.of("title", "author", "category", "price", "quantity",
                    "createdAt", "updatedAt");
            if (!sortableFields.contains(sortField)) {
                response = help.errorResponse("Invalid sort field");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
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
            response = help.successResponse("Fetched Books", result);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch paged books", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> deleteBook(String id) {
        ResponseDTO response = new ResponseDTO();
        try {
            repo.deleteById(id);
            response = help.successResponse("Book Deleted Successfully", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to delete book {}", id, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

    public ResponseEntity<ResponseDTO> revertBooksCount(OrderCount request) {
        ResponseDTO response = new ResponseDTO();
        try {
            System.out.println("Request for revertion: " + request.toString());
            List<BookOrderCount> order = request.getBooks();
            for (int i = 0; i < order.size(); i++) {
                BookOrderCount item = order.get(i);
                Optional<Books> existingBook = repo.findById(item.getBookId());
                if (existingBook.isEmpty()) {
                    response = help.errorResponse("Book not found: " + item.getBookId());
                    continue;
                }
                Books b = existingBook.get();
                b.setQuantity(b.getQuantity().add(item.getCount()));
                repo.save(b);
                logger.debug("Book quantity updated for id {}", b.getId());
            }
            response = help.successResponse("Book Quantities Updated", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to revert book counts {}", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
