<?php
/**
 *index.php入口文件
 */
include dirname(__FILE__).'/config.php';//配置文件
include dirname(__FILE__).'/init.php';//加载初始化文件
include dirname(__FILE__).'/home/config/config.php';//项目配置文件
include dirname(__FILE__).'/system/core/function.php';//引入项目方法库文件
include dirname(__FILE__).'/system/app.php';//系统核心文件
init_smarty(dirname(__FILE__).'/home');//初始化smarty
$smarty->assign("t_dir",$smarty_template_dir);