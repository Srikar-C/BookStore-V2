package com.bookstore.IdentityService.AOP;

import java.util.Arrays;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.bookstore.IdentityService.controller.UserController;

@Component
@Aspect
public class LoggingAspect {
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Around("execution(* com.bookstore.IdentityService.controller..*(..))")
    public Object logMethod(ProceedingJoinPoint jp) throws Throwable {
        logger.info(
                "Request send to backend in " + jp.getSignature().getName() + " : " + Arrays.toString(jp.getArgs()));
        Object response = jp.proceed();
        logger.info("Response send to frontend in " + jp.getSignature().getName() + " : " + response.toString());
        return response;
    }
}
