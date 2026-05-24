package com.draxlmaier.assethub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;


@SpringBootApplication
@EnableScheduling
public class AssetComplaintHubApplication {
    public static void main(String[] args) {
        SpringApplication.run(AssetComplaintHubApplication.class, args);
    }
}
