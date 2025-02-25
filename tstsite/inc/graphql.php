<?php

require_once dirname(__FILE__) . '/../vendor/autoload.php';
require_once(dirname(__FILE__) . '/../inc/models/TimelineModel.php');

use \WPGraphQL\AppContext;
use \WPGraphQL\Data\DataSource;
use \ITV\models\TimelineModel;
use \ITV\models\CommentsLikeModel;

add_filter('graphql_app_context_config', 'itv_graphql_app_context_config');
function itv_graphql_app_context_config($config) {
    return $config;
}

add_filter('graphql_data_loaders', 'itv_graphql_data_loaders', 10, 2);
function itv_graphql_data_loaders($loaders, $context) {
    return $loaders;
}

// tasks
add_action( 'graphql_register_types', 'itv_register_task_graphql_fields' );
function itv_register_task_graphql_fields() {
    register_graphql_fields(
        'Task',
        [
            'viewsCount' => [
                'type'        => 'Int',
                'description' => __( 'Task views count', 'tst' ),
                'resolve'     => function( $task ) {
                    return pvc_get_post_views($task->ID);
                },
            ],
            'doerCandidatesCount' => [
                'type'        => 'Int',
                'description' => __( 'Task doer candidates count', 'tst' ),
                'resolve'     => function( $task ) {
                    return tst_get_task_doers_count($task->ID);
                },
            ],
            'approvedDoer' => [
                'type'        => 'User',
                'description' => __( 'Task doer candidates count', 'tst' ),
                'resolve'     => function( $task, $args, $context ) {
	               $task_doers = tst_get_task_doers($task->ID, true);
	               return count($task_doers) ? \WPGraphQL\Data\DataSource::resolve_user( $task_doers[0]->ID, $context ) : null;
                },
            ],
            'reviewsDone' => [
                'type'        => 'Bool',
                'description' => __( 'Author and doer left reviews', 'tst' ),
                'resolve'     => function( $task, $args, $context ) {
                    $task_doers = tst_get_task_doers($task->ID, true);
                    $reviewForAuthor = ItvReviewsAuthor::instance()->get_review_for_author_and_task($task->post_author, $task->ID);
                    $reviewForDoer = count($task_doers) > 0 ? ItvReviews::instance()->get_review_for_doer_and_task($task_doers[0]->ID, $task->ID) : null;
                    return !!$reviewForAuthor && !!$reviewForDoer;
                },
            ],
            'nextTaskSlug' => [
                'type'        => 'String',
                'description' => __( 'Next task slug', 'tst' ),
                'resolve'     => function( $task, $args, $context ) {
                    $tasks_query = new WP_Query(array(
                    	'post_type'      => 'tasks',
                    	'post_status'    => array('publish'),
                    	'posts_per_page' => 1,
                    	'author__not_in' => array(ACCOUNT_DELETED_ID),
                        'post__not_in' => array($task->ID),
                        'date_query' => array(
                            array(
                                'before'     => $task->date,
                            ),
                        ),
                    ));
                    
                    $posts = $tasks_query->get_posts();
                    $nextPost = !empty($posts) ? $posts[0] : null;
                    
                    return $nextPost ? $nextPost->post_name : "";
                },
            ],
            'isApproved' => [
                'type'        => 'Bool',
                'description' => __( 'Is approved by admin', 'tst' ),
                'resolve'     => function( $task, $args, $context ) {
                    return boolval(get_post_meta($task->ID, 'itv-approved', true));
                },
            ],
            'pemalinkPath' => [
                'type'        => 'String',
                'resolve'     => function( $task, $args, $context ) {
                    return str_replace(site_url(), "", get_permalink($task->ID));
                },
            ],
            'nonceContactForm' => [
                'type'        => 'String',
                'description' => __( 'Contact form nonce', 'tst' ),
                'resolve'     => function( $task, $args, $context ) {
                    return wp_create_nonce('we-are-receiving-a-letter-goshujin-sama');
                },
            ],
            'hasCloseSuggestion' => [
                'type'        => 'String',
                'resolve'     => function( $task, $args, $context ) {
                    return false;
                },
            ],
        ]
    );
}

add_filter('graphql_data_is_private', "itv_graphql_task_private_filter", 10, 6);
function itv_graphql_task_private_filter($is_private, $model_name, $data, $visibility, $owner, $current_user) {
    if($model_name !== 'PostObject'
        || $data->post_type != 'tasks'
        || $is_private === false
    ) {
        return $is_private;
    }
    
    return !(in_array($data->post_status, ['in_work', 'closed', 'archived']) || current_user_can("manage_options"));
}

// users
add_action( 'graphql_register_types', 'itv_register_user_graphql_fields' );
function itv_register_user_graphql_fields() {
    register_graphql_fields(
        'User',
        [
            'profileURL' => [
                'type' => 'String',
                'description' => __( 'User profile URL', 'tst' ),
                'resolve' => function ($user) {
                    return tst_get_member_url( $user->userId );
                }
            ],
            'fullName' => [
                'type' => 'String',
                'description' => __( 'User profile URL', 'tst' ),
                'resolve' => function ($user) {
                    return tst_get_member_name( $user->userId );
                }
            ],
            'itvAvatar' => [
                'type' => 'String',
                'description' => __( 'User profile URL', 'tst' ),
                'resolve' => function ($user) {
                    return itv_avatar_url( $user->userId );
                }
            ],
            'memberRole' => [
                'type' => 'String',
                'description' => __( 'User role (hero, volunteer, donee or activist)', 'tst' ),
                'resolve' => function ($user) {
                    return tst_get_member_role_name( $user->userId );
                }
            ],
            'solvedTasksCount' => [
                'type' => 'Int',
                'description' => __( 'Number of tasks user solved as DOER', 'tst' ),
                'resolve' => function ($user) {
                    $key = 'solved';
                    $activity = tst_get_member_activity( $user->userId, $key );
                    return $activity[$key];
                }
            ],
            'authorReviewsCount' => [
                'type' => 'Int',
                'description' => __( 'User author reviews count', 'tst' ),
                'resolve' => function ($user) {
                    return ItvReviewsAuthor::instance()->count_author_reviews( $user->userId );
                }
            ],
            'doerReviewsCount' => [
                'type' => 'Int',
                'description' => __( 'User doer reviews count', 'tst' ),
                'resolve' => function ($user) {
                    return ItvReviews::instance()->count_doer_reviews( $user->userId );
                }
            ],
            'organizationName' => [
                'type' => 'String',
                'description' => __( 'User organization', 'tst' ),
                'resolve' => function ($user) {
                    return tst_get_member_field( 'user_workplace', $user->userId );
                }
            ],
            'organizationDescription' => [
                'type' => 'String',
                'description' => __( 'User organization description', 'tst' ),
                'resolve' => function ($user) {
                    return tst_get_member_field( 'user_workplace_desc', $user->userId );
                }
            ],
            'organizationLogo' => [
                'type' => 'String',
                'description' => __( 'User organization logo', 'tst' ),
                'resolve' => function ($user) {
                    return tst_get_member_user_company_logo_src( $user->userId );
                }
            ],
            'isPasekaMember' => [
                'type' => 'Boolean',
                'resolve' => function ($user) {
                    return itv_is_user_paseka_member($user->userId);
                }
            ],
            'isPartner' => [
                'type' => 'Bool',
                'resolve' => function ($user) {
                    return itv_is_user_partner($user->userId);
                }
            ],
            'isAdmin' => [
                'type' => 'Bool',
                'resolve' => function ($user) {
                    return user_can($user->userId, 'manage_options');
                }
            ],
        ]
    );

}

add_filter('graphql_data_is_private', "itv_graphql_user_private_filter", 10, 6);
function itv_graphql_user_private_filter($is_private, $model_name, $data, $visibility, $owner, $current_user) {
    if($model_name !== 'UserObject'
        || $is_private === false
    ) {
        return $is_private;
    }
    
    return !!$data->deleted;
}

add_action( 'graphql_register_types', 'itv_register_doers_graphql_query' );
function itv_register_doers_graphql_query() {
    register_graphql_field(
        'RootQuery',
        'taskDoers',
        [
            'description' => __( 'Task doers', 'tst' ),
            'type' => [ 'list_of' => 'User' ],
            'args'        => [
                'taskGqlId'     => [
                    'type' => [
                        'non_null' => 'ID',
                    ],
                ],
            ],
            'resolve' => function($source, array $args, AppContext $context) {
                $post_identity = \GraphQLRelay\Relay::fromGlobalId( $args['taskGqlId'] );
                
                if(empty($post_identity['id'])) {
                    error_log("invalid task id in taskDoers: " . print_r($args, true));
                    return [];
                }
                
                $task_post_id = $post_identity['id'];
                
                $doers = tst_get_task_doers($task_post_id, false);
                $users = [];
                foreach($doers as $doer) {
                    $users[] = \WPGraphQL\Data\DataSource::resolve_user( $doer->ID, $context );
                }
                return $users;
            },
        ]
    );
}

add_action( 'graphql_register_types', 'itv_register_comment_author_graphql_fields' );
function itv_register_comment_author_graphql_fields() {
    register_graphql_fields(
        'commentAuthor',
        [
            'itvAvatar' => [
                'type'        => 'String',
                'description' => __( 'ITV avatar', 'tst' ),
                'resolve'     => function( $commentAuthor ) {
                    #return get_template_directory_uri() . '/assets/img/temp-avatar.png';
                    return "https://www.gravatar.com/avatar/".md5(strtolower(trim($commentAuthor->email)))."?s=180&d=404";
                },
            ],
            'fullName' => [
                'type'        => 'String',
                'description' => __( 'Full name', 'tst' ),
                'resolve'     => function( $commentAuthor ) {
                    return $commentAuthor->name;
                },
            ],
        ]
    );
}

// comments
add_action( 'graphql_register_types', 'itv_register_comment_graphql_fields' );
function itv_register_comment_graphql_fields() {
    register_graphql_fields(
        'Comment',
        [
            'likesCount' => [
                'type'        => 'Int',
                'description' => __( 'Comment likes count', 'tst' ),
                'resolve'     => function( $comment ) {
                    $like = get_comment_meta($comment->commentId, 'itv_likes_count', true);
                    
                    if(!$like) {
                        $like = 0;
                    }
                    return $like;
                },
            ],
            'likeGiven' => [
                'type' => 'Boolean',
                'description' => __( 'Comment likes count', 'tst' ),
                'resolve'     => function( $comment ) {
	               if(is_user_logged_in()) {
                        $comments_like = ITV\models\CommentsLikeModel::instance();
                        return !!$comments_like->is_user_comment_like(get_current_user_id(), $comment->commentId);
	               }
	               else {
	                   return false;
	               }
                },
            ],
        ]
    );
}

add_filter('graphql_data_is_private', "itv_graphql_comment_private_filter", 10, 6);
function itv_graphql_comment_private_filter($is_private, $model_name, $data, $visibility, $owner, $current_user) {
    if(!in_array($model_name, ['CommentObject', 'CommentAuthorObject'])
        || $is_private === false
    ) {
        return $is_private;
    }
    
    return false;
}
