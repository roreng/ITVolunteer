<?php
/**
 * Template Name: Member actions
 *
 **/


$member_data = array();
$social_ids =  wp_get_user_contact_methods();

if(empty($_GET['member'])) {
    $refer = stristr(wp_get_referer(), $_SERVER['REQUEST_URI']) !== false ? home_url() : wp_get_referer();
    $back_url = $refer ? $refer : home_url();

    wp_redirect($back_url);
    exit;
}
		
$member_id = (int)$_GET['member'];
$member = get_user_by('id', $member_id);
if(empty($member) || !current_user_can('edit_user', $member_id)) {
    wp_redirect(home_url('member-actions'));
    exit;
}

$member_data = array(
    'member_id' =>  $member_id,
    'user_login' => $member->user_login,
    'user_email' => $member->user_email,
    'first_name' => $member->first_name,
    'last_name' => $member->last_name,
    'user_city' => tst_get_member_field('user_city', $member),
    'user_speciality' => tst_get_member_field('user_speciality', $member),
    'user_bio' => tst_get_member_field('user_bio', $member),    
    'user_contacts' => tst_get_member_field('user_contacts', $member),
    'user_website' => tst_get_member_field('user_website', $member),
    'user_skype' => tst_get_member_field('user_skype', $member),
	'user_workplace' => tst_get_member_field('user_workplace', $member),
	'user_workplace_desc' => tst_get_member_field('user_workplace_desc', $member),
);

$social = array();
if($social_ids) {
    foreach($social_ids as $id => $label) {
        $value = get_user_meta($member->ID, $id, true);
        $social[$id] = (!empty($value)) ? $value : '';
    }
}

$member_data = array_merge($member_data, $social);

function tst_print_member_field($field, $data){
	return empty($data[$field]) ? '' : $data[$field];
}

get_header();?>

<article class="member-actions">
<?php while ( have_posts() ) : the_post();?>


<header class="page-heading no-breadcrumbs">

	<div class="row">
		<div class="col-md-8">
			
			<h1 class="page-title">
				<?php echo frl_page_title();?>
				 <a href="<?php echo tst_get_member_url($member);?>" class="edit-item"><?php _e('Back to Preview mode', 'tst');?></a>
			</h1>			
		</div>
		
		<div class="col-md-4">
			<div class="status-block-member in-action">
				<div class="row-top"><?php tst_editmember_fixed_meta($member);?></div>
			</div>
		</div>
	</div><!-- .row -->

</header>
	
<div class="page-body">
<div class="row in-single">

<form id="member_action" action="#" method="post">
<?php wp_nonce_field('member_action');?>
    <input type="hidden" id="member_id" value="<?php echo $member_data['member_id'];?>" />

	<div class="col-md-4">
		<h4><?php _e('Settings', 'tst');?></h4>
		<div class="panel panel-default"><div class="panel-body">
			
		<div class="form-group">
			<label for="user_login"><?php _e('Username', 'tst');?></label>
			<input type="text" name="user_login" id="user_login" value="<?php echo esc_attr(tst_print_member_field('user_login', $member_data));?>" disabled="disabled" class="form-control">
			<small class="help-block"><?php _e("Username can't be changed", 'tst');?>.</small>
		</div>
		
		<div class="form-group">
			<label for="user_contacts"><?php _e('Email', 'tst');?></label>
			<input type="text" name="email" id="email" value="<?php echo esc_attr(tst_print_member_field('user_email', $member_data));?>" class="form-control" />
            <div id="user_email_vm" class="validation-message" style="display: none;"></div>
		</div>
		
		<div class="form-group">
			<label for="pass1"><?php _e('New password', 'tst');?></label>
			<input class="hidden" value=" " /><!-- #24364 workaround -->
			<input type="password" name="pass1" id="pass1" class="form-control" value="" autocomplete="off" />
			<small class="help-block"><?php _e('If you would like to change the password type a new one. Otherwise leave this blank.', 'tst'); ?></small>
		</div>
		
		<div class="form-group">
			<label for="pass2"><?php _e('Repeat password', 'tst');?></label>			
			<input name="pass2" type="password" id="pass2" class="form-control" value="" autocomplete="off" />
            <div id="user_pass_vm" class="validation-message" style="display: none;"></div>
		</div>
		
		
		
		</div></div>
		
		<hr>
		<div class="">
			<a href="#" id="delete_profile" class="btn-delete btn btn-default profile-action"><?php _e('Delete profile', 'tst');?></a>
		</div>
	</div><!-- .col-md-4 -->

	<div class="col-md-8">
		<h4><?php _e('Profile data', 'tst');?></h4>
		
		<div class="form-group avatar-group">			
			<?php
				$user_avatar = tst_get_member_user_avatar($member_data['member_id']);
				$fallback = tst_get_avatar_fallback($member_data['member_id']);
			?>
			<div class="user_avatar-show"><?php echo $fallback;?></div>			
			<!--<label for="user_avatar"><?php _e('Member avatar', 'tst');?></label>-->	
			<a id="upload_user_avatar" href="javascript:void(0);" class="btn btn-primary btn-xs itv-avatar-action"><?php _e('Upload user avatar', 'tst');?></a>
			&nbsp;<a id="delete_user_avatar" href="javascript:void(0);" class="btn btn-default btn-xs itv-avatar-action" <?php if(!$user_avatar):?>style="display:none;"<?php endif?>><?php _e('Delete avatar', 'tst');?></a>
			
			<div id="upload_user_avatar_info"><?php echo $user_avatar; ?></div>
			<div id="upload_user_avatar_loading" style="display:none;"><img src="<?php echo site_url( '/wp-includes/images/spinner-2x.gif' ); ?>" /></div>
		</div>
		
		<div class="form-group">
			<label for="first_name"><?php _e('First name', 'tst');?></label>
			<input type="text" class="form-control" name="first_name" id="first_name" value="<?php echo esc_attr(tst_print_member_field('first_name', $member_data));?>">			
            <div id="first_name_vm" class="validation-message" style="display: none;"></div>
		</div>
		
		<div class="form-group">
			<label for="last_name"><?php _e('Last name', 'tst');?></label>
			<input type="text" class="form-control" name="last_name" id="last_name" value="<?php echo esc_attr(tst_print_member_field('last_name', $member_data));?>">			
            <div id="last_name_vm" class="validation-message" style="display: none;"></div>
		</div>
		
		<div class="form-group">
			<label for="user_city"><?php _e('City', 'tst');?></label>
			<input type="text" class="form-control" name="user_city" id="user_city" value="<?php echo esc_attr(tst_print_member_field('user_city', $member_data));?>" placeholder="<?php _e('Please specify the city you live in', 'tst');?>">			
		</div>
		
		<div class="form-group">
			<label for="user_speciality"><?php _e('Speciality', 'tst');?></label>
			<input type="text" class="form-control" name="user_speciality" id="user_speciality" value="<?php echo esc_attr(tst_print_member_field('user_speciality', $member_data));?>" placeholder="<?php _e('Describe your speciality in a few words', 'tst');?>">			
		</div>
		
		<div class="form-group">
			<label for="user_bio"><?php _e('Bio', 'tst');?></label>
			<textarea name="user_bio" id="user_bio" class="form-control" rows="6" placeholder="<?php _e('Please provide a brief information about yourself', 'tst');?>"><?php echo esc_textarea(tst_print_member_field('user_bio', $member_data));?></textarea>			
		</div>

		<div class="form-group">
			<label for="user_workplace"><?php _e('Organization', 'tst');?></label>
			<input type="text" class="form-control" name="user_workplace" id="user_workplace" value="<?php echo esc_attr(tst_print_member_field('user_workplace', $member_data));?>" placeholder="<?php _e('Name of your organization or project', 'tst');?>">
		</div>
		
		<div class="form-group">
			<label for="user_workplace_desc"><?php _e('About your organization', 'tst');?></label>
			<textarea name="user_workplace_desc" id="user_workplace_desc" class="form-control" rows="6" placeholder="<?php _e('Brief description of your organization or project', 'tst');?>"><?php echo esc_textarea(tst_print_member_field('user_workplace_desc', $member_data));?></textarea>			
		</div>
		
		<div class="form-group">
			<?php $user_company_logo = tst_get_member_user_company_logo($member_data['member_id']); ?>
			
			<!--<label for="user_company_logo"><?php _e('Company logo', 'tst');?></label>-->
			&nbsp;<a id="upload_user_company_logo" href="javascript:void(0);" class="btn btn-primary btn-xs itv-company-logo-action"><?php _e('Upload company logo', 'tst');?></a>
			&nbsp;<a id="delete_user_company_logo" href="javascript:void(0);" class="btn btn-default btn-xs itv-company-logo-action" <?php if(!$user_company_logo):?>style="display:none;"<?php endif; ?>><?php _e('Delete company logo', 'tst');?></a>
			
			<div id="upload_user_company_logo_info"><?php echo $user_company_logo; ?></div>
			<div id="upload_user_company_logo_loading" style="display:none;"><img src="<?php echo site_url( '/wp-includes/images/spinner-2x.gif' ); ?>" /></div>
		</div>
		
		
		
		<div>
			<label for="skills_list"><?php _e('Skills list', 'tst');?></label>
			<div class="skills_list clearfix">
			<?php
				$skills = tst_get_user_skills($member_data['member_id']);
				tst_show_user_skills($skills);
			?>
			</div>
		</div>
		
		<h4><?php _e('Contact details', 'tst');?></h4>		
		<?php //wp_get_user_contact_methods( $profileuser )
			$fields = array_merge(array('user_website' => __('Website', 'tst'), 'user_skype' => __('User Skype', 'tst')), $social_ids);
			foreach($fields as $key => $label) {?>

			<div class="form-group">
				<label for="<?php echo esc_attr($key);?>"><?php echo esc_attr($label); ?></label>
				<input type="text" class="form-control user_contacts" name="<?php echo esc_attr($key);?>" id="<?php echo esc_attr($key);?>" value="<?php echo esc_attr(tst_print_member_field($key, $member_data));?>">
			</div>

		<?php }?>

		<div class="form-group">
			<label for="user_contacts_text"><?php _e('Additional contact info', 'tst');?></label>
			<textarea name="user_contacts_text" id="user_contacts_text" class="form-control user_contacts" rows="4" placeholder="<?php _e('Please provide some additional ways to contact you', 'tst');?>"><?php echo esc_textarea(tst_print_member_field('user_contacts', $member_data));?></textarea>			
		</div>

        <div id="form_message"></div>

		<div class="form-group">
			<input type="submit" value="<?php _e('Save data', 'tst');?>" class="btn btn-primary profile-action" id="do_member_action" name="do-member-action">

			
		</div>
	</div> <!-- .col-md-8 -->

</form>
</div><!-- .row -->
</div> <!-- .page-body -->

<?php endwhile; // end of the loop. ?>
</article>

<?php get_footer(); ?>

