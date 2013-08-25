<?php
/*
 *核心控制器类
 */
class model{
    protected $db = null;
    final public function __construct(){ //初始化函数
        //header('Content-type:text/html;chartset=utf-8');
        $this-> db = $this->load('mysql');//记载mysql类库文件
        $config_db = $this->config('db');
        $this ->db ->init(
                        $config_db['db_host'],
                        $config_db['db_user'],
                        $config_db['db_password'],
                        $config_db['db_database'],
                        $config_db['db_conn'],
                        $config_db['db_charset'] 
        );
    }
    /*
     *数据表操作函数table
     *table方法只能被子类继承使用不能被覆盖。final
     *table方法只能在继承model类的类中可以使用。protected
     *
     */
    final protected function table($table_name){
    $config_db = $this->config('db');
        if(empty($table_name)){
            die("表名不能为空");
        }else{
            return $config_db['db_table_prefix'].$table_name;
        }
    }
 
    /*
     *加载系统类库或自定义类库文件
     */
    final protected function load($lib,$my = FALSE){
        if(empty($lib)){
            trigger_error("类库不存在！");
        }elseif($my === FALSE){//系统类库
            return Application::$_lib[$lib];
        }elseif($my === TRUE){//自定义类库
            return Application::newlib($lib);            
        } 
    }
    /*
     *获取配置信息。
     */
     final protected function config($con=''){
        return Application::$_config[$con];      
    }
 
}