package com.bookstore.BookService.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.bookstore.BookService.model.Books;

@Repository
public interface BookRepository extends JpaRepository<Books, String> {

    Books findByUrl(String url);

    Books findByTitle(String title);

    Books findByAuthorAndTitle(String author, String title);

    @Query("SELECT DISTINCT b.category FROM Books b order by b.category")
    List<String> findDistinctCategory();

    List<Books> findByCategory(String category);

}
