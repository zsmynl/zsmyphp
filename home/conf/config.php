<?php
/*��Ŀ����Ŀ¼��
 */
//smarty�������
$smarty_template_dir	        =dirname($_SERVER['SCRIPT_FILENAME']).'/home/view/';//smartyģ��Ŀ¼
$smarty_compile_dir		=dirname($_SERVER['SCRIPT_FILENAME']).'/home/runtime/templates_c/';//smartyģ�����Ŀ¼
$smarty_config_dir		=dirname($_SERVER['SCRIPT_FILENAME']).'/home/conf/';//smarty����Ŀ¼
$smarty_cache_dir		=dirname($_SERVER['SCRIPT_FILENAME']).'/home/runtime/cache/';//smarty����Ŀ¼
$smarty_caching			=false;
$smarty_delimiter		=explode("|","<{|}>");//smarty���ҷָ���
//��Ŀ��������
define('APP_NAME','/home/');

?>