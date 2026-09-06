package com.bookstore.IdentityService.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.IdentityService.model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, String> {

    Users findByName(String name);

    Users findByEmail(String email);

    Users findByPhone(String phone);

    Users findByEmailOrName(String email, String name);

    List<Users> findByRole(String role);

    Page<Users> findByRole(String string, Pageable pageable);

}
