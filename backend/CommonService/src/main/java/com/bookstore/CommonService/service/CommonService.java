package com.bookstore.CommonService.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bookstore.CommonService.DTO.request.SuggestionDTO;
import com.bookstore.CommonService.DTO.request.UserIdOrderCountDTO;
import com.bookstore.CommonService.DTO.response.ResponseDTO;
import com.bookstore.CommonService.model.AccessPrivilege;
import com.bookstore.CommonService.model.Suggestion;
import com.bookstore.CommonService.model.WishList;
import com.bookstore.CommonService.repository.AccessPrivilegeRepository;
import com.bookstore.CommonService.repository.SuggestionRepository;
import com.bookstore.CommonService.repository.WishListRepository;
import com.bookstore.CommonService.util.Helper;
import com.bookstore.CommonService.util.UsersFeign;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class CommonService {

    private static final Logger logger = LoggerFactory.getLogger(CommonService.class);

    private final Helper help;

    private final JWTService jwt;

    private final SuggestionRepository suggestRepo;

    private final WishListRepository wishRepo;

    private final AccessPrivilegeRepository apRepo;

    private final UsersFeign usersFeign;

    public CommonService(Helper help, JWTService jwt, SuggestionRepository suggestRepo,
            WishListRepository wishRepo, AccessPrivilegeRepository apRepo, UsersFeign usersFeign) {
        this.help = help;
        this.jwt = jwt;
        this.suggestRepo = suggestRepo;
        this.wishRepo = wishRepo;
        this.apRepo = apRepo;
        this.usersFeign = usersFeign;
    }

    public ResponseEntity<ResponseDTO> addSuggestions(SuggestionDTO request, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        logger.debug("Processing suggestion request");
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        try {
            Suggestion suggestion = new Suggestion();
            suggestion.setId(help.generateSuggestionId());
            suggestion.setUserid(jwt.extractUserId(token));
            suggestion.setUsername(jwt.extractUsername(token));
            suggestion.setSuggestion(request.getSuggestion());
            suggestRepo.save(suggestion);
            response = help.successResponse("Suggestion Sent", null);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Failed to add suggestion", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> addWishlist(String bookid, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        if (bookid == null || bookid.isBlank()) {
            response = help.errorResponse("Book id is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        try {
            List<String> bookids = null;
            String userid = jwt.extractUserId(token);
            WishList wishlist = wishRepo.findByUserid(userid);
            boolean created = wishlist == null;
            if (wishlist == null) {
                wishlist = new WishList();
                wishlist.setId(help.generateWishlistId());
                wishlist.setUserid(userid);
                bookids = new ArrayList<>();
                bookids.add(bookid);
            } else {
                bookids = wishlist.getBookIds();
                if (bookids == null) {
                    bookids = new ArrayList<>();
                }
                if (!bookids.contains(bookid)) {
                    bookids.add(bookid);
                }
            }
            wishlist.setBookIds(bookids);
            wishRepo.save(wishlist);
            response = help.successResponse("Wishlisted", wishlist);
            return ResponseEntity.status(created ? HttpStatus.CREATED : HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to add book {} to wishlist", bookid, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getWishlists(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        try {
            WishList wishlist = wishRepo.findByUserid(jwt.extractUserId(token));
            if (wishlist == null) {
                response = help.successResponse("Fetched Wishlist", null);
            } else {
                response = help.successResponse("Fetched Wishlist", wishlist.getBookIds());
            }
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch wishlist", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> removeWishlist(String bookid, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        if (bookid == null || bookid.isBlank()) {
            response = help.errorResponse("Book id is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        try {
            String userid = jwt.extractUserId(token);
            WishList wishList = wishRepo.findByUserid(userid);
            if (wishList == null || wishList.getBookIds() == null
                    || !wishList.getBookIds().contains(bookid)) {
                response = help.errorResponse("Book is not in wishlist");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            List<String> bookids = wishList.getBookIds();
            bookids.remove(bookid);
            wishList.setBookIds(bookids);
            wishRepo.save(wishList);
            response = help.successResponse("Wishlisted Updated", wishList);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to remove book {} from wishlist", bookid, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

    public ResponseEntity<ResponseDTO> getSuggestions() {
        ResponseDTO response = new ResponseDTO();
        try {
            List<Suggestion> suggestions = suggestRepo.findAll();
            logger.debug("Fetched {} suggestions", suggestions.size());
            response = help.successResponse("Fetched suggestions", suggestions);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch suggestions", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> deleteWishlist(String userid) {
        ResponseDTO response = new ResponseDTO();
        logger.debug("Deleting wishlist for user id {}", userid);
        try {
            wishRepo.deleteByUserid(userid);
            response = help.successResponse("Wishlist deleted", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to delete wishlist for user {}", userid, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> checkAccessandPrivilege(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        logger.debug("Checking Access for user id {}", http);
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        try {
            String userid = jwt.extractUserId(token);
            AccessPrivilege user = apRepo.findByUserid(userid);
            if (user == null) {
                user = new AccessPrivilege();
                user.setAuthenticated(true);
                user.setUserid(userid);
                user.setId(help.generateAccessId());
                apRepo.save(user);
            }
            response = help.successResponse("Access Privileges Status Fetched", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch access and privileges for user {}", http, e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> checkAccessandPrivilege(UserIdOrderCountDTO request) {
        ResponseDTO response = new ResponseDTO();
        Map<String, Boolean> access = new HashMap<>();
        try {
            List<String> userIds = request.getUserIds();
            for (int i = 0; i < userIds.size(); i++) {
                String userid = userIds.get(i);
                AccessPrivilege user = apRepo.findByUserid(userid);
                if (user == null) {
                    user = new AccessPrivilege();
                    user.setAuthenticated(true);
                    user.setUserid(userid);
                    user.setId(help.generateAccessId());
                    apRepo.save(user);
                }
                access.put(userid, user.isAuthenticated());
            }
            response = help.successResponse("Access Privileges Status Fetched", access);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch access and privileges of all users {}", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> changeAccessandPrivilege(String userid, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        logger.debug("Checking Access for user id {}", http);
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        try {
            String userId = jwt.extractUserId(token);
            ResponseEntity<ResponseDTO> result = null;
            result = usersFeign.getUserDetails(userId);
            if (result.getBody().isSuccess()) {
                Map<String, String> resultResponse = (Map<String, String>) result.getBody().getData();
                logger.info("Values from user service ", resultResponse.toString());
                System.out.println("Values from user service " + resultResponse.toString());
                String role = resultResponse.get(userId);
                if (!"SUPERUSER".equals(role)) {
                    response = help.errorResponse("No Access");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }

                result = usersFeign.getUserDetails(userid);
                resultResponse = (Map<String, String>) result.getBody().getData();
                role = resultResponse.get(userid);
                if (!"ADMIN".equals(role)) {
                    response = help.errorResponse("No Access");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
                }

                AccessPrivilege apUser = apRepo.findByUserid(userid);
                apUser.setAuthenticated(!apUser.isAuthenticated());
                apRepo.save(apUser);
                response = help.successResponse("Access Updated", apUser);
                return ResponseEntity.status(HttpStatus.OK).body(response);
            } else {
                logger.error("Error in fetching user details", result.getBody().getError());
            }
        } catch (Exception e) {
            logger.error("Failed to fetch access and privileges of all users {}", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
