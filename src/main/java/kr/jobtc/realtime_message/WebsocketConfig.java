package kr.jobtc.realtime_message;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebsocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 클라이언트가 메시지를 수신(구독)하기 위한 설정
        registry.enableSimpleBroker("/topic"); // 메시지 브러커 설정

        // 클라이언트가 서버로 메시지를 전송할 때 사용되는 경로의 접두사.
        registry.setApplicationDestinationPrefixes("/app"); // 어플리케이션 경로 접두사
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").withSockJS(); // websocket endpoint 설정
    }

}
