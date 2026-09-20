package com.bookstore.IdentityService.util;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.bookstore.IdentityService.DTO.request.UserIdOrderCountDTO;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;

@FeignClient(name = "common-service", url = "${COMMON_SERVICE_URL:http://localhost:8084}")
public interface CommonFeign {

    @DeleteMapping("/common/wishlist/{userid}")
    ResponseEntity<ResponseDTO> deleteWishlist(@PathVariable String userid);

    @PostMapping("/common/access")
    ResponseEntity<ResponseDTO> checkAccessPrivileges(@RequestBody UserIdOrderCountDTO userIdOrderCountDTO);
}