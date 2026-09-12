package com.bookstore.IdentityService.util;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.bookstore.IdentityService.DTO.request.UserIdOrderCountDTO;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;

@FeignClient(name = "order-service", url = "http://localhost:8083")
public interface OrderFeign {

    @DeleteMapping("/orders/{userid}")
    ResponseEntity<ResponseDTO> deleteUserOrders(@PathVariable String userid);

    @PostMapping("/orders/countOrders")
    ResponseEntity<ResponseDTO> getUserOrderCount(@RequestBody UserIdOrderCountDTO userIdOrderCountDTO);
}
