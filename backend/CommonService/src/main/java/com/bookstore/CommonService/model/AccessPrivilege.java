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
public class AccessPrivilege {
    @Id 
    private String id;
    private String userid;
    private boolean isAuthenticated;
}
