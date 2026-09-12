package com.bookstore.CommonService.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bookstore.CommonService.model.WishList;

@Repository
public interface WishListRepository extends JpaRepository<WishList, String> {

    WishList findByUserid(String userId);

    void deleteByUserid(String userid);

}
