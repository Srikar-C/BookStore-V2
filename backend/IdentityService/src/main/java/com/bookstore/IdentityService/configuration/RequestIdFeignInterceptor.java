package com.bookstore.IdentityService.configuration;

import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import feign.RequestInterceptor;

@Configuration
public class RequestIdFeignInterceptor {

    private static final String REQUEST_ID_HEADER = "X-Request-ID";

    @Bean
    public RequestInterceptor requestIdInterceptor() {
        return requestTemplate -> {
            String requestId = MDC.get("requestId");
            if (requestId != null && !requestId.isBlank()) {
                requestTemplate.header(REQUEST_ID_HEADER, requestId);
            }
        };
    }
}
