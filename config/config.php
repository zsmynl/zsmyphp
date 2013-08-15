<?php
/*配置文件
 */
/*数据库配置,二维数组,把相关的配置信息写到$CONFIG['system']这个二位数组中*/
$CONFIG['system']['db'] = array(
    'db_host'         => 'localhost',
    'db_user'         => 'root',
    'db_password'     => '',
    'db_database'     => '',
    'db_table_prefix' => 'wx',//定义表前缀
    'db_charset'      => 'UTF-8',//定义数据库编码
    'db_conn'         => '' //定义数据库链接方式
);

/*自定义类库配置*/
$CONFIG['system']['lib'] = array(
    'prefix'          => 'my'  //自定义类库文件前缀 
);
$CONFIG['system']['route'] = array(
     'default_controller'  =>   'index',//系统默认控制器，indexcontroller.php。
     'default_action'      =>   'index',//系统默认控制器，指的控制器的indexcontroller.php中的index方法。
     'url_type'            =>   1   //定义url形式 
);

?>