package com.bookstore.IdentityService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.IdentityService.model.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, String> {

    Users findByName(String name);

    Users findByEmail(String email);

    Users findByPhone(String phone);

    Users findByEmailOrName(String email, String name);

}
