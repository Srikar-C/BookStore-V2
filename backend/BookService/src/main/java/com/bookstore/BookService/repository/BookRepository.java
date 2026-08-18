package com.bookstore.BookService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.BookService.model.Books;

@Repository
public interface BookRepository extends JpaRepository<Books, String> {

    Books findByUrl(String url);

    Books findByTitle(String title);

    Books findByAuthorAndTitle(String author, String title);

}
