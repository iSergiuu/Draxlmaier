package com.draxlmaier.assethub.core.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI(){
        return new OpenAPI()
                .info(new Info()
                        .title ("Asset Complaint Hub API")
                        .version ("1.0")
                        .description ("Documentatiea API-urilor")
                        .contact (new Contact()
                                .name("Liviu")
                                .email("liviuiriminescu146@gmail.com")));
    }
}
