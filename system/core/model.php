<?php
/*
 *���Ŀ�������
 */
class model{
    protected $db = null;
    final public function __construct(){ //��ʼ������
        //header('Content-type:text/html;chartset=utf-8');
        $this-> db = $this->load('mysql');//����mysql����ļ�
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
     *���ݱ��������table
     *table����ֻ�ܱ�����̳�ʹ�ò��ܱ����ǡ�final
     *table����ֻ���ڼ̳�model������п���ʹ�á�protected
     *
     */
    final protected function table($table_name){
    $config_db = $this->config('db');
        if(empty($table_name)){
            die("��������Ϊ��");
        }else{
            return $config_db['db_table_prefix'].$table_name;
        }
    }
 
    /*
     *����ϵͳ�����Զ�������ļ�
     */
    final protected function load($lib,$my = FALSE){
        if(empty($lib)){
            trigger_error("��ⲻ���ڣ�");
        }elseif($my === FALSE){//ϵͳ���
            return Application::$_lib[$lib];
        }elseif($my === TRUE){//�Զ������
            return Application::newlib($lib);            
        } 
    }
    /*
     *��ȡ������Ϣ��
     */
     final protected function config($con=''){
        return Application::$_config[$con];      
    }
 
}