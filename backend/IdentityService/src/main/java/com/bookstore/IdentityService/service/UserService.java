package com.bookstore.IdentityService.service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.bookstore.IdentityService.util.RegisterUtil;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class UserService {

    @Autowired
    private Helper help;

    @Autowired
    private RegisterUtil registerUtil;

    @Autowired
    private VerifyUserRepository verifyUserRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JWTService jwt;

    @Autowired
    private OrderFeign orderFeign;

    @Transactional(rollbackFor = Exception.class)
    public ResponseEntity<ResponseDTO> register(RegisterDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            // Existence Check in Main Table
            SubResponse existMain = registerUtil.isExists(request);
            if (!existMain.isSuccess()) {
                response = help.error(existMain.getError());
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Create in Users Table
            SubResponse creation = registerUtil.create(request);
            if (!creation.isSuccess()) {
                response = help.error(creation.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            if (request.getRole().equals("ADMIN")) {
                response = help.success("Successfully Registered", creation.getData());
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            }

            // Create in Verify Table
            SubResponse verifyCreation = registerUtil.createVerify(request);
            if (!verifyCreation.isSuccess()) {
                response = help.error(verifyCreation.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }

            // Sending OTP To Email
            Users user = (Users) creation.getData();
            VerifyUsers verifyUser = (VerifyUsers) verifyCreation.getData();
            SubResponse sendingOTPToEmail = help.sendOTP(user.getEmail(), user.getName(), verifyUser.getOtp());
            if (!sendingOTPToEmail.isSuccess()) {
                response = help.error(sendingOTPToEmail.getError());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
            }
            response = help.success("User Registered. Please Verify", verifyUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getEmail(SingleObject request) {
        ResponseDTO response = new ResponseDTO();
        try {
            VerifyUsers user = verifyUserRepo.findByToken(request.getToken());
            response = help.success("Fetched User", user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> verifyOTP(OTPDTO request) {
        ResponseDTO response = new ResponseDTO();
        if (!help.isSpecified(request.getOtp())) {
            response = help.error("OTP is required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        try {
            VerifyUsers verifyUser = verifyUserRepo.findByEmail(request.getEmail());
            if (verifyUser == null) {
                response = help.error("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (!request.getOtp().toString().equals(verifyUser.getOtp())) {
                response = help.error("Invalid OTP");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (verifyUser.isUsed()) {
                response = help.error("OTP already Used, Please request again");
                return ResponseEntity.status(HttpStatus.GONE).body(response);
            }
            Duration time = help.calculateDuration(verifyUser.getOtpSession());
            System.out.println("TIme: " + time + " " + time.getSeconds());
            if (time.getSeconds() >= 301) {
                response = help.error("OTP Expired, Request again");
                return ResponseEntity.status(HttpStatus.GONE).body(response);
            }

            verifyUser.setUsed(true);
            VerifyUsers updatedVerifyUsers = verifyUserRepo.save(verifyUser);

            Users user = userRepo.findByEmail(updatedVerifyUsers.getEmail());
            user.setActive(true);
            Users updatedUser = userRepo.save(user);
            response = help.success("OTP Verified", updatedUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> sendOTP(OTPDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Users user = userRepo.findByEmail(request.getEmail());
            if (user == null) {
                response = help.error("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            VerifyUsers verifyUsers = verifyUserRepo.findByEmail(request.getEmail());
            if (user.getRole().equals("USER") && verifyUsers == null) {
                response = help.error("No User exist with this Email");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (verifyUsers != null) {
                Integer requestCount = verifyUsers.getRequestCount() == null ? 0 : verifyUsers.getRequestCount();
                if (verifyUsers.getRequestCount() > 5) {
                    Duration time = help.calculateDuration(verifyUsers.getOtpSession());
                    System.out.println("TIme: " + time + " " + time.getSeconds());
                    if (time.getSeconds() < 901) {
                        response = help.error("OTP Limit Exceeded, Try after 15 minutes");
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
                response = help.error(sendingOTPTOEmail.getError());
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

            response = help.success("OTP Sent Successfully", verify);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> resetPassword(ResetDTO request) {
        ResponseDTO response = new ResponseDTO();
        try {
            Users user = userRepo.findByEmail(request.getEmail());
            if (!request.getPassword().toString().equals(request.getCfnpassword().toString())) {
                response = help.error("Passwords Not Same");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (request.getPassword().length() < 6) {
                response = help.error("Password must be at least 6 characters long");
                return ResponseEntity.status(HttpStatus.LENGTH_REQUIRED).body(response);
            }
            user.setPassword(encoder.encode(request.getPassword()));
            userRepo.save(user);
            response = help.success("Password Changed Successfully", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> login(LoginDTO request, HttpServletResponse http) {
        ResponseDTO response = new ResponseDTO();
        request.setName(request.getName().toLowerCase());
        try {
            Users user = userRepo.findByEmailOrName(request.getName(), request.getName());
            if (user == null) {
                response = help.error("User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            if (!user.isActive()) {
                response = help.error("User Not Verified");
                String otp = help.generateOTP();
                SubResponse sendingOTPTOEmail = help.sendOTP(user.getEmail(), user.getName(), otp);
                if (!sendingOTPTOEmail.isSuccess()) {
                    response = help.error(sendingOTPTOEmail.getError());
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
                verifyUsers.setEmail(user.getEmail());
                verifyUsers.setOtp(otp);
                verifyUsers.setOtpSession(Instant.now());
                verifyUsers.setRequestCount(verifyUsers.getRequestCount() + 1);
                verifyUsers.setUsed(false);
                verifyUserRepo.save(verifyUsers);

                VerifyDTO verify = new VerifyDTO();
                verify.setToken(verifyUsers.getToken());

                response = help.success("User Not Verified, OTP Sent Successfully, Please Verify", verify);
                return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).body(response);
            }
            if (!encoder.matches(request.getPassword(), user.getPassword())) {
                response = help.error("Incorrect Password");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            String jwtToken = jwt.generateToken(user);
            Cookie cookie = new Cookie("token", jwtToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // true in production (HTTPS)
            cookie.setPath("/");
            cookie.setMaxAge(60 * 60);
            http.addCookie(cookie);
            response = help.success("User Found", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);

        } catch (Exception e) {
            response = help.error(e);
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
            return e.toString();
        }
    }

    public ResponseEntity<ResponseDTO> getAllUsers(int pageNumber, int pageSize, String role, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
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
            UserIdOrderCountDTO userIdOrderCountDTO = new UserIdOrderCountDTO();
            userIdOrderCountDTO.setUserIds(userIds);
            orderCountResult = orderFeign.getUserOrderCount(userIdOrderCountDTO);
            Map<String, BigDecimal> orderCountMap = new HashMap<>();
            if (orderCountResult.getBody().isSuccess()) {
                List<Map<String, Object>> orderCountList = (List<Map<String, Object>>) orderCountResult.getBody()
                        .getData();
                System.out.println("Order Count List: " + orderCountList);
                for (Map<String, Object> orderCount : orderCountList) {
                    String userId = (String) orderCount.get("userId");
                    BigDecimal count = new BigDecimal(orderCount.get("orderCount").toString());
                    orderCountMap.put(userId, count);
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
            response = help.success("Fetched Users", result);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> accessPrivilege(String userid, HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
            String crntUserid = jwt.extractUserId(token);
            Users user = userRepo.findById(crntUserid).orElse(new Users());
            if (user == null) {
                response = help.error("Not Logged In");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            if (!user.getRole().toString().equals("SUPERUSER")) {
                response = help.error("No Access");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            Users adminUser = userRepo.findById(userid).orElse(new Users());
            if (adminUser == null) {
                response = help.error("User Not Found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }
            adminUser.setActive(!adminUser.isActive());
            userRepo.save(adminUser);
            response = help.success("Access Updated", null);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);

    }

    public ResponseEntity<ResponseDTO> getAllUsers(HttpServletRequest http) {
        ResponseDTO response = new ResponseDTO();
        String token = null;
        if (http.getCookies() != null) {
            token = getTokenFromCookie(http.getCookies());
        }
        if (token == null) {
            response = help.error("Not Logged In");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        try {
            System.out.println("user token: " + token);
            String userid = jwt.extractUserId(token);
            Users user = userRepo.findById(userid).orElse(new Users());
            if (!user.getRole().toString().equals("ADMIN")) {
                response = help.error("Not Authorised");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            List<Users> allUser = userRepo.findByRole("USER");
            response = help.success("Fetched All Users", allUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

    public ResponseEntity<ResponseDTO> getAllUsers() {
        ResponseDTO response = new ResponseDTO();
        try {
            long userCount = userRepo.countByRole("USER");
            long adminCount = userRepo.countByRole("USER");
            long activeUsers = userRepo.countByIsActive(true);
            Map<String, Long> counts = new HashMap<>();
            counts.put("user", userCount);
            counts.put("admin", adminCount);
            counts.put("active", activeUsers);
            response = help.success("Users Count Fetched", counts);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception e) {
            response = help.error(e);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }

}
