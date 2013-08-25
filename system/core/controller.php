<?php
/*
 *���Ŀ�����,��Ŀ���������ò���
 *�ļ����ǳ��õ�ʵ����ģ�Ͳ���model
 */
class Controller {

    public function __construct(){
        
    }  
    /*
     *ʵ����ģ�Ͳ���
     *ֻ����Ŀ�Ŀ����������ʹ��model������protected
     *model�������ܱ����ǣ������հ汾��final
     *indexModel
     */
    final protected function model($model){
                if (empty($model)) {
                        trigger_error('����ʵ������ģ��');
                }
                $model_name = $model.'Model';
                return new $model_name;
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
}


