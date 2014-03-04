<?php
if (!defined('IN_ZSM')) die('Access Denied');

/*获得smarty对象*/
function init_smarty($temp_path){
	require_once(TEMP_PATH.'/common/smarty/Smarty.class.php');
	$smarty = new smarty;
	$smarty -> template_dir   = $temp_path.'/view';
	$smarty -> compile_dir    = $temp_path.'/runtime/templates_c/';
	$smarty -> config_dir     = $temp_path.'/conf/';
	$smarty -> cache_dir      = $temp_path.'/runtime/cache/';
	$smarty -> caching        = $smarty_caching;
	$smarty -> left_delimiter =$smarty_delimiter[0];
	$smarty -> right_delimiter=$smarty_delimiter[1];
}