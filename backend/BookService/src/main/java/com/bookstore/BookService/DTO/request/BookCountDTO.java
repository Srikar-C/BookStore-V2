package com.bookstore.BookService.DTO.request;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookCountDTO {
    private String id;
    private String author;
    private String title;
    private String description;
    private String url;
    private String category;
    private BigDecimal quantity;
    private BigDecimal price;
    private BigDecimal count;
}
