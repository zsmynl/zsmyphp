<?php
final class Session {

    function user_shell($uid,$shell){//session中的信息和数据库的信息作对比
           $sql="select * from wx_user where `id` = '$uid'";
           $qu = mysql_query($sql);
           $ps = is_array($user=mysql_fetch_array($qu));
           $ps ? $shell = md5($user['name'].$user['password']):FALSE;
           if($ps){
            return $user;
           }
    }      
           
    function user_mktime($ontime){//判断是否登录超时
        $new_time = mktime();
        $timecut = $new_time - $ontime;
        if($timecut > '3600'){
            session_destroy();
        }else{
            $SEESION['time'] = mktime();
        }  
    }

}

