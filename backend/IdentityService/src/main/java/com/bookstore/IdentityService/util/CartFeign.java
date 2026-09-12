package com.bookstore.IdentityService.util;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.bookstore.IdentityService.DTO.response.ResponseDTO;

@FeignClient(name = "cart-service", url = "http://localhost:8082")
public interface CartFeign {

    @DeleteMapping("/carts/user/{userid}")
    ResponseEntity<ResponseDTO> deleteCart(@PathVariable String userid);
}
