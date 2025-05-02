// 이벤트 처리

package kr.jobtc.realtime_message;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@Data
public class MyEventListener {
    private EventWebSocketController webSocketController;

    public MyEventListener(EventWebSocketController webSocketController){
        this.webSocketController = webSocketController;
    }

    @EventListener
    public void handleMyCustomEvent(MyCustomEvent event) {
        System.out.println("Event received: " + event.getMessage());
        //webSocketController.sendEventToClients(event.getMessage());
    }    
}
