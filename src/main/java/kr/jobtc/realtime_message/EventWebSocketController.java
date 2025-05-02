package kr.jobtc.realtime_message;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class EventWebSocketController {
    private SimpMessagingTemplate messagingTemplate;

    public EventWebSocketController(SimpMessagingTemplate template) { 
        this.messagingTemplate = template;
    }
    // 메시지 전송 
    public void sendEventToClient(Map<String, Object> message) {
        String sendURL = String.format("/topic/events/%s", message.get("id"));
        messagingTemplate.convertAndSend(sendURL, message);
    }


    @MessageMapping("/login")
    public void login(Map<String, Object> message){
        Map<String, Object> msg = new HashMap<>();

        System.out.printf("login : %s\n", message);
        String id = (String) message.get("id");
        String pwd = (String) message.get("pwd");
        String command = (String) message.get("command");
        boolean status=false;
        int count=0;
        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        UserVo userVo = new UserVo();
        userVo.setId(id);
        userVo.setPwd(pwd);
        status = dto.login(userVo);
        if (status) {
            count = dto.countByUser(id);
        }
        msg = new HashMap<>();
        msg.put("id", id);
        msg.put("count", count);
        msg.put("command", command);
        msg.put("status", status);
        dto.dbClose();

        sendEventToClient(msg);
    }

    @MessageMapping("/list")
    public void list(Map<String, Object> message){
        Map<String, Object> msg = new HashMap<>();
        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        String id = (String) message.get("id");
        String command = (String) message.get("command");
        List<NoticeVo> list = dto.notiList(id);

        msg = new HashMap<>();
        msg.put("command", command);
        msg.put("id", id);
        msg.put("list", list);
        msg.put("status", true);
        dto.dbClose();        
        sendEventToClient(msg);

    }

    @MessageMapping("/noticeViewCheck")
    public  void noticeViewCheck(Map<String, Object> message){
        Map<String, Object> msg = new HashMap<>();

        String id = (String) message.get("id");
        int sno = Integer.parseInt((String) message.get("sno"));
        String command = (String) message.get("command");

        boolean status=false;
        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        status = dto.noticeCheck(id, sno);
        dto.dbClose();

        msg = new HashMap<>();
        msg.put("command", command);
        msg.put("id", message.get("id"));
        msg.put("status", status);        
        sendEventToClient(msg);

    }


    // 모든 유저에게 메시지 전송
    public void allAccountSend(Map<String, Object> message) {
        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        Map<String, Integer> allUser = dto.allUser();
        dto.dbClose();

        for (Map.Entry<String, Integer> entry : allUser.entrySet()) {
            message.put("id", entry.getKey());
            message.put("cnt", entry.getValue()); 
            sendEventToClient(message);
        }
    }

    @MessageMapping("/noticeInsert")
    public void noticeInsert(Map<String, Object> message) {
        Map<String, Object> msg = new HashMap<>();
        String subject = (String) message.get("subject");
        String doc = (String) message.get("doc");
        String id = (String) message.get("id");
        NoticeVo noticeVo = new NoticeVo(subject, doc, id);

        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        boolean status = dto.noticeInsert(noticeVo);
        NoticeVo lastNotiVo = dto.selectLastOne();
        lastNotiVo.setChecking("미확인");
        dto.dbClose();

        msg.put("command", message.get("command"));
        msg.put("id", message.get("id"));
        msg.put("status", status);
        msg.put("noticeVo", lastNotiVo);
        allAccountSend(msg);
    }

    @MessageMapping("/noticeDelete")
    public void noticeDelete(Map<String, Object> message) {
        Map<String, Object> msg = new HashMap<>();
        String id = (String) message.get("id");
        int sno = Integer.parseInt((String)message.get("sno"));
        NoticeVo noticeVo = new NoticeVo(id, sno);
        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        boolean status = dto.noticeDelete(noticeVo);
        dto.dbClose();

        msg.put("command", message.get("command"));
        msg.put("sno", sno);
        msg.put("status", status);
        allAccountSend(msg);
    }
}