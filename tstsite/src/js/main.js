/* scripts */
jQuery(function($){
	$('html').removeClass('no-js').addClass('js');	
	var windowWidth = $('#page').width();
	
	/* Responsive nav */	
    var navCont = $('#site_navigation');
    $('#menu-trigger').on('click', function(e){

        e.preventDefault();
        if (navCont.hasClass('toggled')) { 
            //remove
            navCont.find('.site-navigation-area').slideUp('normal', function(){
				navCont.removeClass('toggled');
				navCont.find('.site-navigation-area').removeAttr('style');
			});
            
        }
        else { 
            //add
            navCont.find('.site-navigation-area').slideDown('normal', function(){
				navCont.addClass('toggled');
				navCont.find('.site-navigation-area').removeAttr('style');
			});
            
        }
    });
	
	  
	
	/* Masonry */
	var $members_list = $('.members-list');
	
	//imagesLoaded doesn't work because of gravatar
	$members_list.masonry({itemSelector: '.member'});			
	$(window).resize(function(){			
		$members_list.masonry('bindResize');		
	});
	
	
	var $tasks_list = $('.tasks-list');
	
	$tasks_list.masonry({
		itemSelector: '.item-masonry'
	});			
	
	$(window).resize(function(){			
		$tasks_list.masonry('bindResize');		
	});
	
	
	var $posts_list = $('.post-list'); 
	
	$posts_list.masonry({
		itemSelector: '.tpl-post'
	});
	$posts_list.imagesLoaded().progress( function() {
		$posts_list.masonry('layout');
	});	
	$(window).resize(function(){			
		$posts_list.masonry('bindResize');		
	});
	
	
	/* Modal on home */
	$('#tst-about-video-modal').on('shown.bs.modal', function () {
	    if(tst_video_ready_to_play) {
	        tst_youtube_player.playVideo();
	    }
	});
	
	$('#tst-about-video-modal').on('hidden.bs.modal', function() {
        if(tst_video_ready_to_play) {
            tst_youtube_player.pauseVideo();
        }
	});
	
	
	/* current paging item */
	$('ul.pagination').find('span.current').parents('li').addClass('active');
	
    $('#task-tags').chosen({
        disable_search_threshold: 10,
        max_selected_options: 3,
        no_results_text: frontend.chosen_no_results_text,
		width: '99%'
    });

    $('#task-nko-tags').chosen({
        disable_search_threshold: 10,
        max_selected_options: 1,
        no_results_text: frontend.chosen_no_results_text,
        width: '99%'
    });

    $('#task-delete').click(function(){
        var $form = $('#task-action');
        is_ok = confirm(frontend.task_delete_confirm);
        if(is_ok) {
        	$form.data('delete-clicked', 'true');
        }
        else {
        	$form.data('delete-clicked', '');
        }
        return is_ok
    });

    $('#open-contact-form').click(function(e){
        e.preventDefault();

        $(this).slideUp(200);
        $('#contact-form').slideDown(200);
    });
	
	 $('#close-contact-form').click(function(e){
        e.preventDefault();
		
		$('#contact-form').slideUp(200);
        $('#open-contact-form').slideDown(200);
        
    });
	
	
    $('#contact-form').on('submit', '', function(e){
        e.preventDefault();

        var $form = $(this),
            $submit = $form.find('input[type="submit"]'),
            form_is_valid = true,
            val = '';

        if( !$form.find('#name-field').val() ) {
            $('#name-message').html(frontend.contactor_name_empty).show();
            form_is_valid = false;
        } else
            $form.find('#name-message').html('').hide();

        val = $form.find('#email-field').val();
        if( !val.length ) {
            form_is_valid = false;
            $form.find('#email-message').html(frontend.user_email_empty).show();
        } else if( !email_is_valid(val) ) {
            form_is_valid = false;
            $form.find('#email-message').html(frontend.user_email_incorrect).show();
        } else
            $form.find('#email-message').html('').hide();

        if( !$form.find('#message-field').val() ) {
            $('#message-message').html(frontend.contactor_message_empty).show();
            form_is_valid = false;
        } else
            $form.find('#message-message').html('').hide();

        if( !form_is_valid )
            return;

        $submit.attr('disabled', 'disabled');
        $form.find('#result-message').html('').hide();
		
		var page_url;
		try {
			page_url = window.location.href;
		} catch(ex){}

        $.post(frontend.ajaxurl, {
            'action': 'add-message',
			'page_url': page_url,
            'nonce': $form.find('#nonce').val(),
            'name': $form.find('#name-field').val(),
            'email': $form.find('#email-field').val(),
            'message': $form.find('#message-field').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok')
                $form.find('#result-message').html(resp.message).show();

            $submit.removeAttr('disabled');
        });
    });
	
	//task save edit
	var $form = $('#task-action');
	$('#task-publish, #task-draft, #task-delete ').click(function(e){
        $('.task-submit').removeClass('e-clicked');
		$(this).addClass('e-clicked');
	});
   
	$form.submit(function(e){
        e.preventDefault();

        var $form = $(this),
			$submit_used = $form.find('.e-clicked'),
            tags_list = $form.find('#task-tags').val(),
            nko_tags_list = $form.find('#task-nko-tags').val(),
            form_is_valid = true,
            val = '';      

        $form.find('.validation-message').html('').hide();
		
		//check title
        val = $form.find('#task-title').val();
		
        if( !val.length ) {
            form_is_valid = false;
            $form.find('#task-title-vm').html(frontend.task_title_is_required).show();
        } else
            $form.find('#task-title-vm').html('').hide();

        if($submit_used.attr('name') == 'task-publish') { //other fields - for publish

            val = $form.find('#task-descr').val();
            if( !val.length ) {
                form_is_valid = false;
                $form.find('#task-descr-vm').html(frontend.task_descr_is_required).show();
            } else
                $form.find('#task-descr-vm').html('').hide();
        
            val = $form.find('#about-author-org').val();
            if( !val.length ) {
                form_is_valid = false;
                $form.find('#about-author-org-vm').html(frontend.about_author_org_is_required).show();
            } else
                $form.find('#about-author-org-vm').html('').hide();

            val = tags_list;
            if( !val || !val.length ) {
                form_is_valid = false;
                $form.find('#task-tags-vm').html(frontend.some_tags_are_required).show();
            } else
                $form.find('#task-tags-vm').html('').hide();

            val = $form.find('#reward').val();
            if( !val ) {
                form_is_valid = false;
                $form.find('#reward-vm').html(frontend.reward_is_required).show();
            } else
                $form.find('#reward-vm').html('').hide();
        }

        if( !form_is_valid )
            return;

		$submit_used.removeClass('e-clicked');

        $form.find('.task-submit').attr('disabled', 'disabled');

        if(tags_list)
            tags_list = tags_list.join(',');
	    
        if(nko_tags_list)
            nko_tags_list = nko_tags_list.join(',');

        //consultation
		var is_tst_consult_needed = 0;
		if($form.find('#is_tst_consult_needed').prop('checked')) {
			is_tst_consult_needed = 1;
		}

        $.post(frontend.ajaxurl, {
            'action'               : 'add-edit-task',
            'status'               : $submit_used.attr('name') == 'task-publish' ?
                $form.find('#status').val() : ($submit_used.attr('name') == 'task-draft' ? 'draft' : 'trash'),
            'id'                   : $form.find('#task_id').val(),
            'title'                : $form.find('#task-title').val(),
            'descr'                : $form.find('#task-descr').val(),
			'is_tst_consult_needed': is_tst_consult_needed,                        
            'about_author_org'     : $form.find('#about-author-org').val(),            
            'reward'               : $form.find('#reward').val(),
            'tags'                 : tags_list,
            'nko_tags'             : nko_tags_list
			
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'deleted') {
                window.location.href = frontend.site_url+'member-actions/member-tasks/?t=1';
            } else if(resp.status == 'saved') { // resp.status == 'saved'
                window.location.href = frontend.site_url+'task-actions/?task='+resp.id+'&t=2';
            } else if(resp.status == 'ok') {
                window.location.href = frontend.site_url+'task-actions/?task='+resp.id+'&t=1';
            }
        });
    });

    
    

    $('#author-publish').click(function(e){
        e.preventDefault();

        var $form = $('#task-publish'),
            $button = $(this);

        $button.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'publish-task',
            'task-id': $form.find('#task-id').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
                window.location.href = resp.permalink+'?t=1';
            } else {
                $button.removeAttr('disabled');
                $form.find('#task-message').html(resp.message);
            }

        });
    });

    $('#author-unpublish').click(function(e){
        e.preventDefault();

        var $form = $('#task-unpublish'),
            $button = $(this);

        $button.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'unpublish-task',
            'task-id': $form.find('#task-id').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
                window.location.href = window.location.href.indexOf('?') > 0 ?
                    window.location.href+'&t=2' : window.location.href+'?t=2';
            } else {
                $button.removeAttr('disabled');
                $form.find('#task-message').html(resp.message);
            }

        });
    });

    $('#task-send-to-work').click(function(e){
        e.preventDefault();

        var $button = $(this),
            $form = $('#task-send-to-work-form');

        $button.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'task-in-work',
            'task-id': $form.find('#task-id').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
                window.location.href = window.location.href.indexOf('?') > 0 ?
                    window.location.href+'&t=3' : window.location.href+'?t=3';
            } else {
                $button.removeAttr('disabled');
                $form.find('#task-message').html(resp.message);
            }

        });
    });

    $('#author-close').click(function(e){
        e.preventDefault();

        var $form = $('#task-close'),
            $button = $(this);

        $button.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'close-task',
            'task-id': $form.find('#task-id').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
                window.location.href = window.location.href.indexOf('?') > 0 ?
                    window.location.href+'&t=4' : window.location.href+'?t=4';
            } else {
                $button.removeAttr('disabled');
                $form.find('#task-message').html(resp.message);
            }

        });
    });
	
	//approve / dissaprove candidates
	$('input[id*="is_approved"]').on('change', function(e){
			
		var $this = $(this),
			$checked = $this.prop('checked'),
			action = ($checked) ? 'approve-candidate' : 'refuse-candidate',
			msgCode = ($checked) ? 't=5' : 't=6';		
				
		$('#task-action-message').html('').hide();
		
		$.ajax(frontend.ajaxurl, {
			type : 'POST',
			data : {
				'action' : action,
				'link-id': $this.attr('data-link-id'),
				'task-id': $this.attr('data-task-id'),
				'doer-id': $this.attr('data-doer-id'),
				'nonce': $this.attr('data-nonce')
			},
			beforeSend : function() {
				$this.parents('.approvable').addClass('loading');
			},
			success : function(resp) {
				resp = jQuery.parseJSON(resp);				
				if(resp.status == 'ok') {
					window.location.href = window.location.href.indexOf('?') > 0 ?
						window.location.href+'&'+msgCode: window.location.href+ '?'+msgCode;
				} else {
					$('#task-action-message').html(resp.message).slideDown(200);
					$this.parents('.approvable').removeClass('loading');
					$this.prop('checked', !$checked);
				}
			}
		});
		
	});

    
    // doers review (is doer's work good or bad etc...)
    $('.leave-review').click(function(e){
        e.preventDefault();

        $(this).hide();
        $('#task-leave-review-form').slideDown(200);
        $('#task-leave-review-form').find('#doer-id').val($(this).data('doer-id'));
    });

    $('#cancel-leave-review').click(function(e){
        $('.leave-review').show();
        $('#task-leave-review-form').slideUp(200);
    });
    
    $('#task-leave-review-form').submit(function(e){
        e.preventDefault();

        var $form = $(this),
            $buttons = $form.find('input[type="submit"][type="reset"]');
        
        if(!validate_review_form($form)) {
        	return;
        }

        $buttons.attr('disabled', 'disabled');
        $('#add_review_loading').show();

        $.post(frontend.ajaxurl, {
            'action': 'leave-review',
            'review-rating': $form.find('#review-rating').val(),
            'task-id': $form.find('#task-id').val(),
            'doer-id': $form.find('#doer-id').val(),
            'review-message': $form.find('#review-message').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
            	$('#add_review_loading').hide();
                $('#task-leave-review-form').remove();
                $('#task-review-message-ok-message').html(resp.message);
                $('#task-review-message-ok-message').show();
                itv_show_all_xp_alerts();
            } else {
            	$('#add_review_loading').hide();            	
                $buttons.removeAttr('disabled');
                $form.find('#task-review-message').html(resp.message);
            }

        });
    });

    // authors review (is author is good or bad)
    $('.leave-review-author').click(function(e){
        e.preventDefault();

        $(this).hide();
        $('#task-leave-review-author-form').slideDown(200);
        $('#task-leave-review-leave-review-authorform').find('#author-id').val($(this).data('author-id'));
    });

    $('#cancel-leave-review-author').click(function(e){
        $('.leave-review-author').show();
        $('#task-leave-review-author-form').slideUp(200);
    });
    
    $('#task-leave-review-author-form').submit(function(e){
        e.preventDefault();

        var $form = $(this),
            $buttons = $form.find('input[type="submit"][type="reset"]');
        
        if(!validate_review_form($form)) {
        	return;
        }

        $buttons.attr('disabled', 'disabled');
        $('#add_review_author_loading').show();

        $.post(frontend.ajaxurl, {
            'action': 'leave-review-author',
            'review-rating': $form.find('#review-author-rating').val(),
            'task-id': $form.find('#task-id').val(),
            'author-id': $form.find('#author-id').val(),
            'review-message': $form.find('#review-author-message').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
            	$('#add_review_author_loading').hide();
                $('#task-leave-review-author-form').remove();
                $('#task-review-author-message-ok-message').html(resp.message);
                $('#task-review-author-message-ok-message').show();
                itv_show_all_xp_alerts();
            } else {
            	$('#add_review_author_loading').hide();            	
                $buttons.removeAttr('disabled');
                $form.find('#task-review-author-message').html(resp.message);
            }

        });
    });

    // offer help
    $('#task-offer-help').click(function(e){
        e.preventDefault();
        
        if($(this).attr('disabled') == 'disabled') {
            return false;
        }

        $(this).slideUp(200);
        $('#task-status').slideUp(200);
        $('#task-offer-help-form').slideDown(200);
    });

    $('#cancel-sending-message').click(function(e){
        $('#task-offer-help').slideDown(200);
        $('#task-status').slideDown(200);
        $('#task-offer-help-form').slideUp(200);
    });

    $('#task-offer-help-form').submit(function(e){
        e.preventDefault();
        
        var $form = $(this),
            $buttons = $form.find('input[type="submit"][type="reset"]');

        $buttons.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'add-candidate',
            'task-id': $form.find('#task-id').val(),
            'candidate-message': $form.find('#candidate-message').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') { 
                window.location.href = window.location.href.indexOf('?') > 0 ?
                    window.location.href+'&t=7' : window.location.href+'?t=7';
            } else {
                $buttons.removeAttr('disabled');
                $form.find('#task-message').html(resp.message);
            }

        });
    });

    $('#task-remove-offer').click(function(e){
        e.preventDefault();
        
        if($(this).attr('disabled') == 'disabled') {
            return false;
        }

        $(this).slideUp(200);
        $('#task-status').slideUp(200);
        $('#task-remove-offer-form').slideDown(200);
    });

    $form = $('#task-remove-offer-form');
    $form.find('#cancel-sending-message').click(function(e){
        $('#task-remove-offer').slideDown(200);
        $('#task-status').slideDown(200);
        $('#task-remove-offer-form').slideUp(200);
    });

    $form.submit(function(e){
        e.preventDefault();

        var $form = $(this),
            $buttons = $form.find('input[type="submit"][type="reset"]');

        $buttons.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'remove-candidate',
            'task-id': $form.find('#task-id').val(),
            'candidate-message': $form.find('#candidate-message').val(),
            'nonce': $form.find('#nonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
                window.location.href = window.location.href.indexOf('?') > 0 ?
                    window.location.href+'&t=8' : window.location.href+'?t=8';
            } else {
                $buttons.removeAttr('disabled');
                $form.find('#task-message').html(resp.message);
            }

        });
    });
	
	/** Registration & Login **/
	$('#user_login').focus();
	
    $('#login-form').submit(function(e){
        e.preventDefault();

        var $form = $(this),
            $button = $form.find('#do-login');

        $button.attr('disabled', 'disabled');

        $.post(frontend.ajaxurl, {
            'action': 'login',
            'login': $form.find('#user_login').val(),
            'pass': $form.find('#user_pass').val(),
            'remember': $form.find('#rememberme').attr('checked') ? 1 : 0,
            'nonce': $form.find('#_wpnonce').val()
        }, function(resp){

            resp = jQuery.parseJSON(resp);

            if(resp.status == 'ok') {
                window.location.href = $form.find('#redirect_to').val();
            } else {
                $button.removeAttr('disabled');
                $form.find('#login-message').html(resp.message).show();
            }

        });
    });

    $('#user-reg').submit(function(e){
        e.preventDefault();

        var $form = $(this),
            $submit = $form.find('#do-register'),
            form_is_valid = true,
            val = '';

        // Validation:
        val = $form.find('#email').val();
        if( !val.length ) {
            form_is_valid = false;
            $form.find('#user_email_vm').html(frontend.user_email_empty).show();
        } else if( !email_is_valid(val) ) {
            form_is_valid = false;
            $form.find('#user_email_vm').html(frontend.user_email_incorrect).show();
        } else
            $form.find('#user_email_vm').html('').hide();

        val = $form.find('#pass1').val();
		if( !val.length ) {
			form_is_valid = false;
			$form.find('#user_pass_vm').html(frontend.user_pass_empty).show();
		}
		else {
		    $form.find('#user_pass_vm').html('').hide();
		}
        
        val = $form.find('#first_name').val();
        if(val.length < 3) {
            form_is_valid = false;
            $form.find('#first_name_vm').html(frontend.first_name_too_short).show();
        } else
            $form.find('#first_name_vm').html('').hide();

        val = $form.find('#last_name').val();
        if(val.length < 3) {
            form_is_valid = false;
            $form.find('#last_name_vm').html(frontend.last_name_too_short).show();
        } else
            $form.find('#last_name_vm').html('').hide();
        
        var $agree_checkbox = $form.find('#agree_personal_data');
        if(!$agree_checkbox.prop('checked')) {
            form_is_valid = false;
            $form.find('#agree_personal_data_vm').html(frontend.check_agree_data_process_checkbox).show();
        } else {
            $form.find('#agree_personal_data_vm').html('').hide();
        }
        

        if(form_is_valid) {
//            $submit.attr('disabled', 'disabled');
            $submit.parents('.form-group').hide();
            $('#register-form-message').html('').hide();

            $.post(frontend.ajaxurl, {
                'action': 'user-register',
                'login': $form.find('#user_login').val(),
                'email': $form.find('#email').val(),
                'pass': $form.find('#pass1').val(),
                'first_name': $form.find('#first_name').val(),
                'last_name': $form.find('#last_name').val(),
                'nonce': $form.find('#_wpnonce').val()
            }, function(resp){

                resp = jQuery.parseJSON(resp);

                if(resp.status == 'ok') {
                	$form.find('.panel-body #reg-form-fields').hide();
                }
                else {
                    $submit.parents('.form-group').show();
                }

                $('#register-form-message').html(resp.message).show();
            });
        }
    });
	
	
	

    $('#delete_profile').click(function(e){
        e.preventDefault();

        if(confirm(frontend.profile_delete_confirm)) {
            var $this = $(this),
                $actions = $this.parents('.form-group');

            $actions.hide();
            $.post(frontend.ajaxurl, {
                'action': 'delete-profile',
                'id': $('#member_id').val(),
                'nonce': $('#_wpnonce').val()
            }, function(resp){

                resp = $.parseJSON(resp);
                if(resp.status == 'ok') {
                    window.location.href = frontend.site_url+'?t=1';
                } else {
                    $('#form_message').html(resp.message).show();
                    $actions.show();
                }
            });

        }
    });
	
	//edit user profile
	
    $('#member_action').submit(function(e){
        e.preventDefault();

        var $form = $(this),
            $submit = $form.find('#do_member_action'),
            form_is_valid = true,
            val = '';

        // Validation:
        val = $form.find('#email').val();
        if( !val.length ) {
            form_is_valid = false;
            $form.find('#user_email_vm').html(frontend.user_email_empty).show();
        } else if( !email_is_valid(val) ) {
            form_is_valid = false;
            $form.find('#user_email_vm').html(frontend.user_email_incorrect).show();
        } else
            $form.find('#user_email_vm').html('').hide();

        val = $form.find('#pass1').val();
        if(val != $form.find('#pass2').val()) {
            form_is_valid = false;
            $form.find('#user_pass_vm').html(frontend.passes_are_inequal).show();
        } else
            $form.find('#user_pass_vm').html('').hide();

        val = $form.find('#first_name').val();
        if(val.length < 3) {
            form_is_valid = false;
            $form.find('#first_name_vm').html(frontend.first_name_too_short).show();
        } else
            $form.find('#first_name_vm').html('').hide();

        val = $form.find('#last_name').val();
        if(val.length < 3) {
            form_is_valid = false;
            $form.find('#last_name_vm').html(frontend.last_name_too_short).show();
        } else
            $form.find('#last_name_vm').html('').hide();

        if(form_is_valid) {
            $submit.parents('.form-group').hide(); //.attr('disabled', 'disabled');
			
            $user_skills = [];
            $('.skills_list').find('.user_skill:checked').each(function(){
                $user_skills.push($(this).val());
            });

            var params = {
                'action': 'update-member-profile',
                'nonce': $form.find('#_wpnonce').val(),
                'id': $form.find('#member_id').val(),
                'email': $form.find('#email').val(),
                'pass': $form.find('#pass1').val(),
                'first_name': $form.find('#first_name').val(),
                'last_name': $form.find('#last_name').val(),
                'city': $form.find('#user_city').val(),
                'spec': $form.find('#user_speciality').val(),
                'bio': $form.find('#user_bio').val(),
                'pro': $form.find('#user_professional').val(),
                'user_skills': $user_skills,
                'user_workplace': $form.find('#user_workplace').val(),
				'user_workplace_desc': $form.find('#user_workplace_desc').val()
            };
            $('.user_contacts').each(function(index){
                var $this = $(this);
                params[$this.attr('id')] = $this.val();
            });
            $.post(frontend.ajaxurl, params, function(resp){
            
                resp = jQuery.parseJSON(resp);
                $submit.parents('.form-group').show();//.removeAttr('disabled');
                $('#form_message').html(resp.message);
                
                itv_show_all_xp_alerts();
            });
        }
    });
	
	/* tooltip */
	$('.role-desc').tooltip();

    $('#task-tabs').find('.nav-tabs').find('a').click(function(e){
        e.preventDefault();
        $(this).tab('show');
    });
	
	
	/*  reveal comment */
	var hash = location.hash.replace('#', '');
	if (hash.indexOf("comment") !=-1) {
		//alert(hash);
		var TTabs = $('.task-details').find('.grey-tabs'),
			TPanels = $('.tab-content');
		
		TTabs.find('li').removeClass('active');
		TTabs.find('a[href="#t-comments"]').parents('li').addClass('active');
		TPanels.find('#t-details').removeClass('active').addClass('fade');
		TPanels.find('#t-comments').addClass('active').removeClass('fade');
		
		try {
            var STarget = $('.task-details').find('#'+hash).offset().top - 90;  
            //$('html, body').animate({scrollTop:STarget}, 300);
            $('html, body').scrollTop(STarget);
		}
		catch(ex) {
		}
	}
	
	
    

    $('#tasks-filters-trigger').click(function(e){
        e.preventDefault();

        $('#tasks-filters').toggle();
    });
	
    $('#members-filters-trigger').click(function(e){
        e.preventDefault();

        $('#members-filters').toggle();
    });

	// company logo
    $("#upload_user_company_logo").ajaxUpload({
		url: frontend.ajaxurl,
		name: "user_company_logo",
		data: {
			action: 'upload-user-company-logo'
		},
		onSubmit: function() {
			$('#upload_user_company_logo_info').hide();
			$('#upload_user_company_logo_loading').show();
			return true;
		},
		onComplete: function(result) {
			var json;
			try {
				json = jQuery.parseJSON( result );
			} catch(ex) {}
			$('#upload_user_company_logo_loading').hide();
			
			if(json && json.status == 'ok' && json.image) {
				var image = json.image;
				image = '<' + image + '>';
				$('#upload_user_company_logo_info').html(image);
				$('#upload_user_company_logo_info').show();
				$('#delete_user_company_logo').show();
			}
			else {
				alert(frontend.user_company_logo_upload_error);
				$('#upload_user_company_logo_info').empty();
			}
		}
	});
	
	$('#delete_user_company_logo').click(function(){
		$('#upload_user_company_logo_loading').show();
		$('#upload_user_company_logo_info').hide();
		
		$.getJSON(frontend.ajaxurl, {action: 'delete-user-company-logo'})
			.done(function(){
				$('#upload_user_company_logo_info').empty();
				$('#delete_user_company_logo').hide();
			})
			.fail(function(){
				$('#upload_user_company_logo_info').show();
				alert(frontend.user_company_logo_delete_error);
			})
			.always(function(){
				$('#upload_user_company_logo_loading').hide();
			});
	});

	// user logo
    $("#upload_user_avatar").ajaxUpload({
		url: frontend.ajaxurl,
		name: "user_avatar",
		data: {
			action: 'upload-user-avatar'
		},
		onSubmit: function() {
			$('#upload_user_avatar_info').hide();
			$('#upload_user_avatar_loading').show();
			return true;
		},
		onComplete: function(result) {
			var json;
			try {
				json = jQuery.parseJSON( result );
			} catch(ex) {}
			$('#upload_user_avatar_loading').hide();
			
			if(json && json.status == 'ok' && json.image) {
				var image = json.image;
				image = '<' + image + '>';
				$('#upload_user_avatar_info').html(image);
				$('#upload_user_avatar_info').show();
				$('#delete_user_avatar').show();
			}
			else {
				alert(frontend.user_company_logo_upload_error);
				$('#upload_user_avatar_info').empty();
			}
		}
	});
	
	$('#delete_user_avatar').click(function(){
		$('#upload_user_avatar_loading').show();
		$('#upload_user_avatar_info').hide();
		
		$.getJSON(frontend.ajaxurl, {action: 'delete-user-avatar'})
			.done(function(){
				$('#upload_user_avatar_info').empty();
				$('#delete_user_avatar').hide();
			})
			.fail(function(){
				$('#upload_user_avatar_info').show();
				alert(frontend.user_avatar_delete_error);
			})
			.always(function(){
				$('#upload_user_avatar_loading').hide();
			});
	});
	
	function email_is_valid(value) {
        return value.match(/(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*:(?:(?:\r\n)?[ \t])*(?:(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*)(?:,\s*(?:(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*|(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)*\<(?:(?:\r\n)?[ \t])*(?:@(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*(?:,@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*)*:(?:(?:\r\n)?[ \t])*)?(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|"(?:[^\"\r\\]|\\.|(?:(?:\r\n)?[ \t]))*"(?:(?:\r\n)?[ \t])*))*@(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*)(?:\.(?:(?:\r\n)?[ \t])*(?:[^()<>@,;:\\".\[\] \000-\031]+(?:(?:(?:\r\n)?[ \t])+|\Z|(?=[\["()<>@,;:\\".\[\]]))|\[([^\[\]\r\\]|\\.)*\](?:(?:\r\n)?[ \t])*))*\>(?:(?:\r\n)?[ \t])*))*)?;\s*)/);
    }
});


//GA Events
jQuery(function($){
	if(typeof ga == 'function') {		
		$('.ga-event-trigger').on('click', function(e){
		//e.preventDefault();
			var trigger = $(this),
				triggerId = trigger.attr('data-ga_event');
			
			//to_do check for the correct value
			//debug
			if (ga_events[triggerId]) {
				console.log(ga_events[triggerId].ga_category);
				console.log(ga_events[triggerId].ga_action);
				console.log(ga_events[triggerId].ga_label);
			
				ga('send', 'event', ga_events[triggerId].ga_category, ga_events[triggerId].ga_action, ga_events[triggerId].ga_label, 1);	
			}
			
		});		
	}	
});

// customize comments subscriptions
jQuery(function($){
	$('#subscribe-reloaded').prop('checked', 'checked');
});

// review rating
jQuery(function($){
	// doer review
	var $form = $('#task-leave-review-form');
	$('.review-rating-container').rating(function(vote, event){
		$form.find('#review-rating').val(vote);
	});	
	var current_rating = $form.find('#review-rating').val();
	if(current_rating) {
		$form.find('.stars').find('a[title='+current_rating+']').click();
	}
	
	// author review
	var $form_author = $('#task-leave-review-author-form');
	$('.review-author-rating-container').rating(function(vote, event){
		$form_author.find('#review-author-rating').val(vote);
	});	
	var current_rating_author = $form_author.find('#review-author-rating').val();
	if(current_rating_author) {
		$form_author.find('.stars').find('a[title='+current_rating_author+']').click();
	}

	// read only review
	$('.review-rating-container-readonly').rating();
	$('.review-rating-container-readonly').find('.stars a').unbind('click').unbind('mouseenter').unbind('mouseleave').unbind('mouseout').unbind('mouseover');
	
	itv_init_revew_forms_highlight($);
});

function itv_init_revew_forms_highlight($) {
    var ITV_HIGHLIGHT_REVIEW_FORM_TIMEOUT = null;
    
    // auto show review forms
    var hash = window.location.hash;
    if(hash == '#leave_review_for_doer') {
        $('.leave-review').click();
        var $review_form = $('#review-message');
        $('#task-leave-review-form input, #task-leave-review-form a').click(function() {
            itv_stop_highlight_review_form($review_form);
        });
        $review_form.click(function(){
            itv_stop_highlight_review_form($review_form);
        });
        itv_highlight_review_form($review_form);
        $('#review-exist-alert').show();
    }
    else if(hash == '#leave_review_for_author') {
        $('.leave-review-author').click();
        var $review_form = $('#review-author-message');
        $('#task-leave-review-author-form input, #task-leave-review-author-form a').click(function() {
            itv_stop_highlight_review_form($review_form);
        });
        $review_form.click(function(){
            itv_stop_highlight_review_form($review_form);
        });
        itv_highlight_review_form($review_form);
        $('#author-review-exist-alert').show();
    }
    
    function itv_stop_highlight_review_form($review_form) {
        $review_form.data('stop-highlight', true);
        clearTimeout(ITV_HIGHLIGHT_REVIEW_FORM_TIMEOUT);
        $review_form.removeClass('leave-review-highlight');
    }

    function itv_highlight_review_form($review_form) {
        if($review_form.data('stop-highlight')) {
            return;
        }
        ITV_HIGHLIGHT_REVIEW_FORM_TIMEOUT = setTimeout(function(){
            $review_form.addClass('leave-review-highlight');
            ITV_HIGHLIGHT_REVIEW_FORM_TIMEOUT = setTimeout(function(){
                $review_form.removeClass('leave-review-highlight');
                itv_highlight_review_form($review_form);
            }, 1000);
        }, 1000);
    }
}

function validate_review_form($form) {
	var ret = true;
	
	var review_text = $form.find('textarea.review-message').val();
	if(!jQuery.trim(review_text)) {
		$form.find('.review-text-validation-message').show();
		ret = false;
	}
	else {
		$form.find('.review-text-validation-message').hide();
	}
	
	var review_rating = $form.find('input.review-rating').val();
	if(!review_rating) {
		$form.find('.review-rating-validation-message').show();
		ret = false;
	}
	else {
		$form.find('.review-rating-validation-message').hide();
	}
	
	return ret;
}

//customize comments subscriptions
jQuery(function($){
    $('#itv_agree_process_data_label').readmore({
        collapsedHeight: 30, 
        moreLink: '<a href="#" class="itv-reg-more-link">...</a>',
        lessLink: '',
        afterToggle: function(trigger, element, expanded) {
            if(expanded) {
                $(element).readmore('destroy');
            }
        }
    });
    
    $('#itv_agree_process_data_label').click(function(){
        $(this).readmore('destroy');
        return true;
    });
});

// user xp rating alert
var ITV_USER_XP_ACTIONS = jQuery.parseJSON(frontend.xp_actions);

function itv_show_user_xp_alert(action, index) {
    var message = ITV_USER_XP_ACTIONS[action];
    itv_show_user_alert_message(message, index);
}

function itv_show_user_alert_message(message, index) {
    var $ = jQuery;
    
    var $new_xp_alert = $('#itv-xp-alert').clone();
    var $new_xp_alert_text = $new_xp_alert.find('.itv-xp-alert-text');
    $new_xp_alert.addClass('itv-xp-alert-item');
    $new_xp_alert_text.html(message);
    
    $('#page').append($new_xp_alert);
    $new_xp_alert.show();
    
    if(typeof ga == 'function') {
        ga('send', 'event', 'itv-user-xp-alert', 'показана всплывашка');
    }
    
    var top_offset = 58;
    var $adminbar = $('#wpadminbar');
    if($adminbar.length) {
        top_offset += $adminbar.height();
    }
    
    if(!index) {
        index = 0;
    }
    
    $new_xp_alert.animate({
        'top': '' + (top_offset + index * 55) + 'px'
    }, 800, 'linear', function(){
        setTimeout(function(){
            itv_hide_xp_alert_list();
        }, 5000);
    });
}

function itv_hide_xp_alert_list() {
    var $ = jQuery;
    
    $('.itv-xp-alert-item').first().fadeOut( "slow", function() {
        $(this).remove();
    });
}

function itv_get_xp_alerts_list() {
    return Cookies.getJSON(frontend.xp_cookie_name);
}

function itv_show_all_xp_alerts() {
    var xp_alert_list = itv_get_xp_alerts_list();
    if(xp_alert_list && xp_alert_list.length) {
        for(var i in xp_alert_list) {
            var xp_alert = xp_alert_list[i];
            itv_show_user_xp_alert(xp_alert['action'], i);
        }
        Cookies.remove(frontend.xp_cookie_name);
    }
}

function itv_thank_you($button) {
    var $ = jQuery;
    
    var $loader = $button.parent().find('.thankyou-loader');
    var $done_label = $button.parent().find('.itv-thankyou-done');
    
    $button.hide();
    $loader.show();
    
    if($button.data('from_uid') == '0') {
        if(typeof ga == 'function') {
            ga('send', 'event', 'itv-thank-you-anonymous', 'аноним хотел сказать спасибо');
        }
        
        window.location.href = frontend.site_url + 'registration/';
        return false;
    }
    else {
        if(typeof ga == 'function') {
            ga('send', 'event', 'itv-thank-you', 'сказал спасибо');
        }
    }
    
    $.post(frontend.ajaxurl, {
        action: 'thankyou',
        'to-uid': $button.data('to_uid'),
        'nonce': $button.parent().find('#_wpnonce').val()
    }, null, 'json')
    .done(function(json){

        if(json.status == 'ok') {
            $loader.hide();
            $done_label.show();
            itv_show_user_alert_message(frontend.you_said_thankyou);
        }
        else if(json.status == 'fail') {
            $loader.hide();
            alert(json.message);
        }
        else {
            alert(frontend.error);
            $loader.hide();
            $button.show();
        }
    })
    .fail(function(){
        alert(frontend.error);
        $loader.hide();
        $button.show();
    })
}

jQuery(function($){
    itv_show_all_xp_alerts();
    
    $('.itv-thankyou-btn').click(function(){
        itv_thank_you($(this));
        return false;
    });
});

jQuery(function($){
    $('.itv-search-nav').click(function(){
        $('.submenu-search').toggle();
    });
});

// contact us using formidable
jQuery(function($){
    var $contact_us_frm = $('#form_contact-us');
    if( $contact_us_frm.length ) {
        $contact_us_frm.find('.itv-contact-us-field-name input').val( frontend.user_full_name );
        $contact_us_frm.find('.itv-contact-us-field-email input').val( frontend.user_email );
    }
});

// youtube api init
var tst_youtube_player;
var tst_video_ready_to_play = false;

var tag = document.createElement('script');
tag.src = "//www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onPlayerReady(event) {
    tst_video_ready_to_play = true;
}

function onYouTubePlayerAPIReady() {
    tst_youtube_player = new YT.Player('tst-about-video-iframe', {
        events: {
            'onReady': onPlayerReady
        }
    });
}
