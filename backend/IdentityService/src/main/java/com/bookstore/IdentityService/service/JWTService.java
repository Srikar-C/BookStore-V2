package com.bookstore.IdentityService.service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.bookstore.IdentityService.model.Users;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JWTService {

    @Value("${JWT_SECRET_KEY}")
    private String secretKey;

    public String generateToken(Users user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userid", user.getId());
        claims.put("email", user.getEmail());
        claims.put("role", user.getRole());
        return Jwts.builder()
                .claims(claims)
                .subject(user.getName())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .signWith(getKey())
                .compact();
    }

    private Key getKey() {
        byte[] keybytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keybytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> resolver) {
        Claims claims = extractAllClaims(token);
        return resolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userid", String.class));
    }

    public String extractEmail(String token) {
        return extractClaim(token, claims -> claims.get("email", String.class));
    }

    public boolean isTokenValid(String token, Users user) {
        String username = extractUsername(token);
        return username.equals(user.getName())
                && !extractExpiration(token).before(new Date());
    }

}
