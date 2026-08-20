package com.bookstore.BookService.DTO.request;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookCount {
    private String bookId;
    private BigDecimal count;
}
