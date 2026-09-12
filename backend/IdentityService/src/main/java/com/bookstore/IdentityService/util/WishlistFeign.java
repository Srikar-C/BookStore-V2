package com.bookstore.IdentityService.util;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.bookstore.IdentityService.DTO.response.ResponseDTO;

@FeignClient(name = "common-service", url = "http://localhost:8084")
public interface WishlistFeign {

    @DeleteMapping("/common/wishlist/{userid}")
    ResponseEntity<ResponseDTO> deleteWishlist(@PathVariable String userid);
}