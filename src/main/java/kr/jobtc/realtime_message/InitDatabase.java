package kr.jobtc.realtime_message;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/* 모든 테이블과 데이터가 초기화 됩니다. */
public class InitDatabase {
    Connection connection;
    PreparedStatement ps;
    ResultSet rs;
    String dbUrl = "jdbc:mysql://localhost:3306/";
    String dbName = "easy";
    String dbUser = "root";
    String dbPwd = "1111";


    public void create() throws Exception{
        int result=0;

        // easy 데이터 베이스 유무를 체크하여 없으면 생성해줌.
        connection = DriverManager.getConnection(dbUrl, dbUser, dbPwd);
        connection.setAutoCommit(false);
        String sql = "show databases like ?";
        ps= connection.prepareStatement(sql);
        ps.setString(1, dbName);
        rs = ps.executeQuery();
        
        if(rs.next()){
            System.out.printf("%s database가 이미 존재함\n", dbName);
        }else{
            System.out.printf("%s database가 존재하지 않음.\n", dbName);
            sql = "create database " + dbName;
            ps = connection.prepareStatement(sql);
            result = ps.executeUpdate();
            if(result>0){
                System.out.printf("%s database가 생성됨.\n", dbName);
            }
        }

        // database 선택
        sql = "use " + dbName;
        ps = connection.prepareStatement(sql);
        ps.executeUpdate();
        System.out.printf("%s database가 선택됨\n", dbName);

        // user data init -------------------------------------------
        String[] userData = {"kim", "hong", "lee", "park", "nam" };

        sql = "drop table user";
        ps = connection.prepareStatement(sql);
        try{
            ps.executeUpdate();
        }catch(Exception ex){}

        sql = "create table user( id varchar(20), pwd varchar(20) )";
        ps = connection.prepareStatement(sql);
        ps.executeUpdate();
        connection.commit();

        sql = "insert into user(id, pwd) values(?,?)";
        ps = connection.prepareStatement(sql);

        for(String user : userData){
            ps.setString(1, user);
            ps.setString(2, user);
            ps.addBatch();
        }

        ps.executeBatch();
        connection.commit();
        System.out.println("user table 데이터 초기화 완료.");


        // notice table init-------------------------------------
        String[][] noticeData = { //제목과 내용은 동일하게
            {"공지1", "hong"},
            {"공지2", "hong"},
            {"공지3", "kim"},
            {"공지4", "kim"},
            {"공지5", "park"},
        };

        sql = "drop table notice";
        ps = connection.prepareStatement(sql);
        try{
            ps.executeUpdate();
        }catch(Exception ex){}

        sql = "create table notice( " + 
              " sno int primary key auto_increment," + 
              " subject varchar(100)," + 
              " doc     varchar(500)," + 
              " id      varchar(20)" + 
              ")";
        ps = connection.prepareStatement(sql);
        ps.executeUpdate();
        connection.commit();

        sql = "insert into notice(subject, doc, id) values(?,?,?)";
        ps = connection.prepareStatement(sql);

        for(String[] n : noticeData){
            ps.setString(1, n[0]);
            ps.setString(2, n[0]);
            ps.setString(3, n[1]);
            ps.addBatch();
        }

        ps.executeBatch();
        connection.commit();
        System.out.println("notice table 데이터 초기화 완료.");


        // notice_check table init---------------------------
        String[][] noticeCheckData = { // {sno, id}
            {"1", "kim"},
            {"2", "kim"},
            {"1", "park"}
        };

        sql = "drop table notice_check";
        ps = connection.prepareStatement(sql);
        try{
            ps.executeUpdate();
        }catch(Exception ex){}

        sql = "create table notice_check( " + 
              " sno int primary key auto_increment," + 
              " notice_sno int," + 
              " id      varchar(20)" + 
              ")";
        ps = connection.prepareStatement(sql);
        ps.executeUpdate();
        connection.commit();

        sql = "insert into notice_check(notice_sno, id) values(?,?)";
        ps = connection.prepareStatement(sql);

        for(String[] n : noticeCheckData){
            ps.setString(1, n[0]);
            ps.setString(2, n[1]);
            ps.addBatch();
        }

        ps.executeBatch();
        connection.commit();
        System.out.println("notice_check table 데이터 초기화 완료.");

        System.out.println("모든 작업이 종료되었습니다.");

    }

    public static void main(String[] args) throws Exception{
        InitDatabase initDB = new InitDatabase();
        initDB.create();
    }
}
