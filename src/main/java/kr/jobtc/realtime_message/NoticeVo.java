package kr.jobtc.realtime_message;

import lombok.Data;

@Data
public class NoticeVo {
    int sno; //공지사항 고유 번호
    String id; //공지 작성자
    String subject; //공지제목
    String doc; // 공지 내용
    String checking; //공지 확인 여부

    public NoticeVo(){}
    public NoticeVo(String id, int sno){
        this.id = id;
        this.sno = sno;
    }
    public NoticeVo(String subject, String doc, String id){
        this.subject = subject;
        this.doc = doc;
        this.id = id;
    }

}
