<?php
/*
 *核心控制器,项目控制器常用操作
 *文件中是常用的实例化模型操作model
 */
class Controller {

    public function __construct(){
        
    }  
    /*
     *实例化模型操作
     *只有项目的控制器类可以使用model方法。protected
     *model方法不能被覆盖，是最终版本。final
     *indexModel
     */
    final protected function model($model){
                if (empty($model)) {
                        trigger_error('不能实例化空模型');
                }
                $model_name = $model.'Model';
                return new $model_name;
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
}


