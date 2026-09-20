package com.bookstore.IdentityService.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.bookstore.IdentityService.DTO.request.LoginDTO;
import com.bookstore.IdentityService.DTO.request.OTPDTO;
import com.bookstore.IdentityService.DTO.request.RegisterDTO;
import com.bookstore.IdentityService.DTO.request.ResetDTO;
import com.bookstore.IdentityService.DTO.request.SingleObject;
import com.bookstore.IdentityService.DTO.request.UserIdOrderCountDTO;
import com.bookstore.IdentityService.DTO.response.ResponseDTO;
import com.bookstore.IdentityService.DTO.response.SubResponse;
import com.bookstore.IdentityService.DTO.response.UserOrderDTO;
import com.bookstore.IdentityService.DTO.response.VerifyDTO;
import com.bookstore.IdentityService.model.Users;
import com.bookstore.IdentityService.model.VerifyUsers;
import com.bookstore.IdentityService.repository.UserRepository;
import com.bookstore.IdentityService.repository.VerifyUserRepository;
import com.bookstore.IdentityService.util.Helper;
import com.bookstore.IdentityService.util.OrderFeign;
import com.bookstore.IdentityService.util.CommonFeign;
import com.bookstore.IdentityService.util.RegisterUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final Helper help;

    private final RegisterUtil registerUtil;

    private final VerifyUserRepository verifyUserRepo;

    private final UserRepository userRepo;

    private final BCryptPasswordEncoder encoder;

    private final JWTService jwt;

    private final OrderFeign orderFeign;

    private final CommonFeign commonFeign;

    public UserService(Helper help, RegisterUtil registerUtil, VerifyUserRepository verifyUserRepo,
            UserRepository userRepo, BCryptPasswordEncoder encoder, JWTService jwt, OrderFeign orderFeign,
            CommonFeign commonFeign) {
        this.help = help;
        this.registerUtil = registerUtil;
        this.verifyUserRepo = verifyUserRepo;
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwt = jwt;
        this.orderFeign = orderFeign;
        this.commonFeign = commonFeign;
    }

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> register(RegisterDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            // Existence Check in Main Table
            SubResponse existMain = registerUtil.isExists(request);
            if (!existMain.isSuccess()) {
                response = help.errorResponse(existMain.getError());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Create in Users Table
            SubResponse creation = registerUtil.create(request);
            if (!creation.isSuccess()) {
                response = help.errorResponse(creation.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            if ("ADMIN".equals(request.getRole())) {
                response = help.successResponse("Successfully Registered", creation.getData());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }

            // Create in Verify Table
            SubResponse verifyCreation = registerUtil.createVerify(request);
            if (!verifyCreation.isSuccess()) {
                response = help.errorResponse(verifyCreation.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            // Sending OTP To Email
            Users user = (Users) creation.getData();
            VerifyUsers verifyUser = (VerifyUsers) verifyCreation.getData();
            SubResponse sendingOTPToEmail = help.sendOTP(user.getEmail(), user.getName(), verifyUser.getOtp());
            if (!sendingOTPToEmail.isSuccess()) {
                response = help.errorResponse(sendingOTPToEmail.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            response = help.successResponse("User Registered. Please Verify", verifyUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            logger.error("Failed to register user", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getEmail(SingleObject request) {
        ResponseDTO response = new ResponseDTO();
        try {
            VerifyUsers user = verifyUserRepo.findByToken(request.getToken());
            response = help.successResponse("Fetched User", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch verification user", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> verifyOTP(OTPDTO request) {
        ResponseDTO response = new ResponseDTO();
        if (!help.isSpecified(request.getOtp())) {
            response = help.errorResponse("OTP is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        try {
            VerifyUsers verifyUser = verifyUserRepo.findByEmail(request.getEmail());
            if (verifyUser == null) {
                response = help.errorResponse("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (!request.getOtp().toString().equals(verifyUser.getOtp())) {
                response = help.errorResponse("Invalid OTP");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (verifyUser.isUsed()) {
                response = help.errorResponse("OTP already Used, Please request again");
                return ResponseEntity.status(HttpStatus.GONE).body(response);
            }
            Duration time = help.calculateDuration(verifyUser.getOtpSession());
            logger.debug("OTP age: {} seconds", time.getSeconds());
            if (time.getSeconds() >= 301) {
                response = help.errorResponse("OTP Expired, Request again");
                return ResponseEntity.status(HttpStatus.GONE).body(response);
            }

            verifyUser.setUsed(true);
            VerifyUsers updatedVerifyUsers = verifyUserRepo.save(verifyUser);

            Users user = userRepo.findByEmail(updatedVerifyUsers.getEmail());
            if (user == null) {
                response = help.errorResponse("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            user.setActive(true);
            Users updatedUser = userRepo.save(user);
            response = help.successResponse("OTP Verified", updatedUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to verify OTP", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> sendOTP(OTPDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Users user = userRepo.findByEmail(request.getEmail());
            if (user == null) {
                response = help.errorResponse("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            VerifyUsers verifyUsers = verifyUserRepo.findByEmail(request.getEmail());
            if (user.getRole().equals("USER") && verifyUsers == null) {
                response = help.errorResponse("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            int requestCount = verifyUsers == null || verifyUsers.getRequestCount() == null
                    ? 0
                    : verifyUsers.getRequestCount();
            if (verifyUsers != null) {
                if (requestCount > 5) {
                    Duration time = help.calculateDuration(verifyUsers.getOtpSession());
                    logger.debug("OTP age: {} seconds", time.getSeconds());
                    if (time.getSeconds() < 901) {
                        response = help.errorResponse("OTP Limit Exceeded, Try after 15 minutes");
                        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(response);
                    } else {
                        requestCount = 0;
                        verifyUsers.setRequestCount(0);
                    }
                }
                verifyUsers.setRequestCount(requestCount);
            }
            String otp = help.generateOTP();

            SubResponse sendingOTPTOEmail = help.sendOTP(user.getEmail(), user.getName(), otp);
            if (!sendingOTPTOEmail.isSuccess()) {
                response = help.errorResponse(sendingOTPTOEmail.getError());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (verifyUsers != null) {
                verifyUsers.setRequestCount(verifyUsers.getRequestCount() + 1);
            } else {
                verifyUsers = new VerifyUsers();
                verifyUsers.setEmail(request.getEmail());
                verifyUsers.setRequestCount(1);
                String token = "";
                VerifyUsers check;
                do {
                    token = UUID.randomUUID().toString();
                    check = verifyUserRepo.findByToken(token);
                } while (check != null);
                verifyUsers.setToken(token);
            }
            verifyUsers.setOtp(otp);
            verifyUsers.setOtpSession(Instant.now());
            verifyUsers.setUsed(false);
            verifyUserRepo.save(verifyUsers);

            VerifyDTO verify = new VerifyDTO();
            verify.setToken(verifyUsers.getToken());

            response = help.successResponse("OTP Sent Successfully", verify);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to send OTP", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> resetPassword(ResetDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Users user = userRepo.findByEmail(request.getEmail());
            if (user == null) {
                response = help.errorResponse("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (!request.getPassword().toString().equals(request.getCfnpassword().toString())) {
                response = help.errorResponse("Passwords Not Same");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (request.getPassword().length() < 6) {
                response = help.errorResponse("Password must be at least 6 characters long");
                return ResponseEntity.status(HttpStatus.LENGTH_REQUIRED).body(response);
            }
            user.setPassword(encoder.encode(request.getPassword()));
            userRepo.save(user);
            response = help.successResponse("Password Changed Successfully", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to reset password", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> login(LoginDTO request, HttpServletResponse http) {
        ResponseDTO response = new ResponseDTO();
        request.setName(request.getName().toLowerCase());
        try {
            Users user = userRepo.findByEmailOrName(request.getName(), request.getName());
            if (user == null) {
                response = help.errorResponse("User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            if (!user.isActive()) {
                response = help.errorResponse("User Not Verified");
                String otp = help.generateOTP();
                SubResponse sendingOTPTOEmail = help.sendOTP(user.getEmail(), user.getName(), otp);
                if (!sendingOTPTOEmail.isSuccess()) {
                    response = help.errorResponse(sendingOTPTOEmail.getError());
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
                }
                VerifyUsers verifyUsers = verifyUserRepo.findByEmail(user.getEmail());
                if (verifyUsers == null) {
                    verifyUsers = new VerifyUsers();
                    String token = "";
                    VerifyUsers check;
                    do {
                        token = UUID.randomUUID().toString();
                        check = verifyUserRepo.findByToken(token);
                    } while (check != null);
                    verifyUsers.setToken(token);
                }
                int requestCount = verifyUsers.getRequestCount() == null
                        ? 0
                        : verifyUsers.getRequestCount();
                verifyUsers.setEmail(user.getEmail());
                verifyUsers.setOtp(otp);
                verifyUsers.setOtpSession(Instant.now());
                verifyUsers.setRequestCount(requestCount + 1);
                verifyUsers.setUsed(false);
                verifyUserRepo.save(verifyUsers);

                VerifyDTO verify = new VerifyDTO();
                verify.setToken(verifyUsers.getToken());

                response = help.successResponse("User Not Verified, OTP Sent Successfully, Please Verify", verify);
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(response);
            }
            if (!encoder.matches(request.getPassword(), user.getPassword())) {
                response = help.errorResponse("Incorrect Password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            String jwtToken = jwt.generateToken(user);
            Cookie cookie = new Cookie("token", jwtToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // true in production (HTTPS)
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            http.addCookie(cookie);
            response = help.successResponse("User Found", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            logger.error("Failed to log in user", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public String insertDummy(long count, String role) {
        List<Users> users = new ArrayList<>();
        for (long i = 1; i <= count; i++) {
            Users user = new Users();
            Long counter = help.generateDummyCounter();
            user.setId("USR" + counter);
            user.setName("testuser" + counter);
            user.setEmail("testuser" + counter + "@example.com");
            user.setPassword(encoder.encode("Password@123"));
            String phone = null;
            Users check = null;
            do {
                Random random = new Random();
                phone = String.valueOf(1000000000L + random.nextLong(9000000000L));
                check = userRepo.findByPhone(phone);
            } while (check != null);
            user.setPhone(phone);
            user.setRole(role.toUpperCase());
            user.setActive(true);
            users.add(user);
        }
        try {
            userRepo.saveAll(users);
            return "Inserted " + count + " rows of " + role;
        } catch (Exception e) {
            logger.error("Failed to insert dummy users", e);
            return e.toString();
        }
    }

    public ResponseEntity<ResponseDTO> getAllUsers(int pageNumber, int pageSize, String role, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        try {
            if (pageNumber < 0 || pageSize < 1 || role == null || role.isBlank()) {
                response = help.errorResponse("Invalid user list parameters");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            Pageable pageable = PageRequest.of(pageNumber, pageSize);
            Page<Users> users = userRepo.findByRole(role.toUpperCase(), pageable);
            Map<String, Object> result = new HashMap<>();
            ResponseEntity<ResponseDTO> orderCountResult = null;
            List<UserOrderDTO> allUsers = new ArrayList<>();
            for (Users u : users.getContent()) {
                UserOrderDTO dto = new UserOrderDTO();
                dto.setId(u.getId());
                dto.setEmail(u.getEmail());
                dto.setName(u.getName());
                dto.setPhone(u.getPhone());
                dto.setActive(u.isActive());
                allUsers.add(dto);
            }
            List<String> userIds = allUsers.stream().map(UserOrderDTO::getId).toList();
            Map<String, BigDecimal> orderCountMap = new HashMap<>();
            if (!userIds.isEmpty() && "USER".equals(role.toUpperCase().toString())) {
                UserIdOrderCountDTO userIdOrderCountDTO = new UserIdOrderCountDTO();
                userIdOrderCountDTO.setUserIds(userIds);
                orderCountResult = orderFeign.getUserOrderCount(userIdOrderCountDTO);
                if (orderCountResult.getBody().isSuccess()) {
                    List<Map<String, Object>> orderCountList = (List<Map<String, Object>>) orderCountResult.getBody()
                            .getData();
                    logger.debug("Fetched order counts for {} users", orderCountList.size());
                    for (Map<String, Object> orderCount : orderCountList) {
                        String userId = (String) orderCount.get("userId");
                        BigDecimal count = new BigDecimal(orderCount.get("orderCount").toString());
                        orderCountMap.put(userId, count);
                    }
                }
            } else {
                UserIdOrderCountDTO userIdOrderCountDTO = new UserIdOrderCountDTO();
                userIdOrderCountDTO.setUserIds(userIds);
                orderCountResult = commonFeign.checkAccessPrivileges(userIdOrderCountDTO);
                logger.info("Ordercountresult for admins ", orderCountResult.getBody());
                System.out.println("Ordercountresult for admins " + orderCountResult.getBody());
                if (orderCountResult.getBody().isSuccess()) {
                    Map<String, Boolean> accessPrivileges = (Map<String, Boolean>) orderCountResult.getBody().getData();
                    accessPrivileges.forEach((userId, hasAccess) -> {
                        orderCountMap.put(
                                userId,
                                hasAccess ? BigDecimal.ONE : BigDecimal.ONE.negate());
                    });
                }
            }
            for (UserOrderDTO user : allUsers) {
                BigDecimal count = orderCountMap.getOrDefault(user.getId(), BigDecimal.ZERO);
                user.setOrderCount(count);
            }
            result.put("content", allUsers);
            result.put("pageNumber", users.getNumber());
            result.put("totalPages", users.getTotalPages());
            result.put("totalElements", users.getTotalElements());
            result.put("pageSize", users.getSize());
            result.put("isFirst", users.isFirst());
            result.put("isLast", users.isLast());
            response = help.successResponse("Fetched Users", result);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch users", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getAllUsers(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        response = help.checkUserExistence(http);

        if (!response.isSuccess()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        String token = response.getData().toString();
        try {
            String userid = jwt.extractUserId(token);
            Optional<Users> currentUser = userRepo.findById(userid);
            if (currentUser.isEmpty()) {
                response = help.errorResponse("User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            Users user = currentUser.get();
            if (!"ADMIN".equals(user.getRole())) {
                response = help.errorResponse("Not Authorised");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            List<UserOrderDTO> allUser = userRepo.findByRole("USER").stream()
                    .map(item -> new UserOrderDTO(item.getId(), item.getEmail(), item.getPhone(), item.getName(),
                            item.isActive(), BigDecimal.ZERO))
                    .toList();
            response = help.successResponse("Fetched All Users", allUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch all users", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getAllUsers() {
        ResponseDTO response = new ResponseDTO();
        try {
            long userCount = userRepo.countByRole("USER");
            long adminCount = userRepo.countByRole("ADMIN");
            long activeUsers = userRepo.countByIsActive(true);
            Map<String, Long> counts = new HashMap<>();
            counts.put("user", userCount);
            counts.put("admin", adminCount);
            counts.put("active", activeUsers);
            response = help.successResponse("Users Count Fetched", counts);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch user counts", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getUserDetails(String userid) {
        ResponseDTO response = new ResponseDTO();
        try {
            Optional<Users> user = userRepo.findById(userid);
            if (user.isEmpty()) {
                response = help.errorResponse("User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            Users userdtls = user.get();
            Map<String, String> dtls = new HashMap<>();
            dtls.put(userdtls.getId(), userdtls.getRole());
            response = help.successResponse("User Details Fetched", dtls);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            logger.error("Failed to fetch user details", e);
            response = help.errorResponse(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

}
