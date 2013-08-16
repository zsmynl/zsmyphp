<?php
/*Ӧ�������ļ�
 *����home��Ŀ�������ļ��������޸ġ�
 */
require dirname(__FILE__).'/config/config.php';//���������ļ���
require dirname(__FILE__).'/common/smarty/Smarty.class.php';//����smarty�ļ���
require dirname(__FILE__).'/home/conf/config.php';//������Ŀ�����ļ���
require dirname(__FILE__).'/system/app.php';//���������ļ���

//***********smarty***********
$smarty = new smarty();
$smarty->template_dir = $smarty_template_dir;
$smarty->compile_dir  = $smarty_compile_dir;
$smarty->config_dir   = $smarty_config_dir;
$smarty->cache_dir    = $smarty_cache_dir;
$smarty->caching      = $smarty_caching;
$smarty->left_delimiter =$smarty_delimiter[0];
$smarty->right_delimiter=$smarty_delimiter[1];

$smarty->assign("t_dir",$smarty_template_dir);


/*smarty test!
$str="aaaaaaaaaa";
$smarty->assign("str",$str);
$smarty->display("index/index.html");
改变一些。
*/
?>






