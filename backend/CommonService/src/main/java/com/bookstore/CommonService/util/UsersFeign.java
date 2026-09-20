package com.bookstore.CommonService.util;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import com.bookstore.CommonService.DTO.response.ResponseDTO;

@FeignClient(name = "user-service", url = "${USER_SERVICE_URL:http://localhost:8080}")
public interface UsersFeign {

    @GetMapping("/users/{userid}")
    public ResponseEntity<ResponseDTO> getUserDetails(@PathVariable String userid);
}
