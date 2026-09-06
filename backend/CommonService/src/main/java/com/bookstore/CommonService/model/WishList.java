package com.bookstore.CommonService.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class WishList {
    @Id
    private String id;
    private String userid;
    private List<String> bookIds;
}
