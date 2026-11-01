/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
export type CourseInfoFragment = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  aliases: Array<{ code: string }>;
  profs_teaching: Array<{
    prof: {
      id: number;
      code: string;
      name: string;
      rating: { liked: any; comment_count: any } | null;
    } | null;
  }>;
};

export type CourseTermFragment = {
  id: number;
  sections: Array<{ id: number; term_id: number }>;
};

export type CourseScheduleFragment = {
  id: number;
  sections: Array<{
    id: number;
    enrollment_capacity: number;
    enrollment_total: number;
    class_number: number;
    section_name: string;
    term_id: number;
    updated_at: any;
    meetings: Array<{
      days: Array<string>;
      start_date: any;
      end_date: any;
      start_seconds: number | null;
      end_seconds: number | null;
      location: string | null;
      is_closed: boolean;
      is_cancelled: boolean;
      is_tba: boolean;
      prof: { id: number; code: string; name: string } | null;
    }>;
    exams: Array<{
      date: any;
      day: string | null;
      end_seconds: number | null;
      is_tba: boolean;
      location: string | null;
      section_id: number;
      start_seconds: number | null;
    }>;
  }>;
};

export type CourseRequirementsFragment = {
  id: number;
  antireqs: string | null;
  prereqs: string | null;
  coreqs: string | null;
  postrequisites: Array<{
    postrequisite: { id: number; code: string; name: string } | null;
  }>;
};

export type CourseRatingFragment = {
  id: number;
  rating: {
    liked: any;
    easy: any;
    useful: any;
    filled_count: any;
    comment_count: any;
  } | null;
};

export type CourseReviewDistributionFragment = {
  id: number;
  course_useful_buckets: Array<{ value: any; count: any }>;
  course_easy_buckets: Array<{ value: any; count: any }>;
};

export type ProfInfoFragment = {
  id: number;
  name: string;
  code: string;
  aliases: Array<{ name: string }>;
};

export type ProfCoursesTaughtFragment = {
  id: number;
  prof_courses: Array<{ course: { id: number; code: string } | null }>;
};

export type ProfRatingFragment = {
  id: number;
  rating: {
    liked: any;
    clear: any;
    engaging: any;
    filled_count: any;
    comment_count: any;
  } | null;
};

export type ProfReviewDistributionFragment = {
  id: number;
  prof_engaging_buckets: Array<{ value: any; count: any }>;
  prof_clear_buckets: Array<{ value: any; count: any }>;
};

export type ReviewInfoFragment = {
  id: number;
  created_at: any;
  updated_at: any;
  public: boolean;
  liked: any;
  course_comment: string | null;
  course_easy: any;
  course_useful: any;
  prof_engaging: any;
  prof_comment: string | null;
  prof_clear: any;
  course_id: number | null;
  prof_id: number | null;
  author: {
    full_name: string | null;
    picture_url: string | null;
    program: string | null;
  } | null;
  course: {
    id: number;
    code: string;
    name: string;
    profs_teaching: Array<{ prof: { id: number; name: string } | null }>;
    rating: { liked: any } | null;
  } | null;
  prof: {
    id: number;
    name: string;
    code: string;
    picture_url: string | null;
    rating: { liked: any } | null;
  } | null;
};

export type ReviewUpdateInfoFragment = {
  id: number;
  created_at: any;
  updated_at: any;
  public: boolean;
  liked: any;
  course_comment: string | null;
  course_easy: any;
  course_useful: any;
  prof_engaging: any;
  prof_comment: string | null;
  prof_clear: any;
  course_id: number | null;
  prof_id: number | null;
};

export type ReviewVoteCountsFragment = {
  id: number;
  course_review_rating: { upvote_count: any } | null;
  prof_review_rating: { upvote_count: any } | null;
};

export type UserReviewFieldsFragment = {
  id: number;
  course_review_upvotes: Array<{ user_id: number | null }>;
  prof_review_upvotes: Array<{ user_id: number | null }>;
  user: { user_id: number | null } | null;
};

export type ReviewProfsFragment = {
  id: number;
  course_id: number | null;
  prof: { id: number; name: string; code: string } | null;
};

export type CourseSearchFragment = {
  course_id: number | null;
  name: string | null;
  code: string | null;
  aliases: Array<string> | null;
  useful: any;
  terms: Array<number> | null;
  terms_with_seats: Array<number> | null;
  terms_with_online_sections: Array<number> | null;
  ratings: any;
  prof_ids: Array<number> | null;
  liked: any;
  easy: any;
  has_prereqs: boolean | null;
};

export type ProfSearchFragment = {
  prof_id: number | null;
  name: string | null;
  code: string | null;
  clear: any;
  course_ids: Array<number> | null;
  course_codes: Array<string> | null;
  aliases: Array<string> | null;
  engaging: any;
  liked: any;
  ratings: any;
};

export type UserInfoFragment = {
  id: number;
  full_name: string;
  program: string | null;
  picture_url: string | null;
  secret_id: string;
  email: string | null;
};

export type UserShortlistFragment = {
  id: number;
  shortlist: Array<{
    course_id: number | null;
    user_id: number | null;
    course: { id: number; code: string; name: string } | null;
  }>;
};

export type UserScheduleFragment = {
  id: number;
  schedule: Array<{
    user_id: number;
    section: {
      id: number;
      class_number: number;
      term_id: number;
      section_name: string;
      exams: Array<{
        date: any;
        day: string | null;
        location: string | null;
        start_seconds: number | null;
        end_seconds: number | null;
      }>;
      meetings: Array<{
        days: Array<string>;
        end_date: any;
        end_seconds: number | null;
        is_cancelled: boolean;
        location: string | null;
        section_id: number;
        start_date: any;
        start_seconds: number | null;
        prof: { id: number; name: string } | null;
      }>;
      course: { id: number; name: string; code: string };
    };
  }>;
};

export type UserCoursesTakenFragment = {
  term_id: number;
  course_id: number | null;
  course: {
    id: number;
    code: string;
    name: string;
    rating: { liked: any } | null;
    profs_teaching: Array<{
      prof: { id: number; code: string; name: string } | null;
    }>;
    sections: Array<{
      id: number;
      term_id: number;
      updated_at: any;
      exams: Array<{
        date: any;
        day: string | null;
        end_seconds: number | null;
        is_tba: boolean;
        location: string | null;
        section_id: number;
        start_seconds: number | null;
      }>;
    }>;
  } | null;
};

export type UpdateUserEmailMutationVariables = Exact<{
  user_id?: number | null | undefined;
  email?: string | null | undefined;
}>;

export type UpdateUserEmailMutation = {
  update_user: {
    affected_rows: number;
    returning: Array<{ id: number; email: string | null }>;
  } | null;
};

export type UpsertReviewMutationVariables = Exact<{
  user_id?: number | null | undefined;
  course_id?: number | null | undefined;
  prof_id?: number | null | undefined;
  liked?: any;
  public?: boolean | null | undefined;
  course_easy?: any;
  course_useful?: any;
  course_comment?: string | null | undefined;
  prof_clear?: any;
  prof_engaging?: any;
  prof_comment?: string | null | undefined;
}>;

export type UpsertReviewMutation = {
  insert_review: { returning: Array<ReviewUpdateInfoFragment> } | null;
};

export type DeleteReviewMutationVariables = Exact<{
  review_id?: number | null | undefined;
}>;

export type DeleteReviewMutation = {
  delete_review: { returning: Array<ReviewUpdateInfoFragment> } | null;
};

export type UpsertLikedReviewMutationVariables = Exact<{
  user_id?: number | null | undefined;
  course_id?: number | null | undefined;
  liked?: any;
}>;

export type UpsertLikedReviewMutation = {
  insert_review: { returning: Array<{ id: number; liked: any }> } | null;
};

export type UpsertScheduleSwapMutationVariables = Exact<{
  userId: number;
  sourceSectionId: number;
  replacementSectionId: number;
}>;

export type UpsertScheduleSwapMutation = {
  insert_user_schedule_swap_one: {
    user_id: number;
    source_section_id: number;
  } | null;
};

export type DeleteScheduleSwapMutationVariables = Exact<{
  userId: number;
  sourceSectionId: number;
}>;

export type DeleteScheduleSwapMutation = {
  delete_user_schedule_swap_by_pk: {
    user_id: number;
    source_section_id: number;
  } | null;
};

export type ClearScheduleSwapsMutationVariables = Exact<{
  userId: number;
}>;

export type ClearScheduleSwapsMutation = {
  delete_user_schedule_swap: { affected_rows: number } | null;
};

export type InsertSectionSubscriptionMutationVariables = Exact<{
  section_id?: number | null | undefined;
  user_id?: number | null | undefined;
}>;

export type InsertSectionSubscriptionMutation = {
  insert_queue_section_subscribed: { affected_rows: number } | null;
};

export type DeleteSectionSubscriptionMutationVariables = Exact<{
  section_id?: number | null | undefined;
}>;

export type DeleteSectionSubscriptionMutation = {
  delete_queue_section_subscribed: { affected_rows: number } | null;
};

export type CreateSharedGroupMutationVariables = Exact<{
  name: string;
}>;

export type CreateSharedGroupMutation = {
  insert_shared_group_one: { id: number; name: string } | null;
};

export type AcceptSharedGroupInviteMutationVariables = Exact<{
  groupId: number;
}>;

export type AcceptSharedGroupInviteMutation = {
  update_shared_group_member: { affected_rows: number } | null;
};

export type RemoveSharedGroupMembershipMutationVariables = Exact<{
  groupId: number;
}>;

export type RemoveSharedGroupMembershipMutation = {
  delete_shared_group_member: { affected_rows: number } | null;
};

export type DeleteSharedGroupMutationVariables = Exact<{
  groupId: number;
}>;

export type DeleteSharedGroupMutation = {
  delete_shared_group: { affected_rows: number } | null;
};

export type InsertUserShortlistMutationVariables = Exact<{
  user_id?: number | null | undefined;
  course_id?: number | null | undefined;
}>;

export type InsertUserShortlistMutation = {
  insert_user_shortlist: { affected_rows: number } | null;
};

export type DeleteUserShortlistMutationVariables = Exact<{
  course_id?: number | null | undefined;
}>;

export type DeleteUserShortlistMutation = {
  delete_user_shortlist: { affected_rows: number } | null;
};

export type InsertCourseReviewVoteMutationVariables = Exact<{
  user_id?: number | null | undefined;
  review_id?: number | null | undefined;
}>;

export type InsertCourseReviewVoteMutation = {
  insert_course_review_upvote: { affected_rows: number } | null;
};

export type DeleteCourseReviewVoteMutationVariables = Exact<{
  user_id?: number | null | undefined;
  review_id?: number | null | undefined;
}>;

export type DeleteCourseReviewVoteMutation = {
  delete_course_review_upvote: { affected_rows: number } | null;
};

export type InsertProfReviewVoteMutationVariables = Exact<{
  user_id?: number | null | undefined;
  review_id?: number | null | undefined;
}>;

export type InsertProfReviewVoteMutation = {
  insert_prof_review_upvote: { affected_rows: number } | null;
};

export type Delete_Prof_Review_VoteMutationVariables = Exact<{
  user_id?: number | null | undefined;
  review_id?: number | null | undefined;
}>;

export type Delete_Prof_Review_VoteMutation = {
  delete_prof_review_upvote: { affected_rows: number } | null;
};

export type GetCourseQueryVariables = Exact<{
  code?: string | null | undefined;
}>;

export type GetCourseQuery = {
  course: Array<
    CourseInfoFragment &
      CourseScheduleFragment &
      CourseRequirementsFragment &
      CourseRatingFragment &
      CourseReviewDistributionFragment
  >;
  course_alias: Array<{
    course: CourseInfoFragment &
      CourseScheduleFragment &
      CourseRequirementsFragment &
      CourseRatingFragment &
      CourseReviewDistributionFragment;
  }>;
};

export type GetCourseWithUserDataQueryVariables = Exact<{
  code?: string | null | undefined;
  user_id?: number | null | undefined;
}>;

export type GetCourseWithUserDataQuery = {
  course: Array<
    CourseInfoFragment &
      CourseScheduleFragment &
      CourseRequirementsFragment &
      CourseRatingFragment &
      CourseReviewDistributionFragment
  >;
  course_alias: Array<{
    course: CourseInfoFragment &
      CourseScheduleFragment &
      CourseRequirementsFragment &
      CourseRatingFragment &
      CourseReviewDistributionFragment;
  }>;
  user_shortlist: Array<{ course_id: number | null; user_id: number | null }>;
  user_course_taken: Array<{ term_id: number; course_id: number | null }>;
  queue_section_subscribed: Array<{ section_id: number; user_id: number }>;
  review: Array<ReviewInfoFragment>;
  user: Array<{ email: string | null }>;
};

export type RefetchCourseShortlistQueryVariables = Exact<{
  code?: string | null | undefined;
  user_id?: number | null | undefined;
}>;

export type RefetchCourseShortlistQuery = {
  user_shortlist: Array<{ course_id: number | null; user_id: number | null }>;
};

export type RefetchRatingsQueryVariables = Exact<{
  course_id?: number | null | undefined;
  prof_id?: number | null | undefined;
}>;

export type RefetchRatingsQuery = {
  course: Array<CourseRatingFragment>;
  prof: Array<ProfRatingFragment>;
};

export type RefetchSectionSubscriptionsQueryVariables = Exact<{
  course_id?: number | null | undefined;
  user_id?: number | null | undefined;
}>;

export type RefetchSectionSubscriptionsQuery = {
  queue_section_subscribed: Array<{ section_id: number; user_id: number }>;
};

export type RefetchCourseReviewsQueryVariables = Exact<{
  code?: string | null | undefined;
  user_id?: number | null | undefined;
}>;

export type RefetchCourseReviewsQuery = { review: Array<ReviewInfoFragment> };

export type CourseReviewsQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type CourseReviewsQuery = {
  review: Array<ReviewInfoFragment & ReviewVoteCountsFragment>;
};

export type CourseReviewsWithUserDataQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type CourseReviewsWithUserDataQuery = {
  review: Array<
    ReviewInfoFragment & ReviewVoteCountsFragment & UserReviewFieldsFragment
  >;
};

export type RefetchCourseReviewUpvoteQueryVariables = Exact<{
  review_id?: number | null | undefined;
}>;

export type RefetchCourseReviewUpvoteQuery = {
  review: Array<ReviewVoteCountsFragment>;
};

export type CourseReviewProfsQueryVariables = Exact<{
  courseIds?: Array<number> | number | null | undefined;
}>;

export type CourseReviewProfsQuery = {
  allProfs: Array<ProfInfoFragment>;
  reviewProfs: Array<ReviewProfsFragment>;
};

export type SwapCourseSectionFragment = {
  id: number;
  section_name: string;
  class_number: number;
  term_id: number;
  enrollment_capacity: number;
  enrollment_total: number;
  updated_at: any;
  exams: Array<{
    date: any;
    day: string | null;
    location: string | null;
    start_seconds: number | null;
    end_seconds: number | null;
  }>;
  meetings: Array<{
    days: Array<string>;
    end_date: any;
    end_seconds: number | null;
    is_cancelled: boolean;
    is_tba: boolean;
    location: string | null;
    section_id: number;
    start_date: any;
    start_seconds: number | null;
    prof: {
      id: number;
      code: string;
      name: string;
      rating: { clear: any; engaging: any } | null;
    } | null;
  }>;
  course: { id: number; name: string; code: string };
};

export type GetSectionsByClassNumbersQueryVariables = Exact<{
  classNumbers: Array<number> | number;
  termId: number;
}>;

export type GetSectionsByClassNumbersQuery = {
  course_section: Array<SwapCourseSectionFragment>;
};

export type GetCourseForSwapQueryVariables = Exact<{
  code: string;
  termId: number;
}>;

export type GetCourseForSwapQuery = {
  course_section: Array<SwapCourseSectionFragment>;
};

export type CourseDropdownByTermQueryVariables = Exact<{
  termId: number;
}>;

export type CourseDropdownByTermQuery = {
  course: Array<{ code: string; name: string }>;
};

export type ExploreAllQueryVariables = Exact<{ [key: string]: never }>;

export type ExploreAllQuery = {
  course_search_index: Array<CourseSearchFragment>;
  prof_search_index: Array<ProfSearchFragment>;
};

export type ExploreQueryVariables = Exact<{
  query?: string | null | undefined;
  code_only?: boolean | null | undefined;
}>;

export type ExploreQuery = {
  search_courses: Array<CourseSearchFragment>;
  search_profs: Array<ProfSearchFragment>;
};

export type GetProfQueryVariables = Exact<{
  code?: string | null | undefined;
}>;

export type GetProfQuery = {
  prof: Array<
    ProfInfoFragment &
      ProfCoursesTaughtFragment &
      ProfRatingFragment &
      ProfReviewDistributionFragment
  >;
  prof_merge: Array<{
    into_prof: ProfInfoFragment &
      ProfCoursesTaughtFragment &
      ProfRatingFragment &
      ProfReviewDistributionFragment;
  }>;
};

export type ProfReviewsQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type ProfReviewsQuery = {
  review: Array<ReviewInfoFragment & ReviewVoteCountsFragment>;
};

export type ProfReviewsWithUserDataQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type ProfReviewsWithUserDataQuery = {
  review: Array<
    ReviewInfoFragment & ReviewVoteCountsFragment & UserReviewFieldsFragment
  >;
};

export type Refetch_Prof_Review_UpvoteQueryVariables = Exact<{
  review_id?: number | null | undefined;
}>;

export type Refetch_Prof_Review_UpvoteQuery = {
  review: Array<ReviewVoteCountsFragment>;
};

export type GetScheduleSwapsQueryVariables = Exact<{
  userId: number;
  termIds: Array<number> | number;
}>;

export type GetScheduleSwapsQuery = {
  user_schedule_swap: Array<{
    user_id: number;
    source_section_id: number;
    replacement_section_id: number;
    source_schedule: {
      user_id: number;
      section: { id: number; term_id: number };
    };
    replacement_section: SwapCourseSectionFragment;
  }>;
};

export type GetSharedGroupsQueryVariables = Exact<{
  userId: number;
}>;

export type GetSharedGroupsQuery = {
  shared_group: Array<{
    id: number;
    name: string;
    membership: Array<{ status: string }>;
    members_aggregate: { aggregate: { count: number } | null };
  }>;
};

export type GetUserQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type GetUserQuery = {
  user: Array<UserInfoFragment & UserShortlistFragment & UserScheduleFragment>;
  user_course_taken: Array<UserCoursesTakenFragment>;
  review: Array<ReviewInfoFragment>;
};

export type RefetchUserShortlistQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type RefetchUserShortlistQuery = {
  user: Array<{ id: number } & UserShortlistFragment>;
};

export type RefetchUserReviewQueryVariables = Exact<{
  id?: number | null | undefined;
}>;

export type RefetchUserReviewQuery = { review: Array<ReviewInfoFragment> };
