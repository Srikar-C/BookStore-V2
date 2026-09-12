package com.bookstore.IdentityService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.IdentityService.model.VerifyUsers;

@Repository
public interface VerifyUserRepository extends JpaRepository<VerifyUsers, String> {

    VerifyUsers findByToken(String token);

    VerifyUsers findByEmail(String email);

    void deleteByEmail(String email);

}
