package kr.jobtc.realtime_message;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class LoginController {

    @PostMapping("/login")
    public Map<String, Object> login(UserVo vo){
        Map<String, Object> returnMap = new HashMap<>();
        int count=0;
        System.out.printf("id : %s\n", vo.getId());
        System.out.printf("password : %s\n", vo.getPwd());

        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        boolean b = dto.login(vo);
        if(b){
            count = dto.countByUser(vo.getId());

            returnMap.put("loginStatus", b);
            returnMap.put("user", vo.getId());
            returnMap.put("count", count);
        }else{
            returnMap.put("loginStatus", b);
            returnMap.put("user", "");
            returnMap.put("count", "");
        }
        dto.dbClose();
        return returnMap;
    }

    @PostMapping("/notiList")
    public List<NoticeVo> notiList( UserVo param){
        System.out.println("user:" + param.getId());
        List<NoticeVo> list = null;
        NoticeDto dto = new NoticeDto();
        dto.dbOpen();
        list = dto.notiList(param.getId());
        dto.dbClose();
        
        return list;
    }
    
}
