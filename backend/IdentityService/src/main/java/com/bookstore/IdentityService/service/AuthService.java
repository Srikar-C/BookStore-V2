package com.bookstore.IdentityService.service;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;

import com.bookstore.IdentityService.DTO.request.OTPDTO;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.model.Users;
import com.bookstore.IdentityService.repository.UserRepository;
import com.bookstore.IdentityService.repository.VerifyUserRepository;
import com.bookstore.IdentityService.util.CartFeign;
import com.bookstore.IdentityService.util.Helper;
import com.bookstore.IdentityService.util.OrderFeign;
import com.bookstore.IdentityService.util.CommonFeign;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final Helper help;

    private final JWTService jwt;

    private final UserRepository repo;

    private final VerifyUserRepository verifyRepo;

    private final BCryptPasswordEncoder encoder;

    private final OrderFeign orderFeign;

    private final CartFeign cartFeign;

    private final CommonFeign commonFeign;

    public AuthService(Helper help, JWTService jwt, UserRepository repo, VerifyUserRepository verifyRepo,
            BCryptPasswordEncoder encoder, OrderFeign orderFeign, CartFeign cartFeign,
            CommonFeign commonFeign) {
        this.help = help;
        this.jwt = jwt;
        this.repo = repo;
        this.verifyRepo = verifyRepo;
        this.encoder = encoder;
        this.orderFeign = orderFeign;
        this.cartFeign = cartFeign;
        this.commonFeign = commonFeign;
    }

    public ResponseEntity<ResponseDTO> getCurrentUser(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.errorResponse("Not Logged In");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        try {
            // String username = jwt.extractUsername(token);
            String email = jwt.extractEmail(token);
            Users user = repo.findByEmail(email);
            if (user == null) {
                response = help.errorResponse("User Not Exist");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            response = help.successResponse("User Fetched", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch current user", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    private String getTokenFromCookie(Cookie[] cookies) {
        for (Cookie cookie : cookies) {
            if (cookie.getName().equals("token")) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public ResponseEntity<ResponseDTO> checkAdmin(HttpServletRequest request) {
        ResponseDTO response = new ResponseDTO();
        try {
            String token = null;
            if (request.getCookies() != null) {
                token = getTokenFromCookie(request.getCookies());
            }
            if (token == null) {
                response = help.errorResponse("Not Logged In");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            String username = jwt.extractUsername(token);
            Users user = repo.findByName(username);
            if (user == null) {
                response = help.errorResponse("User Not Exist");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if ("SUPERUSER".equals(user.getRole())) {
                response = help.successResponse("User Fetched", null);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                response = help.errorResponse("Forbidden");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            logger.error("Failed to check admin privileges", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> logout(HttpServletResponse request) {
        ResponseDTO response = new ResponseDTO();
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // true in production
        cookie.setPath("/");
        cookie.setMaxAge(0); // Deletes the cookie

        request.addCookie(cookie);

        response = help.successResponse("Successfully Logged Out", null);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    public ResponseEntity<ResponseDTO> passwordVerify(OTPDTO request, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.errorResponse("Not Logged In");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        try {
            String userid = jwt.extractUserId(token);
            Optional<Users> userResult = repo.findById(userid);
            if (userResult.isEmpty()) {
                response = help.errorResponse("No User");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            Users user = userResult.get();
            if (!encoder.matches(request.getEmail(), user.getPassword())) {
                response = help.errorResponse("Incorrect Password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
            response = help.successResponse("Password Correct", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to verify password", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> deleteUser(HttpServletRequest req, HttpServletResponse resp) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (req.getCookies() != null) {
            token = getTokenFromCookie(req.getCookies());
        }
        if (token == null) {
            response = help.errorResponse("Not Logged In");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        try {
            String userid = jwt.extractUserId(token);
            String email = jwt.extractEmail(token);

            // rest.delete().uri("http://localhost:8083/orders/" + userid).retrieve();

            ResponseEntity<ResponseDTO> result = null;
            result = commonFeign.deleteWishlist(userid);
            logger.debug("Wishlist deletion completed with status {}", result.getStatusCode());
            if (!result.getBody().isSuccess()) {
                throw new Exception("Error in Deleting User Account");
            }
            result = orderFeign.deleteUserOrders(userid);
            logger.debug("Order deletion completed with status {}", result.getStatusCode());
            if (!result.getBody().isSuccess()) {
                throw new Exception("Error in Deleting User Account");
            }
            result = cartFeign.deleteCart(userid);
            logger.debug("Cart deletion completed with status {}", result.getStatusCode());
            if (!result.getBody().isSuccess()) {
                throw new Exception("Error in Deleting User Account");
            }

            repo.deleteById(userid);
            verifyRepo.deleteByEmail(email);
            result = logout(resp);
            if (!result.getBody().isSuccess()) {
                throw new Exception("Error in Deleting User Account");
            }
            response = help.successResponse("Identity Deleted", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to delete user account", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
