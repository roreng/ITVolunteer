<?php

set_time_limit (0);
ini_set('memory_limit','256M');

try {
	$time_start = microtime(true);
	include('cli_common.php');
	echo 'Memory before anything: '.memory_get_usage(true).chr(10);

	global $wpdb;
    
    
	//Homepage & Archive
	echo 'START'.chr(10).chr(10);

  $user_params = array(
      'ID' => 75,
      'user_email' => "test4@ngo2.ru",
      #'user_login' => "denis005",
      #'user_pass' => "123123",
  );

  $result = wp_update_user($user_params);
  print_r($result);
    
	echo chr(10) . chr(10);
  echo 'DONE'.chr(10);

	//Final
	echo 'Memory '.memory_get_usage(true).chr(10);
	echo 'Total execution time in sec: ' . (microtime(true) - $time_start).chr(10).chr(10);
    
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