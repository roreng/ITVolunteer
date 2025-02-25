<?php

if(!$candidates || empty($candidates))
	return;

/** Volunteers list item **/
function frl_task_candidate_markup(WP_User $candidate, $actionable = false, $response = false) {
$activity = tst_get_member_activity($candidate, 'solved');	
$member_url = trailingslashit(site_url('/members/'.$candidate->user_login));
$itv_reviews = ItvReviews::instance();
?>
<div class="c-img">
	<?php tst_temp_avatar($candidate);?>
</div>

<div class="c-name">
	<a href="<?php echo $member_url;?>"><?php echo $candidate->first_name.' '.$candidate->last_name;?></a>
	<?php if($response && p2p_get_meta($candidate->p2p_id, 'is_approved', true)) { ?>	
		<?php if($review = $itv_reviews->get_review_for_doer_and_task($candidate->ID, get_the_ID())):?>
		    <div class="alert alert-warning itv-review4doer-alert" id="review-exist-alert"><?php _e('You have already left a review', 'tst') ?></div>
			<div class="rating-in-candidates-list pull-left"><?php itv_show_review_rating_readonly($review->rating); ?></div>
		<?php else:?>	
			<div class="leave-review" data-doer-id="<?php echo $candidate->ID;?>" data-task-id="<?php the_ID();?>"><?php _e('Leave review', 'tst');?></div>
		<?php endif?>		
	<?php } else { ?>
		<div class="user-rating"><?php echo __('Rating', 'tst').': <span>'.(int)$activity['solved'].'</span>';?></div>
	<?php } ?>
</div>

<div class="c-actions">	
<?php
	if($actionable) {
		$label = p2p_get_meta($candidate->p2p_id, 'is_approved', true) ? __('Disapprove', 'tst') : __('Approve', 'tst');
	?>
	<div class="approvable"><div class="pretty-checkbox for-approve">
		<input type="checkbox" id="is_approved-<?php echo (int)$candidate->ID;?>" name="is_approved[]" data-link-id="<?php echo $candidate->p2p_id;?>" data-doer-id="<?php echo $candidate->ID;?>" data-task-id="<?php the_ID();?>" data-nonce="<?php echo wp_create_nonce($candidate->p2p_id.'-candidate-'.$candidate->ID);?>"value="1" <?php checked(p2p_get_meta($candidate->p2p_id, 'is_approved', true));?> title="<?php echo esc_attr($label);?>">
		<label for="is_approved"></label>
	</div></div>
<?php
} else { $checked = (p2p_get_meta($candidate->p2p_id, 'is_approved', true)) ? ' checked' : '';  ?>
	<div class="approvable"><span class="chk-btn<?php echo $checked;?>"><span class="glyphicon glyphicon-ok"></span></span></div>
<?php } ?>

</div>
<?php
}


/** Volunteers list **/

	$actionable = false;
	$response = false;
	
	if($is_curr_users_task && $post->post_status == 'publish') {
		$actionable = true;
	} elseif($is_curr_users_task && $post->post_status == 'closed') {
		$response = true;
	}

?>
<div class="connected-users">
	<h5><?php _e('Оffered their help', 'tst');?></h5>
	<ul>
	<?php foreach($candidates as $candidate) {?>
		<li><?php frl_task_candidate_markup($candidate, $actionable, $response);?></li>
	<?php }?>
	</ul>
</div>