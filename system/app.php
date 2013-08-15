<?php
/*
 *zsmy_mvc��ܺ��������ļ���
 *app.php�ļ����ã����غ��Ŀ����������Ŀ������ࡢ��⡢�Զ�����⣻
 *url�ַ���
 *http://www.baidu.com/index.php?controller=index&action=index$id=7
 *app:�½���Ŀ���ƣ��������в�ͬ������ļ���app�����������ļ������ã�����д��url
 *controller���������ļ�����
 *action���������еķ���
 *id����������
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
    /*����Ӧ��
     */
    public static function run($config){
    self::$_config = $config[system];//���������ļ�
    //���벢���غ������Ϳ�����
    self::init();
    self::autoload();//�Զ������ʵ������ɣ���ֱ��ʵ������
    //url�ַ�
    self::$_lib['route']->setUrlType(self::$_config[route][url_type]);//ȡ��url����
    $url_array = self::$_lib['route']->getUrlArray();//��urlת��������
    self::routeToCm($url_array);//url�ַ�
    }
    /*
     *�Զ�����ϵͳ����ļ�
     */
    public static function setAutoLibs(){
        self::$_lib = array(
            'route' => SYSTEM_PATH.'/lib/lib_route.php',
            'mysql' => SYSTEM_PATH.'/lib/lib_mysql.php'  
);
}
    /*����ϵͳ����ļ���ʵ����
     */
    public static function autoload(){
        foreach(self::$_lib as $key => $value){
            require self::$_lib[$key];//�˴�require����û�м�����
            $lib = ucfirst($key);
            self::$_lib[$key]= new $lib;            
        }  
    }
    /*����url�ַ�
     */
    public static function routeToCm($url_array=array()){
                $controller = '';//����������
                $action = '';//��������
                $model = '';//ģ������
                $params = '';//����
        //������
        if(isset($url_array['controller'])){
            $controller = $model =$url_array['controller'];
            $controller_file = ROOT_PATH.APP_NAME.'control/'.$controller.'Control.php';
            $model_file      = ROOT_PATH.APP_NAME.'model/'.$model.'Model.php'; 
        }
        //����
        if(isset($url_array['action'])){
            $action = $url_array['action']; 
        }else{
            $action = self::$_config['route']['default_action'];
        }
        //����
        if(isset($url_array['params'])){
            $params = $url_array['params'];           
        }
        //�Ի�õ�url���ӽ�������
        if(file_exists($controller_file)){//file_exists�ļ��ж��Ƿ����ָ�����ļ����ļ�·����
            if(file_exists($model_file)){
            require $model_file;    
            }            
            require $controller_file;
            //����������ļ������ʵ����
            $controller = $controller.'Controller';
            $controller = new $controller;
            if($action){
                if(method_exists($controller,$action)){//�ж��Ƿ����ָ�����еķ�����
                    isset($params)?$controller->$action($params):$controller->$action();
                }else{
                    die('���������������ڣ�');
                }
                
            }else{
                die("���������������ڣ�");
            }  
        }else{
            die("�����������ڣ�");
        } 
    }
  
}