package kr.jobtc.realtime_message;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class NoticeDto {

    // 필드
    Connection connection; 
    PreparedStatement ps;
    ResultSet rs;
    String dbUrl="jdbc:mysql://localhost:3306/easy";
    String dbUser="jobtc";
    String dbPwd = "1111";


    public void dbOpen(){
        try{
            connection = DriverManager.getConnection(dbUrl, dbUser, dbPwd);
            connection.setAutoCommit(false);
        }catch(Exception ex){
            ex.printStackTrace();
        }
    }


    public void dbClose(){
        try{
            ps.close();
            connection.close();
        }catch(Exception ex){
            ex.printStackTrace();
        }
    }    

    // 로그인
    public boolean login(UserVo vo){
        boolean b = false;
        try{
            String sql = "select * from user where id=? and pwd=?";
            ps = connection.prepareStatement(sql);
            ps.setString(1, vo.getId());
            ps.setString(2, vo.getPwd());
            rs = ps.executeQuery();
            if(rs.next()) b=true;
        }catch(Exception ex){
            ex.printStackTrace();
        }
        return b;
    }


    // 로그인 유저에게 전송할 미확인 공지개수 체크
    public int countByUser(String user){
        int count = 0;
        String sql = " select count(*) cnt from notice "
                   + " where sno not in(select notice_sno from notice_check where id=? ) ";
        try{
            ps = connection.prepareStatement(sql);
            ps.setString(1, user);
            rs = ps.executeQuery();
            if(rs.next()){
                count = rs.getInt("cnt");
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }
        return count;
    }

    // 공지목록
    public List<NoticeVo> notiList(String user){
        List<NoticeVo> list = new ArrayList<>();
        String sql = " select n.id, n.sno, n.subject, n.doc, " + 
                     " (select 'checked' from notice_check nc where n.sno=nc.notice_sno and nc.id=?) checking " + 
                     " from notice n" +
                     " order by checking, n.sno desc";
        try{
            ps = connection.prepareStatement(sql);
            ps.setString(1, user);
            rs = ps.executeQuery();
            while(rs.next()){
                NoticeVo vo = new NoticeVo();
                vo.setSno(rs.getInt("sno"));
                vo.setId(rs.getString("id"));
                vo.setSubject(rs.getString("subject"));
                vo.setDoc(rs.getString("doc"));
                if(rs.getString("checking")==null){
                    vo.setChecking("미확인");
                }else{
                    vo.setChecking("");
                }
                list.add(vo);
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }

        return list;
    }

    // 공지확인 체크
    public boolean noticeCheck(String id, int sno){
        boolean b = false;
        String sql = "insert into notice_check(notice_sno, id) values(?, ?)";
        try{
            ps = connection.prepareStatement(sql);
            ps.setInt(1, sno);
            ps.setString(2, id);
            int cnt = ps.executeUpdate();
            if(cnt>0){
                connection.commit();
                b=true;
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }

        return b;
    }

    // 새로운 공지 사항 입력
    public boolean noticeInsert(NoticeVo vo){
        boolean b=false;
        String sql = "insert into notice(subject, doc, id) values(?,?,?)";

        try{
            ps = connection.prepareStatement(sql);
            ps.setString(1, vo.getSubject());
            ps.setString(2, vo.getDoc());
            ps.setString(3, vo.getId());
            int cnt = ps.executeUpdate();
            if(cnt>0){
                connection.commit();
                b=true;
            }else{
                connection.rollback();
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }
        return b;
    }


    // 공지 삭제
    public boolean noticeDelete(NoticeVo vo){
        boolean b=false;
        String sql = "delete from notice where id=? and sno=?";

        try{
            ps = connection.prepareStatement(sql);
            ps.setString(1, vo.getId());
            ps.setInt(2, vo.getSno());
            int cnt = ps.executeUpdate();
            if(cnt>0){
                sql = "delete from notice_check where notice_sno=?";
                ps = connection.prepareStatement(sql);
                ps.setInt(1, vo.getSno());
                ps.executeUpdate();

                connection.commit();
                b=true;
            }else{
                connection.rollback();
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }
        return b;

    }



    // 사용자별 미확인 공지 개수
    public Map<String, Integer> allUser(){
        Map<String, Integer> allUser = new HashMap<>();
        String sql = " select id, (select count(*) from notice " + 
                     " where sno not in(" + 
                     "    select notice_sno from notice_check where id=user.id )) cnt " +
                     " from user";
        try{
            ps = connection.prepareStatement(sql);
            rs = ps.executeQuery();
            while(rs.next()){
                allUser.put(rs.getString("id"), rs.getInt("cnt"));
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }

        return allUser;
    }

    // 마지막 입력된 공지사항
    public NoticeVo selectLastOne(){
        NoticeVo notiVo = new NoticeVo();
        String sql = "select * from notice order by sno desc limit 0,1";
        try{
            ps = connection.prepareStatement(sql);
            rs = ps.executeQuery();
            if(rs.next()){
                notiVo.setSno(rs.getInt("sno"));
                notiVo.setId(rs.getString("id"));
                notiVo.setSubject(rs.getString("subject"));
                notiVo.setDoc(rs.getString("doc"));
            }
        }catch(Exception ex){
            ex.printStackTrace();
        }

        return notiVo;
    }
}