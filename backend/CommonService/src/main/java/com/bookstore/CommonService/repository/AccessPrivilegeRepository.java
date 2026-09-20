package com.bookstore.CommonService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.CommonService.model.AccessPrivilege;

@Repository
public interface AccessPrivilegeRepository extends JpaRepository<AccessPrivilege, String> {

    AccessPrivilege findByUserid(String userid);

}
