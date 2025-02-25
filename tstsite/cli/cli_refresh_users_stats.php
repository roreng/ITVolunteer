<?php

require_once(dirname(__FILE__) . '/../inc/itv_user_reg_source_detector.php');

$ITV_APP_FILE = __FILE__;

try {
	include('cli_common_longrun.php');
	
	$itv_site_stats = ItvSiteStats::instance();
	
	$start002 = microtime(true);
	$itv_site_stats->set_app($ITV_CLI_APP);
	$itv_site_stats->refresh_users_role_stats(100);
	echo "process all users: ".(microtime(true) - $start002) . " sec.\n";
	
	if($ITV_CLI_APP->delete_data_file()) {
	    echo "data file delete OK\n";
	}
	else {
	    echo "data file delete ERROR!!!\n";
	}

	echo_end_text();
}
catch (ItvNotCLIRunException $ex) {
	echo $ex->getMessage() . "\n";
}
catch (ItvCLIHostNotSetException $ex) {
	echo $ex->getMessage() . "\n";	
}
catch (Exception $ex) {
	echo $ex;
}
