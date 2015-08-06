<?php

class ItvSiteStats {
	public static $USERS_ROLE_BENEFICIARY = 'common_stats_users_beneficiary_count';
	public static $USERS_ROLE_SUPERHERO = 'common_stats_users_superhero_count';
	public static $USERS_ROLE_ACTIVIST = 'common_stats_users_activist_count';
	public static $USERS_ROLE_VOLUNTEER = 'common_stats_users_volunteer_count';
	public static $USERS_TOTAL = 'common_stats_users_count';
	
	private static $_instance = NULL;
	
	public static function instance() {
		if(ItvSiteStats::$_instance == NULL) {
			ItvSiteStats::$_instance = new ItvSiteStats();
		}
		return ItvSiteStats::$_instance;
	}
	
	public function get_stats_value($key) {
		$value = get_option($key);
		return $value ? $value : 0;
	}

	public function refresh_users_role_stats() {

		$users_query_params = array(
// 			'number' => $per_page,
// 			'offset' => $offset,
			'exclude' => ACCOUNT_DELETED_ID,
		);
		$user_query = new WP_User_Query($users_query_params);
		
		$USERS_ROLE_BENEFICIARY_COUNT = 0;
		$USERS_ROLE_SUPERHERO_COUNT = 0;
		$USERS_ROLE_ACTIVIST_COUNT = 0;
		$USERS_ROLE_VOLUNTEER_COUNT = 0;
		$USERS_COUNT = 0;
				
		foreach($user_query->results as $user) {
			$is_count = false;
			if ( !empty( $user->roles ) && is_array( $user->roles ) ) {
				foreach ( $user->roles as $role ) {
					if($role == 'author') {
						$is_count = true;
					}
				}
			}
						
			if($is_count) {
				
				tst_update_member_stat($user);
				$user_role = tst_get_member_role_key($user);
				
				if($user_role == 'donee') {
					$USERS_ROLE_BENEFICIARY_COUNT += 1;
				}
				elseif($user_role == 'hero') {
					$USERS_ROLE_SUPERHERO_COUNT += 1;
				}
				elseif($user_role == 'activist') {
					$USERS_ROLE_ACTIVIST_COUNT += 1;
				}
				elseif($user_role == 'volunteer') {
					$USERS_ROLE_VOLUNTEER_COUNT += 1;
				}
				else {
					$USERS_COUNT +=1;
				}
			}
		}
		
		$USERS_COUNT += ($USERS_ROLE_BENEFICIARY_COUNT+$USERS_ROLE_SUPERHERO_COUNT+$USERS_ROLE_ACTIVIST_COUNT+$USERS_ROLE_VOLUNTEER_COUNT);
		
		update_option(ItvSiteStats::$USERS_ROLE_BENEFICIARY, $USERS_ROLE_BENEFICIARY_COUNT);		
		update_option(ItvSiteStats::$USERS_ROLE_SUPERHERO, $USERS_ROLE_SUPERHERO_COUNT);		
		update_option(ItvSiteStats::$USERS_ROLE_ACTIVIST, $USERS_ROLE_ACTIVIST_COUNT);
		update_option(ItvSiteStats::$USERS_ROLE_VOLUNTEER, $USERS_ROLE_VOLUNTEER_COUNT);	
		update_option(ItvSiteStats::$USERS_TOTAL, $USERS_COUNT);		
	}
	
}