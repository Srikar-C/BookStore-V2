package com.bookstore.CommonService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.CommonService.model.Suggestion;

@Repository
public interface SuggestionRepository extends JpaRepository<Suggestion, String> {

}
