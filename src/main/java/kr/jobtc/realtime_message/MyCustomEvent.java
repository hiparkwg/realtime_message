// 이벤트 데이터 클래스
package kr.jobtc.realtime_message;

import java.util.Map;

import org.springframework.context.ApplicationEvent;

import lombok.Data;

@Data
public class MyCustomEvent extends ApplicationEvent {
    private final Map<String, Object> message;

    public MyCustomEvent(Object source, Map<String, Object> message) {
        super(source);
        this.message = message;
    }

}
