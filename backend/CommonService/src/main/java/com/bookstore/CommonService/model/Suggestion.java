package com.bookstore.CommonService.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class Suggestion {
    @Id
    private String id;
    private String userid;
    private String username;
    private String suggestion;
}
