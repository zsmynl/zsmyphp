<?php
/*
 *zsmy_mvc框架核心驱动文件；
 *app.php文件作用：加载核心控制器、核心控制器类、类库、自定义类库；
 *url分发；
 *http://www.baidu.com/index.php?controller=index&action=index$id=7
 *app:新建项目名称，由于是有不同的入口文件，app可以在配置文件中配置，不用写进url
 *controller：控制器文件名称
 *action：控制器中的方法
 *id：方法参数
*/
define('SYSTEM_PATH',dirname(__FILE__));
define('ROOT_PATH',substr(SYSTEM_PATH,0,-7));
final class Application{
    public static $_lib = null;
    public static $_config = null;
    
    public static function init(){
        self::setAutoLibs();
        require SYSTEM_PATH.'/core/controller.php';
        require SYSTEM_PATH.'/core/model.php';        
    }
    /*创建应用
     */
    public static function run($config){
    self::$_config = $config[system];//引入配置文件
    //引入并加载核心类库和控制类
    self::init();
    self::autoload();//自定义类库实例化完成，可直接实例化。
    //url分发
    self::$_lib['route']->setUrlType(self::$_config[route][url_type]);//取得url类型
    $url_array = self::$_lib['route']->getUrlArray();//将url转换成数组
    self::routeToCm($url_array);//url分发
    }
    /*
     *自动加载系统类库文件
     */
    public static function setAutoLibs(){
        self::$_lib = array(
            'route' => SYSTEM_PATH.'/lib/lib_route.php',
            'mysql' => SYSTEM_PATH.'/lib/lib_mysql.php'  
);
}
    /*载入系统类库文件并实例化
     */
    public static function autoload(){
        foreach(self::$_lib as $key => $value){
            require self::$_lib[$key];//此处require函数没有加括号
            $lib = ucfirst($key);
            self::$_lib[$key]= new $lib;            
        }  
    }
    /*根据url分发
     */
    public static function routeToCm($url_array=array()){
                $controller = '';//控制器名称
                $action = '';//方法名称
                $model = '';//模型名称
                $params = '';//参数
        //控制器
        if(isset($url_array['controller'])){
            $controller = $model =$url_array['controller'];
            $controller_file = ROOT_PATH.APP_NAME.'control/'.$controller.'Control.php';
            $model_file      = ROOT_PATH.APP_NAME.'model/'.$model.'Model.php'; 
        }
        //方法
        if(isset($url_array['action'])){
            $action = $url_array['action']; 
        }else{
            $action = self::$_config['route']['default_action'];
        }
        //参数
        if(isset($url_array['params'])){
            $params = $url_array['params'];           
        }
        //对获得的url链接进行如理
        if(file_exists($controller_file)){//file_exists文件判断是否存在指定的文件或文件路径。
            if(file_exists($model_file)){
            require $model_file;    
            }            
            require $controller_file;
            //引入控制器文件后进行实例化
            $controller = $controller.'Controller';
            $controller = new $controller;
            if($action){
                if(method_exists($controller,$action)){//判断是否存在指定类中的方法。
                    isset($params)?$controller->$action($params):$controller->$action();
                }else{
                    die('控制器方法不存在！');
                }
                
            }else{
                die("控制器方法不存在！");
            }  
        }else{
            die("控制器不存在！");
        } 
    }
  
}