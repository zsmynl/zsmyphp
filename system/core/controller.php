<?php
/**
 *controller.php控制类文件
 */
class Controller {
    public function __construct(){ 
    }  
    /*初始化模型类函数*/
    final protected function model($model){
        if (empty($model)) {
            trigger_error('模型类文件加载失败');
        }
        $model_name = $model.'Model';
        return new $model_name;
    }
    /*加载类文件函数*/
    final protected function load($lib,$my = FALSE){
        if(empty($lib)){
            trigger_error("类文件为空");
        }elseif($my === FALSE){
            return Application::$_lib[$lib];
        }elseif($my === TRUE){
            return Application::newlib($lib);            
        } 
    }
}