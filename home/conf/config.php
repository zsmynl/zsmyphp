<?php
/*项目配置目录。
 */
//smarty相关配置
$smarty_template_dir	        =dirname($_SERVER['SCRIPT_FILENAME']).'/home/view/';//smarty模板目录
$smarty_compile_dir		=dirname($_SERVER['SCRIPT_FILENAME']).'/home/runtime/templates_c/';//smarty模板编译目录
$smarty_config_dir		=dirname($_SERVER['SCRIPT_FILENAME']).'/home/conf/';//smarty配置目录
$smarty_cache_dir		=dirname($_SERVER['SCRIPT_FILENAME']).'/home/runtime/cache/';//smarty缓存目录
$smarty_caching			=false;
$smarty_delimiter		=explode("|","<{|}>");//smarty左右分隔符
//项目名称配置
define('APP_NAME','/home/');

?>