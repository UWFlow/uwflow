/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  _int4: { input: any; output: any };
  _text: { input: any; output: any };
  bigint: { input: any; output: any };
  date: { input: any; output: any };
  join_source: { input: any; output: any };
  numeric: { input: any; output: any };
  smallint: { input: any; output: any };
  timestamptz: { input: any; output: any };
  tsvector: { input: any; output: any };
};

/** Boolean expression to compare columns of type "Boolean". All fields are combined with logical 'AND'. */
export type Boolean_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Boolean']['input']>;
  _gt?: InputMaybe<Scalars['Boolean']['input']>;
  _gte?: InputMaybe<Scalars['Boolean']['input']>;
  _in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Boolean']['input']>;
  _lte?: InputMaybe<Scalars['Boolean']['input']>;
  _neq?: InputMaybe<Scalars['Boolean']['input']>;
  _nin?: InputMaybe<Array<Scalars['Boolean']['input']>>;
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** Boolean expression to compare columns of type "_int4". All fields are combined with logical 'AND'. */
export type _Int4_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['_int4']['input']>;
  _gt?: InputMaybe<Scalars['_int4']['input']>;
  _gte?: InputMaybe<Scalars['_int4']['input']>;
  _in?: InputMaybe<Array<Scalars['_int4']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['_int4']['input']>;
  _lte?: InputMaybe<Scalars['_int4']['input']>;
  _neq?: InputMaybe<Scalars['_int4']['input']>;
  _nin?: InputMaybe<Array<Scalars['_int4']['input']>>;
};

/** Boolean expression to compare columns of type "_text". All fields are combined with logical 'AND'. */
export type _Text_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['_text']['input']>;
  _gt?: InputMaybe<Scalars['_text']['input']>;
  _gte?: InputMaybe<Scalars['_text']['input']>;
  _in?: InputMaybe<Array<Scalars['_text']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['_text']['input']>;
  _lte?: InputMaybe<Scalars['_text']['input']>;
  _neq?: InputMaybe<Scalars['_text']['input']>;
  _nin?: InputMaybe<Array<Scalars['_text']['input']>>;
};

/** columns and relationships of "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets = {
  __typename?: 'aggregate_course_easy_buckets';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** aggregated selection of "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Aggregate = {
  __typename?: 'aggregate_course_easy_buckets_aggregate';
  aggregate?: Maybe<Aggregate_Course_Easy_Buckets_Aggregate_Fields>;
  nodes: Array<Aggregate_Course_Easy_Buckets>;
};

export type Aggregate_Course_Easy_Buckets_Aggregate_Bool_Exp = {
  count?: InputMaybe<Aggregate_Course_Easy_Buckets_Aggregate_Bool_Exp_Count>;
};

export type Aggregate_Course_Easy_Buckets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Aggregate_Fields = {
  __typename?: 'aggregate_course_easy_buckets_aggregate_fields';
  avg?: Maybe<Aggregate_Course_Easy_Buckets_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Course_Easy_Buckets_Max_Fields>;
  min?: Maybe<Aggregate_Course_Easy_Buckets_Min_Fields>;
  stddev?: Maybe<Aggregate_Course_Easy_Buckets_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Course_Easy_Buckets_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Course_Easy_Buckets_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Course_Easy_Buckets_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Course_Easy_Buckets_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Course_Easy_Buckets_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Course_Easy_Buckets_Variance_Fields>;
};

/** aggregate fields of "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Aggregate_Order_By = {
  avg?: InputMaybe<Aggregate_Course_Easy_Buckets_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Aggregate_Course_Easy_Buckets_Max_Order_By>;
  min?: InputMaybe<Aggregate_Course_Easy_Buckets_Min_Order_By>;
  stddev?: InputMaybe<Aggregate_Course_Easy_Buckets_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Aggregate_Course_Easy_Buckets_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Aggregate_Course_Easy_Buckets_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Aggregate_Course_Easy_Buckets_Sum_Order_By>;
  var_pop?: InputMaybe<Aggregate_Course_Easy_Buckets_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Aggregate_Course_Easy_Buckets_Var_Samp_Order_By>;
  variance?: InputMaybe<Aggregate_Course_Easy_Buckets_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Arr_Rel_Insert_Input = {
  data: Array<Aggregate_Course_Easy_Buckets_Insert_Input>;
};

/** aggregate avg on columns */
export type Aggregate_Course_Easy_Buckets_Avg_Fields = {
  __typename?: 'aggregate_course_easy_buckets_avg_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Avg_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "aggregate.course_easy_buckets". All fields are combined with a logical 'AND'. */
export type Aggregate_Course_Easy_Buckets_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Bool_Exp>>;
  count?: InputMaybe<Bigint_Comparison_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<Smallint_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Insert_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Course_Easy_Buckets_Max_Fields = {
  __typename?: 'aggregate_course_easy_buckets_max_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by max() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Max_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Aggregate_Course_Easy_Buckets_Min_Fields = {
  __typename?: 'aggregate_course_easy_buckets_min_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by min() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Min_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "aggregate.course_easy_buckets". */
export type Aggregate_Course_Easy_Buckets_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.course_easy_buckets" */
export enum Aggregate_Course_Easy_Buckets_Select_Column {
  /** column name */
  Count = 'count',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  Value = 'value',
}

/** aggregate stddev on columns */
export type Aggregate_Course_Easy_Buckets_Stddev_Fields = {
  __typename?: 'aggregate_course_easy_buckets_stddev_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Stddev_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Course_Easy_Buckets_Stddev_Pop_Fields = {
  __typename?: 'aggregate_course_easy_buckets_stddev_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Stddev_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Course_Easy_Buckets_Stddev_Samp_Fields = {
  __typename?: 'aggregate_course_easy_buckets_stddev_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Stddev_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "aggregate_course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Course_Easy_Buckets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Course_Easy_Buckets_Stream_Cursor_Value_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Course_Easy_Buckets_Sum_Fields = {
  __typename?: 'aggregate_course_easy_buckets_sum_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Sum_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Aggregate_Course_Easy_Buckets_Var_Pop_Fields = {
  __typename?: 'aggregate_course_easy_buckets_var_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Var_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Aggregate_Course_Easy_Buckets_Var_Samp_Fields = {
  __typename?: 'aggregate_course_easy_buckets_var_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Var_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Aggregate_Course_Easy_Buckets_Variance_Fields = {
  __typename?: 'aggregate_course_easy_buckets_variance_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "aggregate.course_easy_buckets" */
export type Aggregate_Course_Easy_Buckets_Variance_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** columns and relationships of "aggregate.course_rating" */
export type Aggregate_Course_Rating = {
  __typename?: 'aggregate_course_rating';
  comment_count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** aggregated selection of "aggregate.course_rating" */
export type Aggregate_Course_Rating_Aggregate = {
  __typename?: 'aggregate_course_rating_aggregate';
  aggregate?: Maybe<Aggregate_Course_Rating_Aggregate_Fields>;
  nodes: Array<Aggregate_Course_Rating>;
};

/** aggregate fields of "aggregate.course_rating" */
export type Aggregate_Course_Rating_Aggregate_Fields = {
  __typename?: 'aggregate_course_rating_aggregate_fields';
  avg?: Maybe<Aggregate_Course_Rating_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Course_Rating_Max_Fields>;
  min?: Maybe<Aggregate_Course_Rating_Min_Fields>;
  stddev?: Maybe<Aggregate_Course_Rating_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Course_Rating_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Course_Rating_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Course_Rating_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Course_Rating_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Course_Rating_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Course_Rating_Variance_Fields>;
};

/** aggregate fields of "aggregate.course_rating" */
export type Aggregate_Course_Rating_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Course_Rating_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Aggregate_Course_Rating_Avg_Fields = {
  __typename?: 'aggregate_course_rating_avg_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "aggregate.course_rating". All fields are combined with a logical 'AND'. */
export type Aggregate_Course_Rating_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Course_Rating_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Course_Rating_Bool_Exp>>;
  comment_count?: InputMaybe<Bigint_Comparison_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  easy?: InputMaybe<Numeric_Comparison_Exp>;
  filled_count?: InputMaybe<Bigint_Comparison_Exp>;
  liked?: InputMaybe<Numeric_Comparison_Exp>;
  useful?: InputMaybe<Numeric_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.course_rating" */
export type Aggregate_Course_Rating_Insert_Input = {
  comment_count?: InputMaybe<Scalars['bigint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  easy?: InputMaybe<Scalars['numeric']['input']>;
  filled_count?: InputMaybe<Scalars['bigint']['input']>;
  liked?: InputMaybe<Scalars['numeric']['input']>;
  useful?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Course_Rating_Max_Fields = {
  __typename?: 'aggregate_course_rating_max_fields';
  comment_count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** aggregate min on columns */
export type Aggregate_Course_Rating_Min_Fields = {
  __typename?: 'aggregate_course_rating_min_fields';
  comment_count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** input type for inserting object relation for remote table "aggregate.course_rating" */
export type Aggregate_Course_Rating_Obj_Rel_Insert_Input = {
  data: Aggregate_Course_Rating_Insert_Input;
};

/** Ordering options when selecting data from "aggregate.course_rating". */
export type Aggregate_Course_Rating_Order_By = {
  comment_count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  easy?: InputMaybe<Order_By>;
  filled_count?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  useful?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.course_rating" */
export enum Aggregate_Course_Rating_Select_Column {
  /** column name */
  CommentCount = 'comment_count',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  Easy = 'easy',
  /** column name */
  FilledCount = 'filled_count',
  /** column name */
  Liked = 'liked',
  /** column name */
  Useful = 'useful',
}

/** aggregate stddev on columns */
export type Aggregate_Course_Rating_Stddev_Fields = {
  __typename?: 'aggregate_course_rating_stddev_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Course_Rating_Stddev_Pop_Fields = {
  __typename?: 'aggregate_course_rating_stddev_pop_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Course_Rating_Stddev_Samp_Fields = {
  __typename?: 'aggregate_course_rating_stddev_samp_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "aggregate_course_rating" */
export type Aggregate_Course_Rating_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Course_Rating_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Course_Rating_Stream_Cursor_Value_Input = {
  comment_count?: InputMaybe<Scalars['bigint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  easy?: InputMaybe<Scalars['numeric']['input']>;
  filled_count?: InputMaybe<Scalars['bigint']['input']>;
  liked?: InputMaybe<Scalars['numeric']['input']>;
  useful?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Course_Rating_Sum_Fields = {
  __typename?: 'aggregate_course_rating_sum_fields';
  comment_count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** aggregate var_pop on columns */
export type Aggregate_Course_Rating_Var_Pop_Fields = {
  __typename?: 'aggregate_course_rating_var_pop_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Aggregate_Course_Rating_Var_Samp_Fields = {
  __typename?: 'aggregate_course_rating_var_samp_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Aggregate_Course_Rating_Variance_Fields = {
  __typename?: 'aggregate_course_rating_variance_fields';
  comment_count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "aggregate.course_review_rating" */
export type Aggregate_Course_Review_Rating = {
  __typename?: 'aggregate_course_review_rating';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** aggregated selection of "aggregate.course_review_rating" */
export type Aggregate_Course_Review_Rating_Aggregate = {
  __typename?: 'aggregate_course_review_rating_aggregate';
  aggregate?: Maybe<Aggregate_Course_Review_Rating_Aggregate_Fields>;
  nodes: Array<Aggregate_Course_Review_Rating>;
};

/** aggregate fields of "aggregate.course_review_rating" */
export type Aggregate_Course_Review_Rating_Aggregate_Fields = {
  __typename?: 'aggregate_course_review_rating_aggregate_fields';
  avg?: Maybe<Aggregate_Course_Review_Rating_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Course_Review_Rating_Max_Fields>;
  min?: Maybe<Aggregate_Course_Review_Rating_Min_Fields>;
  stddev?: Maybe<Aggregate_Course_Review_Rating_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Course_Review_Rating_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Course_Review_Rating_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Course_Review_Rating_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Course_Review_Rating_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Course_Review_Rating_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Course_Review_Rating_Variance_Fields>;
};

/** aggregate fields of "aggregate.course_review_rating" */
export type Aggregate_Course_Review_Rating_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Course_Review_Rating_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Aggregate_Course_Review_Rating_Avg_Fields = {
  __typename?: 'aggregate_course_review_rating_avg_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "aggregate.course_review_rating". All fields are combined with a logical 'AND'. */
export type Aggregate_Course_Review_Rating_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Course_Review_Rating_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Course_Review_Rating_Bool_Exp>>;
  review_id?: InputMaybe<Int_Comparison_Exp>;
  upvote_count?: InputMaybe<Bigint_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.course_review_rating" */
export type Aggregate_Course_Review_Rating_Insert_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  upvote_count?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Course_Review_Rating_Max_Fields = {
  __typename?: 'aggregate_course_review_rating_max_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate min on columns */
export type Aggregate_Course_Review_Rating_Min_Fields = {
  __typename?: 'aggregate_course_review_rating_min_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** input type for inserting object relation for remote table "aggregate.course_review_rating" */
export type Aggregate_Course_Review_Rating_Obj_Rel_Insert_Input = {
  data: Aggregate_Course_Review_Rating_Insert_Input;
};

/** Ordering options when selecting data from "aggregate.course_review_rating". */
export type Aggregate_Course_Review_Rating_Order_By = {
  review_id?: InputMaybe<Order_By>;
  upvote_count?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.course_review_rating" */
export enum Aggregate_Course_Review_Rating_Select_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UpvoteCount = 'upvote_count',
}

/** aggregate stddev on columns */
export type Aggregate_Course_Review_Rating_Stddev_Fields = {
  __typename?: 'aggregate_course_review_rating_stddev_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Course_Review_Rating_Stddev_Pop_Fields = {
  __typename?: 'aggregate_course_review_rating_stddev_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Course_Review_Rating_Stddev_Samp_Fields = {
  __typename?: 'aggregate_course_review_rating_stddev_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "aggregate_course_review_rating" */
export type Aggregate_Course_Review_Rating_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Course_Review_Rating_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Course_Review_Rating_Stream_Cursor_Value_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  upvote_count?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Course_Review_Rating_Sum_Fields = {
  __typename?: 'aggregate_course_review_rating_sum_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate var_pop on columns */
export type Aggregate_Course_Review_Rating_Var_Pop_Fields = {
  __typename?: 'aggregate_course_review_rating_var_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Aggregate_Course_Review_Rating_Var_Samp_Fields = {
  __typename?: 'aggregate_course_review_rating_var_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Aggregate_Course_Review_Rating_Variance_Fields = {
  __typename?: 'aggregate_course_review_rating_variance_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets = {
  __typename?: 'aggregate_course_useful_buckets';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** aggregated selection of "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Aggregate = {
  __typename?: 'aggregate_course_useful_buckets_aggregate';
  aggregate?: Maybe<Aggregate_Course_Useful_Buckets_Aggregate_Fields>;
  nodes: Array<Aggregate_Course_Useful_Buckets>;
};

export type Aggregate_Course_Useful_Buckets_Aggregate_Bool_Exp = {
  count?: InputMaybe<Aggregate_Course_Useful_Buckets_Aggregate_Bool_Exp_Count>;
};

export type Aggregate_Course_Useful_Buckets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Aggregate_Fields = {
  __typename?: 'aggregate_course_useful_buckets_aggregate_fields';
  avg?: Maybe<Aggregate_Course_Useful_Buckets_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Course_Useful_Buckets_Max_Fields>;
  min?: Maybe<Aggregate_Course_Useful_Buckets_Min_Fields>;
  stddev?: Maybe<Aggregate_Course_Useful_Buckets_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Course_Useful_Buckets_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Course_Useful_Buckets_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Course_Useful_Buckets_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Course_Useful_Buckets_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Course_Useful_Buckets_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Course_Useful_Buckets_Variance_Fields>;
};

/** aggregate fields of "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Aggregate_Order_By = {
  avg?: InputMaybe<Aggregate_Course_Useful_Buckets_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Aggregate_Course_Useful_Buckets_Max_Order_By>;
  min?: InputMaybe<Aggregate_Course_Useful_Buckets_Min_Order_By>;
  stddev?: InputMaybe<Aggregate_Course_Useful_Buckets_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Aggregate_Course_Useful_Buckets_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Aggregate_Course_Useful_Buckets_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Aggregate_Course_Useful_Buckets_Sum_Order_By>;
  var_pop?: InputMaybe<Aggregate_Course_Useful_Buckets_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Aggregate_Course_Useful_Buckets_Var_Samp_Order_By>;
  variance?: InputMaybe<Aggregate_Course_Useful_Buckets_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Arr_Rel_Insert_Input = {
  data: Array<Aggregate_Course_Useful_Buckets_Insert_Input>;
};

/** aggregate avg on columns */
export type Aggregate_Course_Useful_Buckets_Avg_Fields = {
  __typename?: 'aggregate_course_useful_buckets_avg_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Avg_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "aggregate.course_useful_buckets". All fields are combined with a logical 'AND'. */
export type Aggregate_Course_Useful_Buckets_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Bool_Exp>>;
  count?: InputMaybe<Bigint_Comparison_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<Smallint_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Insert_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Course_Useful_Buckets_Max_Fields = {
  __typename?: 'aggregate_course_useful_buckets_max_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by max() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Max_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Aggregate_Course_Useful_Buckets_Min_Fields = {
  __typename?: 'aggregate_course_useful_buckets_min_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by min() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Min_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "aggregate.course_useful_buckets". */
export type Aggregate_Course_Useful_Buckets_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.course_useful_buckets" */
export enum Aggregate_Course_Useful_Buckets_Select_Column {
  /** column name */
  Count = 'count',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  Value = 'value',
}

/** aggregate stddev on columns */
export type Aggregate_Course_Useful_Buckets_Stddev_Fields = {
  __typename?: 'aggregate_course_useful_buckets_stddev_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Stddev_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Course_Useful_Buckets_Stddev_Pop_Fields = {
  __typename?: 'aggregate_course_useful_buckets_stddev_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Stddev_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Course_Useful_Buckets_Stddev_Samp_Fields = {
  __typename?: 'aggregate_course_useful_buckets_stddev_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Stddev_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "aggregate_course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Course_Useful_Buckets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Course_Useful_Buckets_Stream_Cursor_Value_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Course_Useful_Buckets_Sum_Fields = {
  __typename?: 'aggregate_course_useful_buckets_sum_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Sum_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Aggregate_Course_Useful_Buckets_Var_Pop_Fields = {
  __typename?: 'aggregate_course_useful_buckets_var_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Var_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Aggregate_Course_Useful_Buckets_Var_Samp_Fields = {
  __typename?: 'aggregate_course_useful_buckets_var_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Var_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Aggregate_Course_Useful_Buckets_Variance_Fields = {
  __typename?: 'aggregate_course_useful_buckets_variance_fields';
  count?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "aggregate.course_useful_buckets" */
export type Aggregate_Course_Useful_Buckets_Variance_Order_By = {
  count?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** columns and relationships of "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets = {
  __typename?: 'aggregate_prof_clear_buckets';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** aggregated selection of "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Aggregate = {
  __typename?: 'aggregate_prof_clear_buckets_aggregate';
  aggregate?: Maybe<Aggregate_Prof_Clear_Buckets_Aggregate_Fields>;
  nodes: Array<Aggregate_Prof_Clear_Buckets>;
};

export type Aggregate_Prof_Clear_Buckets_Aggregate_Bool_Exp = {
  count?: InputMaybe<Aggregate_Prof_Clear_Buckets_Aggregate_Bool_Exp_Count>;
};

export type Aggregate_Prof_Clear_Buckets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Aggregate_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_aggregate_fields';
  avg?: Maybe<Aggregate_Prof_Clear_Buckets_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Prof_Clear_Buckets_Max_Fields>;
  min?: Maybe<Aggregate_Prof_Clear_Buckets_Min_Fields>;
  stddev?: Maybe<Aggregate_Prof_Clear_Buckets_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Prof_Clear_Buckets_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Prof_Clear_Buckets_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Prof_Clear_Buckets_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Prof_Clear_Buckets_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Prof_Clear_Buckets_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Prof_Clear_Buckets_Variance_Fields>;
};

/** aggregate fields of "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Aggregate_Order_By = {
  avg?: InputMaybe<Aggregate_Prof_Clear_Buckets_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Aggregate_Prof_Clear_Buckets_Max_Order_By>;
  min?: InputMaybe<Aggregate_Prof_Clear_Buckets_Min_Order_By>;
  stddev?: InputMaybe<Aggregate_Prof_Clear_Buckets_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Aggregate_Prof_Clear_Buckets_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Aggregate_Prof_Clear_Buckets_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Aggregate_Prof_Clear_Buckets_Sum_Order_By>;
  var_pop?: InputMaybe<Aggregate_Prof_Clear_Buckets_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Aggregate_Prof_Clear_Buckets_Var_Samp_Order_By>;
  variance?: InputMaybe<Aggregate_Prof_Clear_Buckets_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Arr_Rel_Insert_Input = {
  data: Array<Aggregate_Prof_Clear_Buckets_Insert_Input>;
};

/** aggregate avg on columns */
export type Aggregate_Prof_Clear_Buckets_Avg_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_avg_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Avg_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "aggregate.prof_clear_buckets". All fields are combined with a logical 'AND'. */
export type Aggregate_Prof_Clear_Buckets_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Bool_Exp>>;
  count?: InputMaybe<Bigint_Comparison_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<Smallint_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Insert_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Prof_Clear_Buckets_Max_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_max_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by max() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Max_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Aggregate_Prof_Clear_Buckets_Min_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_min_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by min() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Min_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "aggregate.prof_clear_buckets". */
export type Aggregate_Prof_Clear_Buckets_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.prof_clear_buckets" */
export enum Aggregate_Prof_Clear_Buckets_Select_Column {
  /** column name */
  Count = 'count',
  /** column name */
  ProfId = 'prof_id',
  /** column name */
  Value = 'value',
}

/** aggregate stddev on columns */
export type Aggregate_Prof_Clear_Buckets_Stddev_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_stddev_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Stddev_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Prof_Clear_Buckets_Stddev_Pop_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_stddev_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Stddev_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Prof_Clear_Buckets_Stddev_Samp_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_stddev_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Stddev_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "aggregate_prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Prof_Clear_Buckets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Prof_Clear_Buckets_Stream_Cursor_Value_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Prof_Clear_Buckets_Sum_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_sum_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Sum_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Aggregate_Prof_Clear_Buckets_Var_Pop_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_var_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Var_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Aggregate_Prof_Clear_Buckets_Var_Samp_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_var_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Var_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Aggregate_Prof_Clear_Buckets_Variance_Fields = {
  __typename?: 'aggregate_prof_clear_buckets_variance_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "aggregate.prof_clear_buckets" */
export type Aggregate_Prof_Clear_Buckets_Variance_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** columns and relationships of "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets = {
  __typename?: 'aggregate_prof_engaging_buckets';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** aggregated selection of "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Aggregate = {
  __typename?: 'aggregate_prof_engaging_buckets_aggregate';
  aggregate?: Maybe<Aggregate_Prof_Engaging_Buckets_Aggregate_Fields>;
  nodes: Array<Aggregate_Prof_Engaging_Buckets>;
};

export type Aggregate_Prof_Engaging_Buckets_Aggregate_Bool_Exp = {
  count?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Aggregate_Bool_Exp_Count>;
};

export type Aggregate_Prof_Engaging_Buckets_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Aggregate_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_aggregate_fields';
  avg?: Maybe<Aggregate_Prof_Engaging_Buckets_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Prof_Engaging_Buckets_Max_Fields>;
  min?: Maybe<Aggregate_Prof_Engaging_Buckets_Min_Fields>;
  stddev?: Maybe<Aggregate_Prof_Engaging_Buckets_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Prof_Engaging_Buckets_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Prof_Engaging_Buckets_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Prof_Engaging_Buckets_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Prof_Engaging_Buckets_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Prof_Engaging_Buckets_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Prof_Engaging_Buckets_Variance_Fields>;
};

/** aggregate fields of "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Aggregate_Order_By = {
  avg?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Max_Order_By>;
  min?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Min_Order_By>;
  stddev?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Sum_Order_By>;
  var_pop?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Var_Samp_Order_By>;
  variance?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Arr_Rel_Insert_Input = {
  data: Array<Aggregate_Prof_Engaging_Buckets_Insert_Input>;
};

/** aggregate avg on columns */
export type Aggregate_Prof_Engaging_Buckets_Avg_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_avg_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Avg_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "aggregate.prof_engaging_buckets". All fields are combined with a logical 'AND'. */
export type Aggregate_Prof_Engaging_Buckets_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Bool_Exp>>;
  count?: InputMaybe<Bigint_Comparison_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
  value?: InputMaybe<Smallint_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Insert_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Prof_Engaging_Buckets_Max_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_max_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by max() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Max_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Aggregate_Prof_Engaging_Buckets_Min_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_min_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by min() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Min_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "aggregate.prof_engaging_buckets". */
export type Aggregate_Prof_Engaging_Buckets_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.prof_engaging_buckets" */
export enum Aggregate_Prof_Engaging_Buckets_Select_Column {
  /** column name */
  Count = 'count',
  /** column name */
  ProfId = 'prof_id',
  /** column name */
  Value = 'value',
}

/** aggregate stddev on columns */
export type Aggregate_Prof_Engaging_Buckets_Stddev_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_stddev_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Stddev_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Prof_Engaging_Buckets_Stddev_Pop_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_stddev_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Stddev_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Prof_Engaging_Buckets_Stddev_Samp_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_stddev_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Stddev_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "aggregate_prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Prof_Engaging_Buckets_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Prof_Engaging_Buckets_Stream_Cursor_Value_Input = {
  count?: InputMaybe<Scalars['bigint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  value?: InputMaybe<Scalars['smallint']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Prof_Engaging_Buckets_Sum_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_sum_fields';
  count?: Maybe<Scalars['bigint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  value?: Maybe<Scalars['smallint']['output']>;
};

/** order by sum() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Sum_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Aggregate_Prof_Engaging_Buckets_Var_Pop_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_var_pop_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Var_Pop_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Aggregate_Prof_Engaging_Buckets_Var_Samp_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_var_samp_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Var_Samp_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Aggregate_Prof_Engaging_Buckets_Variance_Fields = {
  __typename?: 'aggregate_prof_engaging_buckets_variance_fields';
  count?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  value?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "aggregate.prof_engaging_buckets" */
export type Aggregate_Prof_Engaging_Buckets_Variance_Order_By = {
  count?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  value?: InputMaybe<Order_By>;
};

/** columns and relationships of "aggregate.prof_rating" */
export type Aggregate_Prof_Rating = {
  __typename?: 'aggregate_prof_rating';
  clear?: Maybe<Scalars['numeric']['output']>;
  comment_count?: Maybe<Scalars['bigint']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "aggregate.prof_rating" */
export type Aggregate_Prof_Rating_Aggregate = {
  __typename?: 'aggregate_prof_rating_aggregate';
  aggregate?: Maybe<Aggregate_Prof_Rating_Aggregate_Fields>;
  nodes: Array<Aggregate_Prof_Rating>;
};

/** aggregate fields of "aggregate.prof_rating" */
export type Aggregate_Prof_Rating_Aggregate_Fields = {
  __typename?: 'aggregate_prof_rating_aggregate_fields';
  avg?: Maybe<Aggregate_Prof_Rating_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Prof_Rating_Max_Fields>;
  min?: Maybe<Aggregate_Prof_Rating_Min_Fields>;
  stddev?: Maybe<Aggregate_Prof_Rating_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Prof_Rating_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Prof_Rating_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Prof_Rating_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Prof_Rating_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Prof_Rating_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Prof_Rating_Variance_Fields>;
};

/** aggregate fields of "aggregate.prof_rating" */
export type Aggregate_Prof_Rating_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Prof_Rating_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Aggregate_Prof_Rating_Avg_Fields = {
  __typename?: 'aggregate_prof_rating_avg_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "aggregate.prof_rating". All fields are combined with a logical 'AND'. */
export type Aggregate_Prof_Rating_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Prof_Rating_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Prof_Rating_Bool_Exp>>;
  clear?: InputMaybe<Numeric_Comparison_Exp>;
  comment_count?: InputMaybe<Bigint_Comparison_Exp>;
  engaging?: InputMaybe<Numeric_Comparison_Exp>;
  filled_count?: InputMaybe<Bigint_Comparison_Exp>;
  liked?: InputMaybe<Numeric_Comparison_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.prof_rating" */
export type Aggregate_Prof_Rating_Insert_Input = {
  clear?: InputMaybe<Scalars['numeric']['input']>;
  comment_count?: InputMaybe<Scalars['bigint']['input']>;
  engaging?: InputMaybe<Scalars['numeric']['input']>;
  filled_count?: InputMaybe<Scalars['bigint']['input']>;
  liked?: InputMaybe<Scalars['numeric']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Prof_Rating_Max_Fields = {
  __typename?: 'aggregate_prof_rating_max_fields';
  clear?: Maybe<Scalars['numeric']['output']>;
  comment_count?: Maybe<Scalars['bigint']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type Aggregate_Prof_Rating_Min_Fields = {
  __typename?: 'aggregate_prof_rating_min_fields';
  clear?: Maybe<Scalars['numeric']['output']>;
  comment_count?: Maybe<Scalars['bigint']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** input type for inserting object relation for remote table "aggregate.prof_rating" */
export type Aggregate_Prof_Rating_Obj_Rel_Insert_Input = {
  data: Aggregate_Prof_Rating_Insert_Input;
};

/** Ordering options when selecting data from "aggregate.prof_rating". */
export type Aggregate_Prof_Rating_Order_By = {
  clear?: InputMaybe<Order_By>;
  comment_count?: InputMaybe<Order_By>;
  engaging?: InputMaybe<Order_By>;
  filled_count?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.prof_rating" */
export enum Aggregate_Prof_Rating_Select_Column {
  /** column name */
  Clear = 'clear',
  /** column name */
  CommentCount = 'comment_count',
  /** column name */
  Engaging = 'engaging',
  /** column name */
  FilledCount = 'filled_count',
  /** column name */
  Liked = 'liked',
  /** column name */
  ProfId = 'prof_id',
}

/** aggregate stddev on columns */
export type Aggregate_Prof_Rating_Stddev_Fields = {
  __typename?: 'aggregate_prof_rating_stddev_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Prof_Rating_Stddev_Pop_Fields = {
  __typename?: 'aggregate_prof_rating_stddev_pop_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Prof_Rating_Stddev_Samp_Fields = {
  __typename?: 'aggregate_prof_rating_stddev_samp_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "aggregate_prof_rating" */
export type Aggregate_Prof_Rating_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Prof_Rating_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Prof_Rating_Stream_Cursor_Value_Input = {
  clear?: InputMaybe<Scalars['numeric']['input']>;
  comment_count?: InputMaybe<Scalars['bigint']['input']>;
  engaging?: InputMaybe<Scalars['numeric']['input']>;
  filled_count?: InputMaybe<Scalars['bigint']['input']>;
  liked?: InputMaybe<Scalars['numeric']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Prof_Rating_Sum_Fields = {
  __typename?: 'aggregate_prof_rating_sum_fields';
  clear?: Maybe<Scalars['numeric']['output']>;
  comment_count?: Maybe<Scalars['bigint']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  filled_count?: Maybe<Scalars['bigint']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate var_pop on columns */
export type Aggregate_Prof_Rating_Var_Pop_Fields = {
  __typename?: 'aggregate_prof_rating_var_pop_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Aggregate_Prof_Rating_Var_Samp_Fields = {
  __typename?: 'aggregate_prof_rating_var_samp_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Aggregate_Prof_Rating_Variance_Fields = {
  __typename?: 'aggregate_prof_rating_variance_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  comment_count?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  filled_count?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "aggregate.prof_review_rating" */
export type Aggregate_Prof_Review_Rating = {
  __typename?: 'aggregate_prof_review_rating';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** aggregated selection of "aggregate.prof_review_rating" */
export type Aggregate_Prof_Review_Rating_Aggregate = {
  __typename?: 'aggregate_prof_review_rating_aggregate';
  aggregate?: Maybe<Aggregate_Prof_Review_Rating_Aggregate_Fields>;
  nodes: Array<Aggregate_Prof_Review_Rating>;
};

/** aggregate fields of "aggregate.prof_review_rating" */
export type Aggregate_Prof_Review_Rating_Aggregate_Fields = {
  __typename?: 'aggregate_prof_review_rating_aggregate_fields';
  avg?: Maybe<Aggregate_Prof_Review_Rating_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Aggregate_Prof_Review_Rating_Max_Fields>;
  min?: Maybe<Aggregate_Prof_Review_Rating_Min_Fields>;
  stddev?: Maybe<Aggregate_Prof_Review_Rating_Stddev_Fields>;
  stddev_pop?: Maybe<Aggregate_Prof_Review_Rating_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Aggregate_Prof_Review_Rating_Stddev_Samp_Fields>;
  sum?: Maybe<Aggregate_Prof_Review_Rating_Sum_Fields>;
  var_pop?: Maybe<Aggregate_Prof_Review_Rating_Var_Pop_Fields>;
  var_samp?: Maybe<Aggregate_Prof_Review_Rating_Var_Samp_Fields>;
  variance?: Maybe<Aggregate_Prof_Review_Rating_Variance_Fields>;
};

/** aggregate fields of "aggregate.prof_review_rating" */
export type Aggregate_Prof_Review_Rating_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Aggregate_Prof_Review_Rating_Avg_Fields = {
  __typename?: 'aggregate_prof_review_rating_avg_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "aggregate.prof_review_rating". All fields are combined with a logical 'AND'. */
export type Aggregate_Prof_Review_Rating_Bool_Exp = {
  _and?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Bool_Exp>>;
  _not?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
  _or?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Bool_Exp>>;
  review_id?: InputMaybe<Int_Comparison_Exp>;
  upvote_count?: InputMaybe<Bigint_Comparison_Exp>;
};

/** input type for inserting data into table "aggregate.prof_review_rating" */
export type Aggregate_Prof_Review_Rating_Insert_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  upvote_count?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate max on columns */
export type Aggregate_Prof_Review_Rating_Max_Fields = {
  __typename?: 'aggregate_prof_review_rating_max_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate min on columns */
export type Aggregate_Prof_Review_Rating_Min_Fields = {
  __typename?: 'aggregate_prof_review_rating_min_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** input type for inserting object relation for remote table "aggregate.prof_review_rating" */
export type Aggregate_Prof_Review_Rating_Obj_Rel_Insert_Input = {
  data: Aggregate_Prof_Review_Rating_Insert_Input;
};

/** Ordering options when selecting data from "aggregate.prof_review_rating". */
export type Aggregate_Prof_Review_Rating_Order_By = {
  review_id?: InputMaybe<Order_By>;
  upvote_count?: InputMaybe<Order_By>;
};

/** select columns of table "aggregate.prof_review_rating" */
export enum Aggregate_Prof_Review_Rating_Select_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UpvoteCount = 'upvote_count',
}

/** aggregate stddev on columns */
export type Aggregate_Prof_Review_Rating_Stddev_Fields = {
  __typename?: 'aggregate_prof_review_rating_stddev_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Aggregate_Prof_Review_Rating_Stddev_Pop_Fields = {
  __typename?: 'aggregate_prof_review_rating_stddev_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Aggregate_Prof_Review_Rating_Stddev_Samp_Fields = {
  __typename?: 'aggregate_prof_review_rating_stddev_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "aggregate_prof_review_rating" */
export type Aggregate_Prof_Review_Rating_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Aggregate_Prof_Review_Rating_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Aggregate_Prof_Review_Rating_Stream_Cursor_Value_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  upvote_count?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate sum on columns */
export type Aggregate_Prof_Review_Rating_Sum_Fields = {
  __typename?: 'aggregate_prof_review_rating_sum_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  upvote_count?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate var_pop on columns */
export type Aggregate_Prof_Review_Rating_Var_Pop_Fields = {
  __typename?: 'aggregate_prof_review_rating_var_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Aggregate_Prof_Review_Rating_Var_Samp_Fields = {
  __typename?: 'aggregate_prof_review_rating_var_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Aggregate_Prof_Review_Rating_Variance_Fields = {
  __typename?: 'aggregate_prof_review_rating_variance_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  upvote_count?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export type Bigint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['bigint']['input']>;
  _gt?: InputMaybe<Scalars['bigint']['input']>;
  _gte?: InputMaybe<Scalars['bigint']['input']>;
  _in?: InputMaybe<Array<Scalars['bigint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['bigint']['input']>;
  _lte?: InputMaybe<Scalars['bigint']['input']>;
  _neq?: InputMaybe<Scalars['bigint']['input']>;
  _nin?: InputMaybe<Array<Scalars['bigint']['input']>>;
};

/** columns and relationships of "course" */
export type Course = {
  __typename?: 'course';
  antireqs?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  antirequisites: Array<Course_Antirequisite>;
  /** An aggregate relationship */
  antirequisites_aggregate: Course_Antirequisite_Aggregate;
  authoritative: Scalars['Boolean']['output'];
  code: Scalars['String']['output'];
  coreqs?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  course_easy_buckets: Array<Aggregate_Course_Easy_Buckets>;
  /** An aggregate relationship */
  course_easy_buckets_aggregate: Aggregate_Course_Easy_Buckets_Aggregate;
  /** An array relationship */
  course_useful_buckets: Array<Aggregate_Course_Useful_Buckets>;
  /** An aggregate relationship */
  course_useful_buckets_aggregate: Aggregate_Course_Useful_Buckets_Aggregate;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  /** An array relationship */
  postrequisites: Array<Course_Postrequisite>;
  /** An aggregate relationship */
  postrequisites_aggregate: Course_Postrequisite_Aggregate;
  prereqs?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  prerequisites: Array<Course_Prerequisite>;
  /** An aggregate relationship */
  prerequisites_aggregate: Course_Prerequisite_Aggregate;
  /** An array relationship */
  profs_teaching: Array<Prof_Teaches_Course>;
  /** An aggregate relationship */
  profs_teaching_aggregate: Prof_Teaches_Course_Aggregate;
  /** An object relationship */
  rating?: Maybe<Aggregate_Course_Rating>;
  /** An array relationship */
  reviews: Array<Review>;
  /** An aggregate relationship */
  reviews_aggregate: Review_Aggregate;
  /** An array relationship */
  sections: Array<Course_Section>;
  /** An aggregate relationship */
  sections_aggregate: Course_Section_Aggregate;
};

/** columns and relationships of "course" */
export type CourseAntirequisitesArgs = {
  distinct_on?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Antirequisite_Order_By>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseAntirequisites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Antirequisite_Order_By>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseCourse_Easy_BucketsArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseCourse_Easy_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseCourse_Useful_BucketsArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Course_Useful_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseCourse_Useful_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Course_Useful_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CoursePostrequisitesArgs = {
  distinct_on?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Postrequisite_Order_By>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CoursePostrequisites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Postrequisite_Order_By>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CoursePrerequisitesArgs = {
  distinct_on?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Prerequisite_Order_By>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CoursePrerequisites_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Prerequisite_Order_By>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseProfs_TeachingArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseProfs_Teaching_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseReviewsArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseReviews_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseSectionsArgs = {
  distinct_on?: InputMaybe<Array<Course_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Section_Order_By>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

/** columns and relationships of "course" */
export type CourseSections_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Section_Order_By>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

/** aggregated selection of "course" */
export type Course_Aggregate = {
  __typename?: 'course_aggregate';
  aggregate?: Maybe<Course_Aggregate_Fields>;
  nodes: Array<Course>;
};

/** aggregate fields of "course" */
export type Course_Aggregate_Fields = {
  __typename?: 'course_aggregate_fields';
  avg?: Maybe<Course_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Max_Fields>;
  min?: Maybe<Course_Min_Fields>;
  stddev?: Maybe<Course_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Sum_Fields>;
  var_pop?: Maybe<Course_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Var_Samp_Fields>;
  variance?: Maybe<Course_Variance_Fields>;
};

/** aggregate fields of "course" */
export type Course_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** columns and relationships of "course_antirequisite" */
export type Course_Antirequisite = {
  __typename?: 'course_antirequisite';
  /** An object relationship */
  antirequisite?: Maybe<Course>;
  antirequisite_id?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  course?: Maybe<Course>;
  course_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "course_antirequisite" */
export type Course_Antirequisite_Aggregate = {
  __typename?: 'course_antirequisite_aggregate';
  aggregate?: Maybe<Course_Antirequisite_Aggregate_Fields>;
  nodes: Array<Course_Antirequisite>;
};

export type Course_Antirequisite_Aggregate_Bool_Exp = {
  count?: InputMaybe<Course_Antirequisite_Aggregate_Bool_Exp_Count>;
};

export type Course_Antirequisite_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Antirequisite_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "course_antirequisite" */
export type Course_Antirequisite_Aggregate_Fields = {
  __typename?: 'course_antirequisite_aggregate_fields';
  avg?: Maybe<Course_Antirequisite_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Antirequisite_Max_Fields>;
  min?: Maybe<Course_Antirequisite_Min_Fields>;
  stddev?: Maybe<Course_Antirequisite_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Antirequisite_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Antirequisite_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Antirequisite_Sum_Fields>;
  var_pop?: Maybe<Course_Antirequisite_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Antirequisite_Var_Samp_Fields>;
  variance?: Maybe<Course_Antirequisite_Variance_Fields>;
};

/** aggregate fields of "course_antirequisite" */
export type Course_Antirequisite_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "course_antirequisite" */
export type Course_Antirequisite_Aggregate_Order_By = {
  avg?: InputMaybe<Course_Antirequisite_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Course_Antirequisite_Max_Order_By>;
  min?: InputMaybe<Course_Antirequisite_Min_Order_By>;
  stddev?: InputMaybe<Course_Antirequisite_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Course_Antirequisite_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Course_Antirequisite_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Course_Antirequisite_Sum_Order_By>;
  var_pop?: InputMaybe<Course_Antirequisite_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Course_Antirequisite_Var_Samp_Order_By>;
  variance?: InputMaybe<Course_Antirequisite_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "course_antirequisite" */
export type Course_Antirequisite_Arr_Rel_Insert_Input = {
  data: Array<Course_Antirequisite_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Course_Antirequisite_On_Conflict>;
};

/** aggregate avg on columns */
export type Course_Antirequisite_Avg_Fields = {
  __typename?: 'course_antirequisite_avg_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Avg_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "course_antirequisite". All fields are combined with a logical 'AND'. */
export type Course_Antirequisite_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Antirequisite_Bool_Exp>>;
  _not?: InputMaybe<Course_Antirequisite_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Antirequisite_Bool_Exp>>;
  antirequisite?: InputMaybe<Course_Bool_Exp>;
  antirequisite_id?: InputMaybe<Int_Comparison_Exp>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "course_antirequisite" */
export enum Course_Antirequisite_Constraint {
  /** unique or primary key constraint on columns "antirequisite_id", "course_id" */
  AntirequisiteUnique = 'antirequisite_unique',
}

/** input type for incrementing numeric columns in table "course_antirequisite" */
export type Course_Antirequisite_Inc_Input = {
  antirequisite_id?: InputMaybe<Scalars['Int']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "course_antirequisite" */
export type Course_Antirequisite_Insert_Input = {
  antirequisite?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  antirequisite_id?: InputMaybe<Scalars['Int']['input']>;
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Course_Antirequisite_Max_Fields = {
  __typename?: 'course_antirequisite_max_fields';
  antirequisite_id?: Maybe<Scalars['Int']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Max_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Course_Antirequisite_Min_Fields = {
  __typename?: 'course_antirequisite_min_fields';
  antirequisite_id?: Maybe<Scalars['Int']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Min_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "course_antirequisite" */
export type Course_Antirequisite_Mutation_Response = {
  __typename?: 'course_antirequisite_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Course_Antirequisite>;
};

/** on_conflict condition type for table "course_antirequisite" */
export type Course_Antirequisite_On_Conflict = {
  constraint: Course_Antirequisite_Constraint;
  update_columns?: Array<Course_Antirequisite_Update_Column>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

/** Ordering options when selecting data from "course_antirequisite". */
export type Course_Antirequisite_Order_By = {
  antirequisite?: InputMaybe<Course_Order_By>;
  antirequisite_id?: InputMaybe<Order_By>;
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** select columns of table "course_antirequisite" */
export enum Course_Antirequisite_Select_Column {
  /** column name */
  AntirequisiteId = 'antirequisite_id',
  /** column name */
  CourseId = 'course_id',
}

/** input type for updating data in table "course_antirequisite" */
export type Course_Antirequisite_Set_Input = {
  antirequisite_id?: InputMaybe<Scalars['Int']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Course_Antirequisite_Stddev_Fields = {
  __typename?: 'course_antirequisite_stddev_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Stddev_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Course_Antirequisite_Stddev_Pop_Fields = {
  __typename?: 'course_antirequisite_stddev_pop_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Stddev_Pop_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Course_Antirequisite_Stddev_Samp_Fields = {
  __typename?: 'course_antirequisite_stddev_samp_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Stddev_Samp_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "course_antirequisite" */
export type Course_Antirequisite_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Antirequisite_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Antirequisite_Stream_Cursor_Value_Input = {
  antirequisite_id?: InputMaybe<Scalars['Int']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Course_Antirequisite_Sum_Fields = {
  __typename?: 'course_antirequisite_sum_fields';
  antirequisite_id?: Maybe<Scalars['Int']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Sum_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** update columns of table "course_antirequisite" */
export enum Course_Antirequisite_Update_Column {
  /** column name */
  AntirequisiteId = 'antirequisite_id',
  /** column name */
  CourseId = 'course_id',
}

export type Course_Antirequisite_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Course_Antirequisite_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Course_Antirequisite_Set_Input>;
  /** filter the rows which have to be updated */
  where: Course_Antirequisite_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Course_Antirequisite_Var_Pop_Fields = {
  __typename?: 'course_antirequisite_var_pop_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Var_Pop_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Course_Antirequisite_Var_Samp_Fields = {
  __typename?: 'course_antirequisite_var_samp_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Var_Samp_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Course_Antirequisite_Variance_Fields = {
  __typename?: 'course_antirequisite_variance_fields';
  antirequisite_id?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "course_antirequisite" */
export type Course_Antirequisite_Variance_Order_By = {
  antirequisite_id?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
};

/** aggregate avg on columns */
export type Course_Avg_Fields = {
  __typename?: 'course_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "course". All fields are combined with a logical 'AND'. */
export type Course_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Bool_Exp>>;
  _not?: InputMaybe<Course_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Bool_Exp>>;
  antireqs?: InputMaybe<String_Comparison_Exp>;
  antirequisites?: InputMaybe<Course_Antirequisite_Bool_Exp>;
  antirequisites_aggregate?: InputMaybe<Course_Antirequisite_Aggregate_Bool_Exp>;
  authoritative?: InputMaybe<Boolean_Comparison_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  coreqs?: InputMaybe<String_Comparison_Exp>;
  course_easy_buckets?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
  course_easy_buckets_aggregate?: InputMaybe<Aggregate_Course_Easy_Buckets_Aggregate_Bool_Exp>;
  course_useful_buckets?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
  course_useful_buckets_aggregate?: InputMaybe<Aggregate_Course_Useful_Buckets_Aggregate_Bool_Exp>;
  description?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  postrequisites?: InputMaybe<Course_Postrequisite_Bool_Exp>;
  postrequisites_aggregate?: InputMaybe<Course_Postrequisite_Aggregate_Bool_Exp>;
  prereqs?: InputMaybe<String_Comparison_Exp>;
  prerequisites?: InputMaybe<Course_Prerequisite_Bool_Exp>;
  prerequisites_aggregate?: InputMaybe<Course_Prerequisite_Aggregate_Bool_Exp>;
  profs_teaching?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
  profs_teaching_aggregate?: InputMaybe<Prof_Teaches_Course_Aggregate_Bool_Exp>;
  rating?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
  reviews?: InputMaybe<Review_Bool_Exp>;
  reviews_aggregate?: InputMaybe<Review_Aggregate_Bool_Exp>;
  sections?: InputMaybe<Course_Section_Bool_Exp>;
  sections_aggregate?: InputMaybe<Course_Section_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "course" */
export enum Course_Constraint {
  /** unique or primary key constraint on columns "code" */
  CourseCodeUnique = 'course_code_unique',
  /** unique or primary key constraint on columns "id" */
  CoursePkey = 'course_pkey',
}

/** input type for incrementing numeric columns in table "course" */
export type Course_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "course" */
export type Course_Insert_Input = {
  antireqs?: InputMaybe<Scalars['String']['input']>;
  antirequisites?: InputMaybe<Course_Antirequisite_Arr_Rel_Insert_Input>;
  authoritative?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  coreqs?: InputMaybe<Scalars['String']['input']>;
  course_easy_buckets?: InputMaybe<Aggregate_Course_Easy_Buckets_Arr_Rel_Insert_Input>;
  course_useful_buckets?: InputMaybe<Aggregate_Course_Useful_Buckets_Arr_Rel_Insert_Input>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  postrequisites?: InputMaybe<Course_Postrequisite_Arr_Rel_Insert_Input>;
  prereqs?: InputMaybe<Scalars['String']['input']>;
  prerequisites?: InputMaybe<Course_Prerequisite_Arr_Rel_Insert_Input>;
  profs_teaching?: InputMaybe<Prof_Teaches_Course_Arr_Rel_Insert_Input>;
  rating?: InputMaybe<Aggregate_Course_Rating_Obj_Rel_Insert_Input>;
  reviews?: InputMaybe<Review_Arr_Rel_Insert_Input>;
  sections?: InputMaybe<Course_Section_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Course_Max_Fields = {
  __typename?: 'course_max_fields';
  antireqs?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  coreqs?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prereqs?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Course_Min_Fields = {
  __typename?: 'course_min_fields';
  antireqs?: Maybe<Scalars['String']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  coreqs?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prereqs?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "course" */
export type Course_Mutation_Response = {
  __typename?: 'course_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Course>;
};

/** input type for inserting object relation for remote table "course" */
export type Course_Obj_Rel_Insert_Input = {
  data: Course_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Course_On_Conflict>;
};

/** on_conflict condition type for table "course" */
export type Course_On_Conflict = {
  constraint: Course_Constraint;
  update_columns?: Array<Course_Update_Column>;
  where?: InputMaybe<Course_Bool_Exp>;
};

/** Ordering options when selecting data from "course". */
export type Course_Order_By = {
  antireqs?: InputMaybe<Order_By>;
  antirequisites_aggregate?: InputMaybe<Course_Antirequisite_Aggregate_Order_By>;
  authoritative?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  coreqs?: InputMaybe<Order_By>;
  course_easy_buckets_aggregate?: InputMaybe<Aggregate_Course_Easy_Buckets_Aggregate_Order_By>;
  course_useful_buckets_aggregate?: InputMaybe<Aggregate_Course_Useful_Buckets_Aggregate_Order_By>;
  description?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  postrequisites_aggregate?: InputMaybe<Course_Postrequisite_Aggregate_Order_By>;
  prereqs?: InputMaybe<Order_By>;
  prerequisites_aggregate?: InputMaybe<Course_Prerequisite_Aggregate_Order_By>;
  profs_teaching_aggregate?: InputMaybe<Prof_Teaches_Course_Aggregate_Order_By>;
  rating?: InputMaybe<Aggregate_Course_Rating_Order_By>;
  reviews_aggregate?: InputMaybe<Review_Aggregate_Order_By>;
  sections_aggregate?: InputMaybe<Course_Section_Aggregate_Order_By>;
};

/** primary key columns input for table: course */
export type Course_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** columns and relationships of "course_postrequisite" */
export type Course_Postrequisite = {
  __typename?: 'course_postrequisite';
  /** An object relationship */
  course?: Maybe<Course>;
  course_id?: Maybe<Scalars['Int']['output']>;
  is_corequisite?: Maybe<Scalars['Boolean']['output']>;
  /** An object relationship */
  postrequisite?: Maybe<Course>;
  postrequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "course_postrequisite" */
export type Course_Postrequisite_Aggregate = {
  __typename?: 'course_postrequisite_aggregate';
  aggregate?: Maybe<Course_Postrequisite_Aggregate_Fields>;
  nodes: Array<Course_Postrequisite>;
};

export type Course_Postrequisite_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Course_Postrequisite_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Course_Postrequisite_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Course_Postrequisite_Aggregate_Bool_Exp_Count>;
};

export type Course_Postrequisite_Aggregate_Bool_Exp_Bool_And = {
  arguments: Course_Postrequisite_Select_Column_Course_Postrequisite_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Postrequisite_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Course_Postrequisite_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Course_Postrequisite_Select_Column_Course_Postrequisite_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Postrequisite_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Course_Postrequisite_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Postrequisite_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "course_postrequisite" */
export type Course_Postrequisite_Aggregate_Fields = {
  __typename?: 'course_postrequisite_aggregate_fields';
  avg?: Maybe<Course_Postrequisite_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Postrequisite_Max_Fields>;
  min?: Maybe<Course_Postrequisite_Min_Fields>;
  stddev?: Maybe<Course_Postrequisite_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Postrequisite_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Postrequisite_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Postrequisite_Sum_Fields>;
  var_pop?: Maybe<Course_Postrequisite_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Postrequisite_Var_Samp_Fields>;
  variance?: Maybe<Course_Postrequisite_Variance_Fields>;
};

/** aggregate fields of "course_postrequisite" */
export type Course_Postrequisite_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "course_postrequisite" */
export type Course_Postrequisite_Aggregate_Order_By = {
  avg?: InputMaybe<Course_Postrequisite_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Course_Postrequisite_Max_Order_By>;
  min?: InputMaybe<Course_Postrequisite_Min_Order_By>;
  stddev?: InputMaybe<Course_Postrequisite_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Course_Postrequisite_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Course_Postrequisite_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Course_Postrequisite_Sum_Order_By>;
  var_pop?: InputMaybe<Course_Postrequisite_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Course_Postrequisite_Var_Samp_Order_By>;
  variance?: InputMaybe<Course_Postrequisite_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "course_postrequisite" */
export type Course_Postrequisite_Arr_Rel_Insert_Input = {
  data: Array<Course_Postrequisite_Insert_Input>;
};

/** aggregate avg on columns */
export type Course_Postrequisite_Avg_Fields = {
  __typename?: 'course_postrequisite_avg_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Avg_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "course_postrequisite". All fields are combined with a logical 'AND'. */
export type Course_Postrequisite_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Postrequisite_Bool_Exp>>;
  _not?: InputMaybe<Course_Postrequisite_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Postrequisite_Bool_Exp>>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  is_corequisite?: InputMaybe<Boolean_Comparison_Exp>;
  postrequisite?: InputMaybe<Course_Bool_Exp>;
  postrequisite_id?: InputMaybe<Int_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "course_postrequisite" */
export type Course_Postrequisite_Inc_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  postrequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "course_postrequisite" */
export type Course_Postrequisite_Insert_Input = {
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  is_corequisite?: InputMaybe<Scalars['Boolean']['input']>;
  postrequisite?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  postrequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Course_Postrequisite_Max_Fields = {
  __typename?: 'course_postrequisite_max_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  postrequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Max_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Course_Postrequisite_Min_Fields = {
  __typename?: 'course_postrequisite_min_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  postrequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Min_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "course_postrequisite" */
export type Course_Postrequisite_Mutation_Response = {
  __typename?: 'course_postrequisite_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Course_Postrequisite>;
};

/** Ordering options when selecting data from "course_postrequisite". */
export type Course_Postrequisite_Order_By = {
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  is_corequisite?: InputMaybe<Order_By>;
  postrequisite?: InputMaybe<Course_Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** select columns of table "course_postrequisite" */
export enum Course_Postrequisite_Select_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  IsCorequisite = 'is_corequisite',
  /** column name */
  PostrequisiteId = 'postrequisite_id',
}

/** select "course_postrequisite_aggregate_bool_exp_bool_and_arguments_columns" columns of table "course_postrequisite" */
export enum Course_Postrequisite_Select_Column_Course_Postrequisite_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsCorequisite = 'is_corequisite',
}

/** select "course_postrequisite_aggregate_bool_exp_bool_or_arguments_columns" columns of table "course_postrequisite" */
export enum Course_Postrequisite_Select_Column_Course_Postrequisite_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsCorequisite = 'is_corequisite',
}

/** input type for updating data in table "course_postrequisite" */
export type Course_Postrequisite_Set_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  is_corequisite?: InputMaybe<Scalars['Boolean']['input']>;
  postrequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Course_Postrequisite_Stddev_Fields = {
  __typename?: 'course_postrequisite_stddev_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Stddev_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Course_Postrequisite_Stddev_Pop_Fields = {
  __typename?: 'course_postrequisite_stddev_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Stddev_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Course_Postrequisite_Stddev_Samp_Fields = {
  __typename?: 'course_postrequisite_stddev_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Stddev_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "course_postrequisite" */
export type Course_Postrequisite_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Postrequisite_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Postrequisite_Stream_Cursor_Value_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  is_corequisite?: InputMaybe<Scalars['Boolean']['input']>;
  postrequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Course_Postrequisite_Sum_Fields = {
  __typename?: 'course_postrequisite_sum_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  postrequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Sum_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

export type Course_Postrequisite_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Course_Postrequisite_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Course_Postrequisite_Set_Input>;
  /** filter the rows which have to be updated */
  where: Course_Postrequisite_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Course_Postrequisite_Var_Pop_Fields = {
  __typename?: 'course_postrequisite_var_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Var_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Course_Postrequisite_Var_Samp_Fields = {
  __typename?: 'course_postrequisite_var_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Var_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Course_Postrequisite_Variance_Fields = {
  __typename?: 'course_postrequisite_variance_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  postrequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "course_postrequisite" */
export type Course_Postrequisite_Variance_Order_By = {
  course_id?: InputMaybe<Order_By>;
  postrequisite_id?: InputMaybe<Order_By>;
};

/** columns and relationships of "course_prerequisite" */
export type Course_Prerequisite = {
  __typename?: 'course_prerequisite';
  /** An object relationship */
  course?: Maybe<Course>;
  course_id?: Maybe<Scalars['Int']['output']>;
  is_corequisite: Scalars['Boolean']['output'];
  /** An object relationship */
  prerequisite?: Maybe<Course>;
  prerequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "course_prerequisite" */
export type Course_Prerequisite_Aggregate = {
  __typename?: 'course_prerequisite_aggregate';
  aggregate?: Maybe<Course_Prerequisite_Aggregate_Fields>;
  nodes: Array<Course_Prerequisite>;
};

export type Course_Prerequisite_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Course_Prerequisite_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Course_Prerequisite_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Course_Prerequisite_Aggregate_Bool_Exp_Count>;
};

export type Course_Prerequisite_Aggregate_Bool_Exp_Bool_And = {
  arguments: Course_Prerequisite_Select_Column_Course_Prerequisite_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Prerequisite_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Course_Prerequisite_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Course_Prerequisite_Select_Column_Course_Prerequisite_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Prerequisite_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Course_Prerequisite_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Prerequisite_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "course_prerequisite" */
export type Course_Prerequisite_Aggregate_Fields = {
  __typename?: 'course_prerequisite_aggregate_fields';
  avg?: Maybe<Course_Prerequisite_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Prerequisite_Max_Fields>;
  min?: Maybe<Course_Prerequisite_Min_Fields>;
  stddev?: Maybe<Course_Prerequisite_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Prerequisite_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Prerequisite_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Prerequisite_Sum_Fields>;
  var_pop?: Maybe<Course_Prerequisite_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Prerequisite_Var_Samp_Fields>;
  variance?: Maybe<Course_Prerequisite_Variance_Fields>;
};

/** aggregate fields of "course_prerequisite" */
export type Course_Prerequisite_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "course_prerequisite" */
export type Course_Prerequisite_Aggregate_Order_By = {
  avg?: InputMaybe<Course_Prerequisite_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Course_Prerequisite_Max_Order_By>;
  min?: InputMaybe<Course_Prerequisite_Min_Order_By>;
  stddev?: InputMaybe<Course_Prerequisite_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Course_Prerequisite_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Course_Prerequisite_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Course_Prerequisite_Sum_Order_By>;
  var_pop?: InputMaybe<Course_Prerequisite_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Course_Prerequisite_Var_Samp_Order_By>;
  variance?: InputMaybe<Course_Prerequisite_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "course_prerequisite" */
export type Course_Prerequisite_Arr_Rel_Insert_Input = {
  data: Array<Course_Prerequisite_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Course_Prerequisite_On_Conflict>;
};

/** aggregate avg on columns */
export type Course_Prerequisite_Avg_Fields = {
  __typename?: 'course_prerequisite_avg_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Avg_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "course_prerequisite". All fields are combined with a logical 'AND'. */
export type Course_Prerequisite_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Prerequisite_Bool_Exp>>;
  _not?: InputMaybe<Course_Prerequisite_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Prerequisite_Bool_Exp>>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  is_corequisite?: InputMaybe<Boolean_Comparison_Exp>;
  prerequisite?: InputMaybe<Course_Bool_Exp>;
  prerequisite_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "course_prerequisite" */
export enum Course_Prerequisite_Constraint {
  /** unique or primary key constraint on columns "prerequisite_id", "course_id" */
  PrerequisiteUnique = 'prerequisite_unique',
}

/** input type for incrementing numeric columns in table "course_prerequisite" */
export type Course_Prerequisite_Inc_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  prerequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "course_prerequisite" */
export type Course_Prerequisite_Insert_Input = {
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  is_corequisite?: InputMaybe<Scalars['Boolean']['input']>;
  prerequisite?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  prerequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Course_Prerequisite_Max_Fields = {
  __typename?: 'course_prerequisite_max_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  prerequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Max_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Course_Prerequisite_Min_Fields = {
  __typename?: 'course_prerequisite_min_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  prerequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Min_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "course_prerequisite" */
export type Course_Prerequisite_Mutation_Response = {
  __typename?: 'course_prerequisite_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Course_Prerequisite>;
};

/** on_conflict condition type for table "course_prerequisite" */
export type Course_Prerequisite_On_Conflict = {
  constraint: Course_Prerequisite_Constraint;
  update_columns?: Array<Course_Prerequisite_Update_Column>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

/** Ordering options when selecting data from "course_prerequisite". */
export type Course_Prerequisite_Order_By = {
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  is_corequisite?: InputMaybe<Order_By>;
  prerequisite?: InputMaybe<Course_Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** select columns of table "course_prerequisite" */
export enum Course_Prerequisite_Select_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  IsCorequisite = 'is_corequisite',
  /** column name */
  PrerequisiteId = 'prerequisite_id',
}

/** select "course_prerequisite_aggregate_bool_exp_bool_and_arguments_columns" columns of table "course_prerequisite" */
export enum Course_Prerequisite_Select_Column_Course_Prerequisite_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsCorequisite = 'is_corequisite',
}

/** select "course_prerequisite_aggregate_bool_exp_bool_or_arguments_columns" columns of table "course_prerequisite" */
export enum Course_Prerequisite_Select_Column_Course_Prerequisite_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsCorequisite = 'is_corequisite',
}

/** input type for updating data in table "course_prerequisite" */
export type Course_Prerequisite_Set_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  is_corequisite?: InputMaybe<Scalars['Boolean']['input']>;
  prerequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Course_Prerequisite_Stddev_Fields = {
  __typename?: 'course_prerequisite_stddev_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Stddev_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Course_Prerequisite_Stddev_Pop_Fields = {
  __typename?: 'course_prerequisite_stddev_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Stddev_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Course_Prerequisite_Stddev_Samp_Fields = {
  __typename?: 'course_prerequisite_stddev_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Stddev_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "course_prerequisite" */
export type Course_Prerequisite_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Prerequisite_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Prerequisite_Stream_Cursor_Value_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  is_corequisite?: InputMaybe<Scalars['Boolean']['input']>;
  prerequisite_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Course_Prerequisite_Sum_Fields = {
  __typename?: 'course_prerequisite_sum_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  prerequisite_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Sum_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** update columns of table "course_prerequisite" */
export enum Course_Prerequisite_Update_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  IsCorequisite = 'is_corequisite',
  /** column name */
  PrerequisiteId = 'prerequisite_id',
}

export type Course_Prerequisite_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Course_Prerequisite_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Course_Prerequisite_Set_Input>;
  /** filter the rows which have to be updated */
  where: Course_Prerequisite_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Course_Prerequisite_Var_Pop_Fields = {
  __typename?: 'course_prerequisite_var_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Var_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Course_Prerequisite_Var_Samp_Fields = {
  __typename?: 'course_prerequisite_var_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Var_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Course_Prerequisite_Variance_Fields = {
  __typename?: 'course_prerequisite_variance_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prerequisite_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "course_prerequisite" */
export type Course_Prerequisite_Variance_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prerequisite_id?: InputMaybe<Order_By>;
};

/** columns and relationships of "course_review_upvote" */
export type Course_Review_Upvote = {
  __typename?: 'course_review_upvote';
  review_id: Scalars['Int']['output'];
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "course_review_upvote" */
export type Course_Review_Upvote_Aggregate = {
  __typename?: 'course_review_upvote_aggregate';
  aggregate?: Maybe<Course_Review_Upvote_Aggregate_Fields>;
  nodes: Array<Course_Review_Upvote>;
};

export type Course_Review_Upvote_Aggregate_Bool_Exp = {
  count?: InputMaybe<Course_Review_Upvote_Aggregate_Bool_Exp_Count>;
};

export type Course_Review_Upvote_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "course_review_upvote" */
export type Course_Review_Upvote_Aggregate_Fields = {
  __typename?: 'course_review_upvote_aggregate_fields';
  avg?: Maybe<Course_Review_Upvote_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Review_Upvote_Max_Fields>;
  min?: Maybe<Course_Review_Upvote_Min_Fields>;
  stddev?: Maybe<Course_Review_Upvote_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Review_Upvote_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Review_Upvote_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Review_Upvote_Sum_Fields>;
  var_pop?: Maybe<Course_Review_Upvote_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Review_Upvote_Var_Samp_Fields>;
  variance?: Maybe<Course_Review_Upvote_Variance_Fields>;
};

/** aggregate fields of "course_review_upvote" */
export type Course_Review_Upvote_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "course_review_upvote" */
export type Course_Review_Upvote_Aggregate_Order_By = {
  avg?: InputMaybe<Course_Review_Upvote_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Course_Review_Upvote_Max_Order_By>;
  min?: InputMaybe<Course_Review_Upvote_Min_Order_By>;
  stddev?: InputMaybe<Course_Review_Upvote_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Course_Review_Upvote_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Course_Review_Upvote_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Course_Review_Upvote_Sum_Order_By>;
  var_pop?: InputMaybe<Course_Review_Upvote_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Course_Review_Upvote_Var_Samp_Order_By>;
  variance?: InputMaybe<Course_Review_Upvote_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "course_review_upvote" */
export type Course_Review_Upvote_Arr_Rel_Insert_Input = {
  data: Array<Course_Review_Upvote_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Course_Review_Upvote_On_Conflict>;
};

/** aggregate avg on columns */
export type Course_Review_Upvote_Avg_Fields = {
  __typename?: 'course_review_upvote_avg_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Avg_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "course_review_upvote". All fields are combined with a logical 'AND'. */
export type Course_Review_Upvote_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Review_Upvote_Bool_Exp>>;
  _not?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Review_Upvote_Bool_Exp>>;
  review_id?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "course_review_upvote" */
export enum Course_Review_Upvote_Constraint {
  /** unique or primary key constraint on columns "user_id", "review_id" */
  CourseReviewUpvoteUnique = 'course_review_upvote_unique',
}

/** input type for incrementing numeric columns in table "course_review_upvote" */
export type Course_Review_Upvote_Inc_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "course_review_upvote" */
export type Course_Review_Upvote_Insert_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Course_Review_Upvote_Max_Fields = {
  __typename?: 'course_review_upvote_max_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Max_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Course_Review_Upvote_Min_Fields = {
  __typename?: 'course_review_upvote_min_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Min_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "course_review_upvote" */
export type Course_Review_Upvote_Mutation_Response = {
  __typename?: 'course_review_upvote_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Course_Review_Upvote>;
};

/** on_conflict condition type for table "course_review_upvote" */
export type Course_Review_Upvote_On_Conflict = {
  constraint: Course_Review_Upvote_Constraint;
  update_columns?: Array<Course_Review_Upvote_Update_Column>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

/** Ordering options when selecting data from "course_review_upvote". */
export type Course_Review_Upvote_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "course_review_upvote" */
export enum Course_Review_Upvote_Select_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "course_review_upvote" */
export type Course_Review_Upvote_Set_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Course_Review_Upvote_Stddev_Fields = {
  __typename?: 'course_review_upvote_stddev_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Stddev_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Course_Review_Upvote_Stddev_Pop_Fields = {
  __typename?: 'course_review_upvote_stddev_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Stddev_Pop_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Course_Review_Upvote_Stddev_Samp_Fields = {
  __typename?: 'course_review_upvote_stddev_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Stddev_Samp_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "course_review_upvote" */
export type Course_Review_Upvote_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Review_Upvote_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Review_Upvote_Stream_Cursor_Value_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Course_Review_Upvote_Sum_Fields = {
  __typename?: 'course_review_upvote_sum_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Sum_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** update columns of table "course_review_upvote" */
export enum Course_Review_Upvote_Update_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UserId = 'user_id',
}

export type Course_Review_Upvote_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Course_Review_Upvote_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Course_Review_Upvote_Set_Input>;
  /** filter the rows which have to be updated */
  where: Course_Review_Upvote_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Course_Review_Upvote_Var_Pop_Fields = {
  __typename?: 'course_review_upvote_var_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Var_Pop_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Course_Review_Upvote_Var_Samp_Fields = {
  __typename?: 'course_review_upvote_var_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Var_Samp_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Course_Review_Upvote_Variance_Fields = {
  __typename?: 'course_review_upvote_variance_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "course_review_upvote" */
export type Course_Review_Upvote_Variance_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** columns and relationships of "course_search_index" */
export type Course_Search_Index = {
  __typename?: 'course_search_index';
  code?: Maybe<Scalars['String']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  course_letters?: Maybe<Scalars['String']['output']>;
  document?: Maybe<Scalars['tsvector']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  has_prereqs?: Maybe<Scalars['Boolean']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prof_ids?: Maybe<Scalars['_int4']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
  terms?: Maybe<Scalars['_int4']['output']>;
  terms_with_online_sections?: Maybe<Scalars['_int4']['output']>;
  terms_with_seats?: Maybe<Scalars['_int4']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** aggregated selection of "course_search_index" */
export type Course_Search_Index_Aggregate = {
  __typename?: 'course_search_index_aggregate';
  aggregate?: Maybe<Course_Search_Index_Aggregate_Fields>;
  nodes: Array<Course_Search_Index>;
};

/** aggregate fields of "course_search_index" */
export type Course_Search_Index_Aggregate_Fields = {
  __typename?: 'course_search_index_aggregate_fields';
  avg?: Maybe<Course_Search_Index_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Search_Index_Max_Fields>;
  min?: Maybe<Course_Search_Index_Min_Fields>;
  stddev?: Maybe<Course_Search_Index_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Search_Index_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Search_Index_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Search_Index_Sum_Fields>;
  var_pop?: Maybe<Course_Search_Index_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Search_Index_Var_Samp_Fields>;
  variance?: Maybe<Course_Search_Index_Variance_Fields>;
};

/** aggregate fields of "course_search_index" */
export type Course_Search_Index_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Course_Search_Index_Avg_Fields = {
  __typename?: 'course_search_index_avg_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "course_search_index". All fields are combined with a logical 'AND'. */
export type Course_Search_Index_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Search_Index_Bool_Exp>>;
  _not?: InputMaybe<Course_Search_Index_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Search_Index_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  course_letters?: InputMaybe<String_Comparison_Exp>;
  document?: InputMaybe<Tsvector_Comparison_Exp>;
  easy?: InputMaybe<Numeric_Comparison_Exp>;
  has_prereqs?: InputMaybe<Boolean_Comparison_Exp>;
  liked?: InputMaybe<Numeric_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  prof_ids?: InputMaybe<_Int4_Comparison_Exp>;
  ratings?: InputMaybe<Bigint_Comparison_Exp>;
  terms?: InputMaybe<_Int4_Comparison_Exp>;
  terms_with_online_sections?: InputMaybe<_Int4_Comparison_Exp>;
  terms_with_seats?: InputMaybe<_Int4_Comparison_Exp>;
  useful?: InputMaybe<Numeric_Comparison_Exp>;
};

/** aggregate max on columns */
export type Course_Search_Index_Max_Fields = {
  __typename?: 'course_search_index_max_fields';
  code?: Maybe<Scalars['String']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  course_letters?: Maybe<Scalars['String']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** aggregate min on columns */
export type Course_Search_Index_Min_Fields = {
  __typename?: 'course_search_index_min_fields';
  code?: Maybe<Scalars['String']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  course_letters?: Maybe<Scalars['String']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** Ordering options when selecting data from "course_search_index". */
export type Course_Search_Index_Order_By = {
  code?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_letters?: InputMaybe<Order_By>;
  document?: InputMaybe<Order_By>;
  easy?: InputMaybe<Order_By>;
  has_prereqs?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  prof_ids?: InputMaybe<Order_By>;
  ratings?: InputMaybe<Order_By>;
  terms?: InputMaybe<Order_By>;
  terms_with_online_sections?: InputMaybe<Order_By>;
  terms_with_seats?: InputMaybe<Order_By>;
  useful?: InputMaybe<Order_By>;
};

/** select columns of table "course_search_index" */
export enum Course_Search_Index_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  CourseLetters = 'course_letters',
  /** column name */
  Document = 'document',
  /** column name */
  Easy = 'easy',
  /** column name */
  HasPrereqs = 'has_prereqs',
  /** column name */
  Liked = 'liked',
  /** column name */
  Name = 'name',
  /** column name */
  ProfIds = 'prof_ids',
  /** column name */
  Ratings = 'ratings',
  /** column name */
  Terms = 'terms',
  /** column name */
  TermsWithOnlineSections = 'terms_with_online_sections',
  /** column name */
  TermsWithSeats = 'terms_with_seats',
  /** column name */
  Useful = 'useful',
}

/** aggregate stddev on columns */
export type Course_Search_Index_Stddev_Fields = {
  __typename?: 'course_search_index_stddev_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Course_Search_Index_Stddev_Pop_Fields = {
  __typename?: 'course_search_index_stddev_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Course_Search_Index_Stddev_Samp_Fields = {
  __typename?: 'course_search_index_stddev_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "course_search_index" */
export type Course_Search_Index_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Search_Index_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Search_Index_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  course_letters?: InputMaybe<Scalars['String']['input']>;
  document?: InputMaybe<Scalars['tsvector']['input']>;
  easy?: InputMaybe<Scalars['numeric']['input']>;
  has_prereqs?: InputMaybe<Scalars['Boolean']['input']>;
  liked?: InputMaybe<Scalars['numeric']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  prof_ids?: InputMaybe<Scalars['_int4']['input']>;
  ratings?: InputMaybe<Scalars['bigint']['input']>;
  terms?: InputMaybe<Scalars['_int4']['input']>;
  terms_with_online_sections?: InputMaybe<Scalars['_int4']['input']>;
  terms_with_seats?: InputMaybe<Scalars['_int4']['input']>;
  useful?: InputMaybe<Scalars['numeric']['input']>;
};

/** aggregate sum on columns */
export type Course_Search_Index_Sum_Fields = {
  __typename?: 'course_search_index_sum_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  easy?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
  useful?: Maybe<Scalars['numeric']['output']>;
};

/** aggregate var_pop on columns */
export type Course_Search_Index_Var_Pop_Fields = {
  __typename?: 'course_search_index_var_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Course_Search_Index_Var_Samp_Fields = {
  __typename?: 'course_search_index_var_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Course_Search_Index_Variance_Fields = {
  __typename?: 'course_search_index_variance_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  easy?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
  useful?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "course_section" */
export type Course_Section = {
  __typename?: 'course_section';
  class_number: Scalars['Int']['output'];
  /** An object relationship */
  course: Course;
  course_id: Scalars['Int']['output'];
  enrollment_capacity: Scalars['Int']['output'];
  enrollment_total: Scalars['Int']['output'];
  /** An array relationship */
  exams: Array<Section_Exam>;
  /** An aggregate relationship */
  exams_aggregate: Section_Exam_Aggregate;
  id: Scalars['Int']['output'];
  is_online: Scalars['Boolean']['output'];
  /** An array relationship */
  meetings: Array<Section_Meeting>;
  /** An aggregate relationship */
  meetings_aggregate: Section_Meeting_Aggregate;
  section_name: Scalars['String']['output'];
  term_id: Scalars['Int']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** columns and relationships of "course_section" */
export type Course_SectionExamsArgs = {
  distinct_on?: InputMaybe<Array<Section_Exam_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Exam_Order_By>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

/** columns and relationships of "course_section" */
export type Course_SectionExams_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Section_Exam_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Exam_Order_By>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

/** columns and relationships of "course_section" */
export type Course_SectionMeetingsArgs = {
  distinct_on?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Meeting_Order_By>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

/** columns and relationships of "course_section" */
export type Course_SectionMeetings_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Meeting_Order_By>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

/** aggregated selection of "course_section" */
export type Course_Section_Aggregate = {
  __typename?: 'course_section_aggregate';
  aggregate?: Maybe<Course_Section_Aggregate_Fields>;
  nodes: Array<Course_Section>;
};

export type Course_Section_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Course_Section_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Course_Section_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Course_Section_Aggregate_Bool_Exp_Count>;
};

export type Course_Section_Aggregate_Bool_Exp_Bool_And = {
  arguments: Course_Section_Select_Column_Course_Section_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Section_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Course_Section_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Course_Section_Select_Column_Course_Section_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Section_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Course_Section_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Course_Section_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Course_Section_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "course_section" */
export type Course_Section_Aggregate_Fields = {
  __typename?: 'course_section_aggregate_fields';
  avg?: Maybe<Course_Section_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Course_Section_Max_Fields>;
  min?: Maybe<Course_Section_Min_Fields>;
  stddev?: Maybe<Course_Section_Stddev_Fields>;
  stddev_pop?: Maybe<Course_Section_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Course_Section_Stddev_Samp_Fields>;
  sum?: Maybe<Course_Section_Sum_Fields>;
  var_pop?: Maybe<Course_Section_Var_Pop_Fields>;
  var_samp?: Maybe<Course_Section_Var_Samp_Fields>;
  variance?: Maybe<Course_Section_Variance_Fields>;
};

/** aggregate fields of "course_section" */
export type Course_Section_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Course_Section_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "course_section" */
export type Course_Section_Aggregate_Order_By = {
  avg?: InputMaybe<Course_Section_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Course_Section_Max_Order_By>;
  min?: InputMaybe<Course_Section_Min_Order_By>;
  stddev?: InputMaybe<Course_Section_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Course_Section_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Course_Section_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Course_Section_Sum_Order_By>;
  var_pop?: InputMaybe<Course_Section_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Course_Section_Var_Samp_Order_By>;
  variance?: InputMaybe<Course_Section_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "course_section" */
export type Course_Section_Arr_Rel_Insert_Input = {
  data: Array<Course_Section_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Course_Section_On_Conflict>;
};

/** aggregate avg on columns */
export type Course_Section_Avg_Fields = {
  __typename?: 'course_section_avg_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "course_section" */
export type Course_Section_Avg_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "course_section". All fields are combined with a logical 'AND'. */
export type Course_Section_Bool_Exp = {
  _and?: InputMaybe<Array<Course_Section_Bool_Exp>>;
  _not?: InputMaybe<Course_Section_Bool_Exp>;
  _or?: InputMaybe<Array<Course_Section_Bool_Exp>>;
  class_number?: InputMaybe<Int_Comparison_Exp>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  enrollment_capacity?: InputMaybe<Int_Comparison_Exp>;
  enrollment_total?: InputMaybe<Int_Comparison_Exp>;
  exams?: InputMaybe<Section_Exam_Bool_Exp>;
  exams_aggregate?: InputMaybe<Section_Exam_Aggregate_Bool_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  is_online?: InputMaybe<Boolean_Comparison_Exp>;
  meetings?: InputMaybe<Section_Meeting_Bool_Exp>;
  meetings_aggregate?: InputMaybe<Section_Meeting_Aggregate_Bool_Exp>;
  section_name?: InputMaybe<String_Comparison_Exp>;
  term_id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "course_section" */
export enum Course_Section_Constraint {
  /** unique or primary key constraint on columns "class_number", "term_id" */
  ClassNumberUniqueToTerm = 'class_number_unique_to_term',
  /** unique or primary key constraint on columns "id" */
  CourseSectionPkey = 'course_section_pkey',
}

/** input type for incrementing numeric columns in table "course_section" */
export type Course_Section_Inc_Input = {
  class_number?: InputMaybe<Scalars['Int']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  enrollment_capacity?: InputMaybe<Scalars['Int']['input']>;
  enrollment_total?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "course_section" */
export type Course_Section_Insert_Input = {
  class_number?: InputMaybe<Scalars['Int']['input']>;
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  enrollment_capacity?: InputMaybe<Scalars['Int']['input']>;
  enrollment_total?: InputMaybe<Scalars['Int']['input']>;
  exams?: InputMaybe<Section_Exam_Arr_Rel_Insert_Input>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_online?: InputMaybe<Scalars['Boolean']['input']>;
  meetings?: InputMaybe<Section_Meeting_Arr_Rel_Insert_Input>;
  section_name?: InputMaybe<Scalars['String']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Course_Section_Max_Fields = {
  __typename?: 'course_section_max_fields';
  class_number?: Maybe<Scalars['Int']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  enrollment_capacity?: Maybe<Scalars['Int']['output']>;
  enrollment_total?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  section_name?: Maybe<Scalars['String']['output']>;
  term_id?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by max() on columns of table "course_section" */
export type Course_Section_Max_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section_name?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Course_Section_Min_Fields = {
  __typename?: 'course_section_min_fields';
  class_number?: Maybe<Scalars['Int']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  enrollment_capacity?: Maybe<Scalars['Int']['output']>;
  enrollment_total?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  section_name?: Maybe<Scalars['String']['output']>;
  term_id?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** order by min() on columns of table "course_section" */
export type Course_Section_Min_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section_name?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "course_section" */
export type Course_Section_Mutation_Response = {
  __typename?: 'course_section_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Course_Section>;
};

/** input type for inserting object relation for remote table "course_section" */
export type Course_Section_Obj_Rel_Insert_Input = {
  data: Course_Section_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Course_Section_On_Conflict>;
};

/** on_conflict condition type for table "course_section" */
export type Course_Section_On_Conflict = {
  constraint: Course_Section_Constraint;
  update_columns?: Array<Course_Section_Update_Column>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

/** Ordering options when selecting data from "course_section". */
export type Course_Section_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  exams_aggregate?: InputMaybe<Section_Exam_Aggregate_Order_By>;
  id?: InputMaybe<Order_By>;
  is_online?: InputMaybe<Order_By>;
  meetings_aggregate?: InputMaybe<Section_Meeting_Aggregate_Order_By>;
  section_name?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: course_section */
export type Course_Section_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "course_section" */
export enum Course_Section_Select_Column {
  /** column name */
  ClassNumber = 'class_number',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  EnrollmentCapacity = 'enrollment_capacity',
  /** column name */
  EnrollmentTotal = 'enrollment_total',
  /** column name */
  Id = 'id',
  /** column name */
  IsOnline = 'is_online',
  /** column name */
  SectionName = 'section_name',
  /** column name */
  TermId = 'term_id',
  /** column name */
  UpdatedAt = 'updated_at',
}

/** select "course_section_aggregate_bool_exp_bool_and_arguments_columns" columns of table "course_section" */
export enum Course_Section_Select_Column_Course_Section_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsOnline = 'is_online',
}

/** select "course_section_aggregate_bool_exp_bool_or_arguments_columns" columns of table "course_section" */
export enum Course_Section_Select_Column_Course_Section_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsOnline = 'is_online',
}

/** input type for updating data in table "course_section" */
export type Course_Section_Set_Input = {
  class_number?: InputMaybe<Scalars['Int']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  enrollment_capacity?: InputMaybe<Scalars['Int']['input']>;
  enrollment_total?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_online?: InputMaybe<Scalars['Boolean']['input']>;
  section_name?: InputMaybe<Scalars['String']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate stddev on columns */
export type Course_Section_Stddev_Fields = {
  __typename?: 'course_section_stddev_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "course_section" */
export type Course_Section_Stddev_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Course_Section_Stddev_Pop_Fields = {
  __typename?: 'course_section_stddev_pop_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "course_section" */
export type Course_Section_Stddev_Pop_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Course_Section_Stddev_Samp_Fields = {
  __typename?: 'course_section_stddev_samp_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "course_section" */
export type Course_Section_Stddev_Samp_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "course_section" */
export type Course_Section_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Section_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Section_Stream_Cursor_Value_Input = {
  class_number?: InputMaybe<Scalars['Int']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  enrollment_capacity?: InputMaybe<Scalars['Int']['input']>;
  enrollment_total?: InputMaybe<Scalars['Int']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  is_online?: InputMaybe<Scalars['Boolean']['input']>;
  section_name?: InputMaybe<Scalars['String']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate sum on columns */
export type Course_Section_Sum_Fields = {
  __typename?: 'course_section_sum_fields';
  class_number?: Maybe<Scalars['Int']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  enrollment_capacity?: Maybe<Scalars['Int']['output']>;
  enrollment_total?: Maybe<Scalars['Int']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  term_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "course_section" */
export type Course_Section_Sum_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** update columns of table "course_section" */
export enum Course_Section_Update_Column {
  /** column name */
  ClassNumber = 'class_number',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  EnrollmentCapacity = 'enrollment_capacity',
  /** column name */
  EnrollmentTotal = 'enrollment_total',
  /** column name */
  Id = 'id',
  /** column name */
  IsOnline = 'is_online',
  /** column name */
  SectionName = 'section_name',
  /** column name */
  TermId = 'term_id',
  /** column name */
  UpdatedAt = 'updated_at',
}

export type Course_Section_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Course_Section_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Course_Section_Set_Input>;
  /** filter the rows which have to be updated */
  where: Course_Section_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Course_Section_Var_Pop_Fields = {
  __typename?: 'course_section_var_pop_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "course_section" */
export type Course_Section_Var_Pop_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Course_Section_Var_Samp_Fields = {
  __typename?: 'course_section_var_samp_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "course_section" */
export type Course_Section_Var_Samp_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Course_Section_Variance_Fields = {
  __typename?: 'course_section_variance_fields';
  class_number?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  enrollment_capacity?: Maybe<Scalars['Float']['output']>;
  enrollment_total?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "course_section" */
export type Course_Section_Variance_Order_By = {
  class_number?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  enrollment_capacity?: InputMaybe<Order_By>;
  enrollment_total?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
};

/** select columns of table "course" */
export enum Course_Select_Column {
  /** column name */
  Antireqs = 'antireqs',
  /** column name */
  Authoritative = 'authoritative',
  /** column name */
  Code = 'code',
  /** column name */
  Coreqs = 'coreqs',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Prereqs = 'prereqs',
}

/** input type for updating data in table "course" */
export type Course_Set_Input = {
  antireqs?: InputMaybe<Scalars['String']['input']>;
  authoritative?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  coreqs?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  prereqs?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Course_Stddev_Fields = {
  __typename?: 'course_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Course_Stddev_Pop_Fields = {
  __typename?: 'course_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Course_Stddev_Samp_Fields = {
  __typename?: 'course_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "course" */
export type Course_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Course_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Course_Stream_Cursor_Value_Input = {
  antireqs?: InputMaybe<Scalars['String']['input']>;
  authoritative?: InputMaybe<Scalars['Boolean']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  coreqs?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  prereqs?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Course_Sum_Fields = {
  __typename?: 'course_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "course" */
export enum Course_Update_Column {
  /** column name */
  Antireqs = 'antireqs',
  /** column name */
  Authoritative = 'authoritative',
  /** column name */
  Code = 'code',
  /** column name */
  Coreqs = 'coreqs',
  /** column name */
  Description = 'description',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  Prereqs = 'prereqs',
}

export type Course_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Course_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Course_Set_Input>;
  /** filter the rows which have to be updated */
  where: Course_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Course_Var_Pop_Fields = {
  __typename?: 'course_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Course_Var_Samp_Fields = {
  __typename?: 'course_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Course_Variance_Fields = {
  __typename?: 'course_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC',
}

/** Boolean expression to compare columns of type "date". All fields are combined with logical 'AND'. */
export type Date_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['date']['input']>;
  _gt?: InputMaybe<Scalars['date']['input']>;
  _gte?: InputMaybe<Scalars['date']['input']>;
  _in?: InputMaybe<Array<Scalars['date']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['date']['input']>;
  _lte?: InputMaybe<Scalars['date']['input']>;
  _neq?: InputMaybe<Scalars['date']['input']>;
  _nin?: InputMaybe<Array<Scalars['date']['input']>>;
};

/** Boolean expression to compare columns of type "join_source". All fields are combined with logical 'AND'. */
export type Join_Source_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['join_source']['input']>;
  _gt?: InputMaybe<Scalars['join_source']['input']>;
  _gte?: InputMaybe<Scalars['join_source']['input']>;
  _in?: InputMaybe<Array<Scalars['join_source']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['join_source']['input']>;
  _lte?: InputMaybe<Scalars['join_source']['input']>;
  _neq?: InputMaybe<Scalars['join_source']['input']>;
  _nin?: InputMaybe<Array<Scalars['join_source']['input']>>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** delete data from the table: "course" */
  delete_course?: Maybe<Course_Mutation_Response>;
  /** delete data from the table: "course_antirequisite" */
  delete_course_antirequisite?: Maybe<Course_Antirequisite_Mutation_Response>;
  /** delete single row from the table: "course" */
  delete_course_by_pk?: Maybe<Course>;
  /** delete data from the table: "course_postrequisite" */
  delete_course_postrequisite?: Maybe<Course_Postrequisite_Mutation_Response>;
  /** delete data from the table: "course_prerequisite" */
  delete_course_prerequisite?: Maybe<Course_Prerequisite_Mutation_Response>;
  /** delete data from the table: "course_review_upvote" */
  delete_course_review_upvote?: Maybe<Course_Review_Upvote_Mutation_Response>;
  /** delete data from the table: "course_section" */
  delete_course_section?: Maybe<Course_Section_Mutation_Response>;
  /** delete single row from the table: "course_section" */
  delete_course_section_by_pk?: Maybe<Course_Section>;
  /** delete data from the table: "prof" */
  delete_prof?: Maybe<Prof_Mutation_Response>;
  /** delete single row from the table: "prof" */
  delete_prof_by_pk?: Maybe<Prof>;
  /** delete data from the table: "prof_review_upvote" */
  delete_prof_review_upvote?: Maybe<Prof_Review_Upvote_Mutation_Response>;
  /** delete data from the table: "queue.section_subscribed" */
  delete_queue_section_subscribed?: Maybe<Queue_Section_Subscribed_Mutation_Response>;
  /** delete single row from the table: "queue.section_subscribed" */
  delete_queue_section_subscribed_by_pk?: Maybe<Queue_Section_Subscribed>;
  /** delete data from the table: "review" */
  delete_review?: Maybe<Review_Mutation_Response>;
  /** delete single row from the table: "review" */
  delete_review_by_pk?: Maybe<Review>;
  /** delete data from the table: "review_user_id" */
  delete_review_user_id?: Maybe<Review_User_Id_Mutation_Response>;
  /** delete data from the table: "section_exam" */
  delete_section_exam?: Maybe<Section_Exam_Mutation_Response>;
  /** delete data from the table: "section_meeting" */
  delete_section_meeting?: Maybe<Section_Meeting_Mutation_Response>;
  /** delete data from the table: "user" */
  delete_user?: Maybe<User_Mutation_Response>;
  /** delete single row from the table: "user" */
  delete_user_by_pk?: Maybe<User>;
  /** delete data from the table: "user_course_taken" */
  delete_user_course_taken?: Maybe<User_Course_Taken_Mutation_Response>;
  /** delete data from the table: "user_schedule" */
  delete_user_schedule?: Maybe<User_Schedule_Mutation_Response>;
  /** delete data from the table: "user_schedule_swap" */
  delete_user_schedule_swap?: Maybe<User_Schedule_Swap_Mutation_Response>;
  /** delete single row from the table: "user_schedule_swap" */
  delete_user_schedule_swap_by_pk?: Maybe<User_Schedule_Swap>;
  /** delete data from the table: "user_shortlist" */
  delete_user_shortlist?: Maybe<User_Shortlist_Mutation_Response>;
  /** insert data into the table: "course" */
  insert_course?: Maybe<Course_Mutation_Response>;
  /** insert data into the table: "course_antirequisite" */
  insert_course_antirequisite?: Maybe<Course_Antirequisite_Mutation_Response>;
  /** insert a single row into the table: "course_antirequisite" */
  insert_course_antirequisite_one?: Maybe<Course_Antirequisite>;
  /** insert a single row into the table: "course" */
  insert_course_one?: Maybe<Course>;
  /** insert data into the table: "course_postrequisite" */
  insert_course_postrequisite?: Maybe<Course_Postrequisite_Mutation_Response>;
  /** insert a single row into the table: "course_postrequisite" */
  insert_course_postrequisite_one?: Maybe<Course_Postrequisite>;
  /** insert data into the table: "course_prerequisite" */
  insert_course_prerequisite?: Maybe<Course_Prerequisite_Mutation_Response>;
  /** insert a single row into the table: "course_prerequisite" */
  insert_course_prerequisite_one?: Maybe<Course_Prerequisite>;
  /** insert data into the table: "course_review_upvote" */
  insert_course_review_upvote?: Maybe<Course_Review_Upvote_Mutation_Response>;
  /** insert a single row into the table: "course_review_upvote" */
  insert_course_review_upvote_one?: Maybe<Course_Review_Upvote>;
  /** insert data into the table: "course_section" */
  insert_course_section?: Maybe<Course_Section_Mutation_Response>;
  /** insert a single row into the table: "course_section" */
  insert_course_section_one?: Maybe<Course_Section>;
  /** insert data into the table: "prof" */
  insert_prof?: Maybe<Prof_Mutation_Response>;
  /** insert a single row into the table: "prof" */
  insert_prof_one?: Maybe<Prof>;
  /** insert data into the table: "prof_review_upvote" */
  insert_prof_review_upvote?: Maybe<Prof_Review_Upvote_Mutation_Response>;
  /** insert a single row into the table: "prof_review_upvote" */
  insert_prof_review_upvote_one?: Maybe<Prof_Review_Upvote>;
  /** insert data into the table: "queue.section_subscribed" */
  insert_queue_section_subscribed?: Maybe<Queue_Section_Subscribed_Mutation_Response>;
  /** insert a single row into the table: "queue.section_subscribed" */
  insert_queue_section_subscribed_one?: Maybe<Queue_Section_Subscribed>;
  /** insert data into the table: "review" */
  insert_review?: Maybe<Review_Mutation_Response>;
  /** insert a single row into the table: "review" */
  insert_review_one?: Maybe<Review>;
  /** insert data into the table: "review_user_id" */
  insert_review_user_id?: Maybe<Review_User_Id_Mutation_Response>;
  /** insert a single row into the table: "review_user_id" */
  insert_review_user_id_one?: Maybe<Review_User_Id>;
  /** insert data into the table: "section_exam" */
  insert_section_exam?: Maybe<Section_Exam_Mutation_Response>;
  /** insert a single row into the table: "section_exam" */
  insert_section_exam_one?: Maybe<Section_Exam>;
  /** insert data into the table: "section_meeting" */
  insert_section_meeting?: Maybe<Section_Meeting_Mutation_Response>;
  /** insert a single row into the table: "section_meeting" */
  insert_section_meeting_one?: Maybe<Section_Meeting>;
  /** insert data into the table: "user" */
  insert_user?: Maybe<User_Mutation_Response>;
  /** insert data into the table: "user_course_taken" */
  insert_user_course_taken?: Maybe<User_Course_Taken_Mutation_Response>;
  /** insert a single row into the table: "user_course_taken" */
  insert_user_course_taken_one?: Maybe<User_Course_Taken>;
  /** insert a single row into the table: "user" */
  insert_user_one?: Maybe<User>;
  /** insert data into the table: "user_schedule" */
  insert_user_schedule?: Maybe<User_Schedule_Mutation_Response>;
  /** insert a single row into the table: "user_schedule" */
  insert_user_schedule_one?: Maybe<User_Schedule>;
  /** insert data into the table: "user_schedule_swap" */
  insert_user_schedule_swap?: Maybe<User_Schedule_Swap_Mutation_Response>;
  /** insert a single row into the table: "user_schedule_swap" */
  insert_user_schedule_swap_one?: Maybe<User_Schedule_Swap>;
  /** insert data into the table: "user_shortlist" */
  insert_user_shortlist?: Maybe<User_Shortlist_Mutation_Response>;
  /** insert a single row into the table: "user_shortlist" */
  insert_user_shortlist_one?: Maybe<User_Shortlist>;
  /** update data of the table: "course" */
  update_course?: Maybe<Course_Mutation_Response>;
  /** update data of the table: "course_antirequisite" */
  update_course_antirequisite?: Maybe<Course_Antirequisite_Mutation_Response>;
  /** update multiples rows of table: "course_antirequisite" */
  update_course_antirequisite_many?: Maybe<
    Array<Maybe<Course_Antirequisite_Mutation_Response>>
  >;
  /** update single row of the table: "course" */
  update_course_by_pk?: Maybe<Course>;
  /** update multiples rows of table: "course" */
  update_course_many?: Maybe<Array<Maybe<Course_Mutation_Response>>>;
  /** update data of the table: "course_postrequisite" */
  update_course_postrequisite?: Maybe<Course_Postrequisite_Mutation_Response>;
  /** update multiples rows of table: "course_postrequisite" */
  update_course_postrequisite_many?: Maybe<
    Array<Maybe<Course_Postrequisite_Mutation_Response>>
  >;
  /** update data of the table: "course_prerequisite" */
  update_course_prerequisite?: Maybe<Course_Prerequisite_Mutation_Response>;
  /** update multiples rows of table: "course_prerequisite" */
  update_course_prerequisite_many?: Maybe<
    Array<Maybe<Course_Prerequisite_Mutation_Response>>
  >;
  /** update data of the table: "course_review_upvote" */
  update_course_review_upvote?: Maybe<Course_Review_Upvote_Mutation_Response>;
  /** update multiples rows of table: "course_review_upvote" */
  update_course_review_upvote_many?: Maybe<
    Array<Maybe<Course_Review_Upvote_Mutation_Response>>
  >;
  /** update data of the table: "course_section" */
  update_course_section?: Maybe<Course_Section_Mutation_Response>;
  /** update single row of the table: "course_section" */
  update_course_section_by_pk?: Maybe<Course_Section>;
  /** update multiples rows of table: "course_section" */
  update_course_section_many?: Maybe<
    Array<Maybe<Course_Section_Mutation_Response>>
  >;
  /** update data of the table: "prof" */
  update_prof?: Maybe<Prof_Mutation_Response>;
  /** update single row of the table: "prof" */
  update_prof_by_pk?: Maybe<Prof>;
  /** update multiples rows of table: "prof" */
  update_prof_many?: Maybe<Array<Maybe<Prof_Mutation_Response>>>;
  /** update data of the table: "prof_review_upvote" */
  update_prof_review_upvote?: Maybe<Prof_Review_Upvote_Mutation_Response>;
  /** update multiples rows of table: "prof_review_upvote" */
  update_prof_review_upvote_many?: Maybe<
    Array<Maybe<Prof_Review_Upvote_Mutation_Response>>
  >;
  /** update data of the table: "queue.section_subscribed" */
  update_queue_section_subscribed?: Maybe<Queue_Section_Subscribed_Mutation_Response>;
  /** update single row of the table: "queue.section_subscribed" */
  update_queue_section_subscribed_by_pk?: Maybe<Queue_Section_Subscribed>;
  /** update multiples rows of table: "queue.section_subscribed" */
  update_queue_section_subscribed_many?: Maybe<
    Array<Maybe<Queue_Section_Subscribed_Mutation_Response>>
  >;
  /** update data of the table: "review" */
  update_review?: Maybe<Review_Mutation_Response>;
  /** update single row of the table: "review" */
  update_review_by_pk?: Maybe<Review>;
  /** update multiples rows of table: "review" */
  update_review_many?: Maybe<Array<Maybe<Review_Mutation_Response>>>;
  /** update data of the table: "review_user_id" */
  update_review_user_id?: Maybe<Review_User_Id_Mutation_Response>;
  /** update multiples rows of table: "review_user_id" */
  update_review_user_id_many?: Maybe<
    Array<Maybe<Review_User_Id_Mutation_Response>>
  >;
  /** update data of the table: "section_exam" */
  update_section_exam?: Maybe<Section_Exam_Mutation_Response>;
  /** update multiples rows of table: "section_exam" */
  update_section_exam_many?: Maybe<
    Array<Maybe<Section_Exam_Mutation_Response>>
  >;
  /** update data of the table: "section_meeting" */
  update_section_meeting?: Maybe<Section_Meeting_Mutation_Response>;
  /** update multiples rows of table: "section_meeting" */
  update_section_meeting_many?: Maybe<
    Array<Maybe<Section_Meeting_Mutation_Response>>
  >;
  /** update data of the table: "user" */
  update_user?: Maybe<User_Mutation_Response>;
  /** update single row of the table: "user" */
  update_user_by_pk?: Maybe<User>;
  /** update data of the table: "user_course_taken" */
  update_user_course_taken?: Maybe<User_Course_Taken_Mutation_Response>;
  /** update multiples rows of table: "user_course_taken" */
  update_user_course_taken_many?: Maybe<
    Array<Maybe<User_Course_Taken_Mutation_Response>>
  >;
  /** update multiples rows of table: "user" */
  update_user_many?: Maybe<Array<Maybe<User_Mutation_Response>>>;
  /** update data of the table: "user_schedule" */
  update_user_schedule?: Maybe<User_Schedule_Mutation_Response>;
  /** update multiples rows of table: "user_schedule" */
  update_user_schedule_many?: Maybe<
    Array<Maybe<User_Schedule_Mutation_Response>>
  >;
  /** update data of the table: "user_schedule_swap" */
  update_user_schedule_swap?: Maybe<User_Schedule_Swap_Mutation_Response>;
  /** update single row of the table: "user_schedule_swap" */
  update_user_schedule_swap_by_pk?: Maybe<User_Schedule_Swap>;
  /** update multiples rows of table: "user_schedule_swap" */
  update_user_schedule_swap_many?: Maybe<
    Array<Maybe<User_Schedule_Swap_Mutation_Response>>
  >;
  /** update data of the table: "user_shortlist" */
  update_user_shortlist?: Maybe<User_Shortlist_Mutation_Response>;
  /** update multiples rows of table: "user_shortlist" */
  update_user_shortlist_many?: Maybe<
    Array<Maybe<User_Shortlist_Mutation_Response>>
  >;
};

/** mutation root */
export type Mutation_RootDelete_CourseArgs = {
  where: Course_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Course_AntirequisiteArgs = {
  where: Course_Antirequisite_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Course_By_PkArgs = {
  id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_Course_PostrequisiteArgs = {
  where: Course_Postrequisite_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Course_PrerequisiteArgs = {
  where: Course_Prerequisite_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Course_Review_UpvoteArgs = {
  where: Course_Review_Upvote_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Course_SectionArgs = {
  where: Course_Section_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Course_Section_By_PkArgs = {
  id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_ProfArgs = {
  where: Prof_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Prof_By_PkArgs = {
  id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_Prof_Review_UpvoteArgs = {
  where: Prof_Review_Upvote_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Queue_Section_SubscribedArgs = {
  where: Queue_Section_Subscribed_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Queue_Section_Subscribed_By_PkArgs = {
  id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_ReviewArgs = {
  where: Review_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Review_By_PkArgs = {
  id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_Review_User_IdArgs = {
  where: Review_User_Id_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Section_ExamArgs = {
  where: Section_Exam_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_Section_MeetingArgs = {
  where: Section_Meeting_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_UserArgs = {
  where: User_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_User_By_PkArgs = {
  id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_User_Course_TakenArgs = {
  where: User_Course_Taken_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_User_ScheduleArgs = {
  where: User_Schedule_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_User_Schedule_SwapArgs = {
  where: User_Schedule_Swap_Bool_Exp;
};

/** mutation root */
export type Mutation_RootDelete_User_Schedule_Swap_By_PkArgs = {
  source_section_id: Scalars['Int']['input'];
  user_id: Scalars['Int']['input'];
};

/** mutation root */
export type Mutation_RootDelete_User_ShortlistArgs = {
  where: User_Shortlist_Bool_Exp;
};

/** mutation root */
export type Mutation_RootInsert_CourseArgs = {
  objects: Array<Course_Insert_Input>;
  on_conflict?: InputMaybe<Course_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_AntirequisiteArgs = {
  objects: Array<Course_Antirequisite_Insert_Input>;
  on_conflict?: InputMaybe<Course_Antirequisite_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_Antirequisite_OneArgs = {
  object: Course_Antirequisite_Insert_Input;
  on_conflict?: InputMaybe<Course_Antirequisite_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_OneArgs = {
  object: Course_Insert_Input;
  on_conflict?: InputMaybe<Course_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_PostrequisiteArgs = {
  objects: Array<Course_Postrequisite_Insert_Input>;
};

/** mutation root */
export type Mutation_RootInsert_Course_Postrequisite_OneArgs = {
  object: Course_Postrequisite_Insert_Input;
};

/** mutation root */
export type Mutation_RootInsert_Course_PrerequisiteArgs = {
  objects: Array<Course_Prerequisite_Insert_Input>;
  on_conflict?: InputMaybe<Course_Prerequisite_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_Prerequisite_OneArgs = {
  object: Course_Prerequisite_Insert_Input;
  on_conflict?: InputMaybe<Course_Prerequisite_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_Review_UpvoteArgs = {
  objects: Array<Course_Review_Upvote_Insert_Input>;
  on_conflict?: InputMaybe<Course_Review_Upvote_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_Review_Upvote_OneArgs = {
  object: Course_Review_Upvote_Insert_Input;
  on_conflict?: InputMaybe<Course_Review_Upvote_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_SectionArgs = {
  objects: Array<Course_Section_Insert_Input>;
  on_conflict?: InputMaybe<Course_Section_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Course_Section_OneArgs = {
  object: Course_Section_Insert_Input;
  on_conflict?: InputMaybe<Course_Section_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_ProfArgs = {
  objects: Array<Prof_Insert_Input>;
  on_conflict?: InputMaybe<Prof_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Prof_OneArgs = {
  object: Prof_Insert_Input;
  on_conflict?: InputMaybe<Prof_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Prof_Review_UpvoteArgs = {
  objects: Array<Prof_Review_Upvote_Insert_Input>;
  on_conflict?: InputMaybe<Prof_Review_Upvote_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Prof_Review_Upvote_OneArgs = {
  object: Prof_Review_Upvote_Insert_Input;
  on_conflict?: InputMaybe<Prof_Review_Upvote_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Queue_Section_SubscribedArgs = {
  objects: Array<Queue_Section_Subscribed_Insert_Input>;
  on_conflict?: InputMaybe<Queue_Section_Subscribed_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Queue_Section_Subscribed_OneArgs = {
  object: Queue_Section_Subscribed_Insert_Input;
  on_conflict?: InputMaybe<Queue_Section_Subscribed_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_ReviewArgs = {
  objects: Array<Review_Insert_Input>;
  on_conflict?: InputMaybe<Review_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Review_OneArgs = {
  object: Review_Insert_Input;
  on_conflict?: InputMaybe<Review_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Review_User_IdArgs = {
  objects: Array<Review_User_Id_Insert_Input>;
};

/** mutation root */
export type Mutation_RootInsert_Review_User_Id_OneArgs = {
  object: Review_User_Id_Insert_Input;
};

/** mutation root */
export type Mutation_RootInsert_Section_ExamArgs = {
  objects: Array<Section_Exam_Insert_Input>;
  on_conflict?: InputMaybe<Section_Exam_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Section_Exam_OneArgs = {
  object: Section_Exam_Insert_Input;
  on_conflict?: InputMaybe<Section_Exam_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_Section_MeetingArgs = {
  objects: Array<Section_Meeting_Insert_Input>;
};

/** mutation root */
export type Mutation_RootInsert_Section_Meeting_OneArgs = {
  object: Section_Meeting_Insert_Input;
};

/** mutation root */
export type Mutation_RootInsert_UserArgs = {
  objects: Array<User_Insert_Input>;
  on_conflict?: InputMaybe<User_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Course_TakenArgs = {
  objects: Array<User_Course_Taken_Insert_Input>;
  on_conflict?: InputMaybe<User_Course_Taken_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Course_Taken_OneArgs = {
  object: User_Course_Taken_Insert_Input;
  on_conflict?: InputMaybe<User_Course_Taken_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_OneArgs = {
  object: User_Insert_Input;
  on_conflict?: InputMaybe<User_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_ScheduleArgs = {
  objects: Array<User_Schedule_Insert_Input>;
  on_conflict?: InputMaybe<User_Schedule_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Schedule_OneArgs = {
  object: User_Schedule_Insert_Input;
  on_conflict?: InputMaybe<User_Schedule_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Schedule_SwapArgs = {
  objects: Array<User_Schedule_Swap_Insert_Input>;
  on_conflict?: InputMaybe<User_Schedule_Swap_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Schedule_Swap_OneArgs = {
  object: User_Schedule_Swap_Insert_Input;
  on_conflict?: InputMaybe<User_Schedule_Swap_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_ShortlistArgs = {
  objects: Array<User_Shortlist_Insert_Input>;
  on_conflict?: InputMaybe<User_Shortlist_On_Conflict>;
};

/** mutation root */
export type Mutation_RootInsert_User_Shortlist_OneArgs = {
  object: User_Shortlist_Insert_Input;
  on_conflict?: InputMaybe<User_Shortlist_On_Conflict>;
};

/** mutation root */
export type Mutation_RootUpdate_CourseArgs = {
  _inc?: InputMaybe<Course_Inc_Input>;
  _set?: InputMaybe<Course_Set_Input>;
  where: Course_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Course_AntirequisiteArgs = {
  _inc?: InputMaybe<Course_Antirequisite_Inc_Input>;
  _set?: InputMaybe<Course_Antirequisite_Set_Input>;
  where: Course_Antirequisite_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Antirequisite_ManyArgs = {
  updates: Array<Course_Antirequisite_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Course_By_PkArgs = {
  _inc?: InputMaybe<Course_Inc_Input>;
  _set?: InputMaybe<Course_Set_Input>;
  pk_columns: Course_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Course_ManyArgs = {
  updates: Array<Course_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Course_PostrequisiteArgs = {
  _inc?: InputMaybe<Course_Postrequisite_Inc_Input>;
  _set?: InputMaybe<Course_Postrequisite_Set_Input>;
  where: Course_Postrequisite_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Postrequisite_ManyArgs = {
  updates: Array<Course_Postrequisite_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Course_PrerequisiteArgs = {
  _inc?: InputMaybe<Course_Prerequisite_Inc_Input>;
  _set?: InputMaybe<Course_Prerequisite_Set_Input>;
  where: Course_Prerequisite_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Prerequisite_ManyArgs = {
  updates: Array<Course_Prerequisite_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Review_UpvoteArgs = {
  _inc?: InputMaybe<Course_Review_Upvote_Inc_Input>;
  _set?: InputMaybe<Course_Review_Upvote_Set_Input>;
  where: Course_Review_Upvote_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Review_Upvote_ManyArgs = {
  updates: Array<Course_Review_Upvote_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Course_SectionArgs = {
  _inc?: InputMaybe<Course_Section_Inc_Input>;
  _set?: InputMaybe<Course_Section_Set_Input>;
  where: Course_Section_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Section_By_PkArgs = {
  _inc?: InputMaybe<Course_Section_Inc_Input>;
  _set?: InputMaybe<Course_Section_Set_Input>;
  pk_columns: Course_Section_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Course_Section_ManyArgs = {
  updates: Array<Course_Section_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_ProfArgs = {
  _inc?: InputMaybe<Prof_Inc_Input>;
  _set?: InputMaybe<Prof_Set_Input>;
  where: Prof_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Prof_By_PkArgs = {
  _inc?: InputMaybe<Prof_Inc_Input>;
  _set?: InputMaybe<Prof_Set_Input>;
  pk_columns: Prof_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Prof_ManyArgs = {
  updates: Array<Prof_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Prof_Review_UpvoteArgs = {
  _inc?: InputMaybe<Prof_Review_Upvote_Inc_Input>;
  _set?: InputMaybe<Prof_Review_Upvote_Set_Input>;
  where: Prof_Review_Upvote_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Prof_Review_Upvote_ManyArgs = {
  updates: Array<Prof_Review_Upvote_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Queue_Section_SubscribedArgs = {
  _inc?: InputMaybe<Queue_Section_Subscribed_Inc_Input>;
  _set?: InputMaybe<Queue_Section_Subscribed_Set_Input>;
  where: Queue_Section_Subscribed_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Queue_Section_Subscribed_By_PkArgs = {
  _inc?: InputMaybe<Queue_Section_Subscribed_Inc_Input>;
  _set?: InputMaybe<Queue_Section_Subscribed_Set_Input>;
  pk_columns: Queue_Section_Subscribed_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Queue_Section_Subscribed_ManyArgs = {
  updates: Array<Queue_Section_Subscribed_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_ReviewArgs = {
  _inc?: InputMaybe<Review_Inc_Input>;
  _set?: InputMaybe<Review_Set_Input>;
  where: Review_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Review_By_PkArgs = {
  _inc?: InputMaybe<Review_Inc_Input>;
  _set?: InputMaybe<Review_Set_Input>;
  pk_columns: Review_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_Review_ManyArgs = {
  updates: Array<Review_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Review_User_IdArgs = {
  _inc?: InputMaybe<Review_User_Id_Inc_Input>;
  _set?: InputMaybe<Review_User_Id_Set_Input>;
  where: Review_User_Id_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Review_User_Id_ManyArgs = {
  updates: Array<Review_User_Id_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Section_ExamArgs = {
  _inc?: InputMaybe<Section_Exam_Inc_Input>;
  _set?: InputMaybe<Section_Exam_Set_Input>;
  where: Section_Exam_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Section_Exam_ManyArgs = {
  updates: Array<Section_Exam_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_Section_MeetingArgs = {
  _inc?: InputMaybe<Section_Meeting_Inc_Input>;
  _set?: InputMaybe<Section_Meeting_Set_Input>;
  where: Section_Meeting_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_Section_Meeting_ManyArgs = {
  updates: Array<Section_Meeting_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_UserArgs = {
  _inc?: InputMaybe<User_Inc_Input>;
  _set?: InputMaybe<User_Set_Input>;
  where: User_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_User_By_PkArgs = {
  _inc?: InputMaybe<User_Inc_Input>;
  _set?: InputMaybe<User_Set_Input>;
  pk_columns: User_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_User_Course_TakenArgs = {
  _inc?: InputMaybe<User_Course_Taken_Inc_Input>;
  _set?: InputMaybe<User_Course_Taken_Set_Input>;
  where: User_Course_Taken_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_User_Course_Taken_ManyArgs = {
  updates: Array<User_Course_Taken_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_User_ManyArgs = {
  updates: Array<User_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_User_ScheduleArgs = {
  _inc?: InputMaybe<User_Schedule_Inc_Input>;
  _set?: InputMaybe<User_Schedule_Set_Input>;
  where: User_Schedule_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_User_Schedule_ManyArgs = {
  updates: Array<User_Schedule_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_User_Schedule_SwapArgs = {
  _inc?: InputMaybe<User_Schedule_Swap_Inc_Input>;
  _set?: InputMaybe<User_Schedule_Swap_Set_Input>;
  where: User_Schedule_Swap_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_User_Schedule_Swap_By_PkArgs = {
  _inc?: InputMaybe<User_Schedule_Swap_Inc_Input>;
  _set?: InputMaybe<User_Schedule_Swap_Set_Input>;
  pk_columns: User_Schedule_Swap_Pk_Columns_Input;
};

/** mutation root */
export type Mutation_RootUpdate_User_Schedule_Swap_ManyArgs = {
  updates: Array<User_Schedule_Swap_Updates>;
};

/** mutation root */
export type Mutation_RootUpdate_User_ShortlistArgs = {
  _inc?: InputMaybe<User_Shortlist_Inc_Input>;
  _set?: InputMaybe<User_Shortlist_Set_Input>;
  where: User_Shortlist_Bool_Exp;
};

/** mutation root */
export type Mutation_RootUpdate_User_Shortlist_ManyArgs = {
  updates: Array<User_Shortlist_Updates>;
};

/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export type Numeric_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['numeric']['input']>;
  _gt?: InputMaybe<Scalars['numeric']['input']>;
  _gte?: InputMaybe<Scalars['numeric']['input']>;
  _in?: InputMaybe<Array<Scalars['numeric']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['numeric']['input']>;
  _lte?: InputMaybe<Scalars['numeric']['input']>;
  _neq?: InputMaybe<Scalars['numeric']['input']>;
  _nin?: InputMaybe<Array<Scalars['numeric']['input']>>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last',
}

/** columns and relationships of "prof" */
export type Prof = {
  __typename?: 'prof';
  code: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  picture_url?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  prof_clear_buckets: Array<Aggregate_Prof_Clear_Buckets>;
  /** An aggregate relationship */
  prof_clear_buckets_aggregate: Aggregate_Prof_Clear_Buckets_Aggregate;
  /** An array relationship */
  prof_courses: Array<Prof_Teaches_Course>;
  /** An aggregate relationship */
  prof_courses_aggregate: Prof_Teaches_Course_Aggregate;
  /** An array relationship */
  prof_engaging_buckets: Array<Aggregate_Prof_Engaging_Buckets>;
  /** An aggregate relationship */
  prof_engaging_buckets_aggregate: Aggregate_Prof_Engaging_Buckets_Aggregate;
  /** An object relationship */
  rating?: Maybe<Aggregate_Prof_Rating>;
  /** An array relationship */
  reviews: Array<Review>;
  /** An aggregate relationship */
  reviews_aggregate: Review_Aggregate;
};

/** columns and relationships of "prof" */
export type ProfProf_Clear_BucketsArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfProf_Clear_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfProf_CoursesArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfProf_Courses_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfProf_Engaging_BucketsArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Prof_Engaging_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfProf_Engaging_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Prof_Engaging_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfReviewsArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** columns and relationships of "prof" */
export type ProfReviews_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** aggregated selection of "prof" */
export type Prof_Aggregate = {
  __typename?: 'prof_aggregate';
  aggregate?: Maybe<Prof_Aggregate_Fields>;
  nodes: Array<Prof>;
};

/** aggregate fields of "prof" */
export type Prof_Aggregate_Fields = {
  __typename?: 'prof_aggregate_fields';
  avg?: Maybe<Prof_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Prof_Max_Fields>;
  min?: Maybe<Prof_Min_Fields>;
  stddev?: Maybe<Prof_Stddev_Fields>;
  stddev_pop?: Maybe<Prof_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Prof_Stddev_Samp_Fields>;
  sum?: Maybe<Prof_Sum_Fields>;
  var_pop?: Maybe<Prof_Var_Pop_Fields>;
  var_samp?: Maybe<Prof_Var_Samp_Fields>;
  variance?: Maybe<Prof_Variance_Fields>;
};

/** aggregate fields of "prof" */
export type Prof_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Prof_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Prof_Avg_Fields = {
  __typename?: 'prof_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "prof". All fields are combined with a logical 'AND'. */
export type Prof_Bool_Exp = {
  _and?: InputMaybe<Array<Prof_Bool_Exp>>;
  _not?: InputMaybe<Prof_Bool_Exp>;
  _or?: InputMaybe<Array<Prof_Bool_Exp>>;
  code?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  picture_url?: InputMaybe<String_Comparison_Exp>;
  prof_clear_buckets?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
  prof_clear_buckets_aggregate?: InputMaybe<Aggregate_Prof_Clear_Buckets_Aggregate_Bool_Exp>;
  prof_courses?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
  prof_courses_aggregate?: InputMaybe<Prof_Teaches_Course_Aggregate_Bool_Exp>;
  prof_engaging_buckets?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
  prof_engaging_buckets_aggregate?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Aggregate_Bool_Exp>;
  rating?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
  reviews?: InputMaybe<Review_Bool_Exp>;
  reviews_aggregate?: InputMaybe<Review_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "prof" */
export enum Prof_Constraint {
  /** unique or primary key constraint on columns "code" */
  ProfCodeUnique = 'prof_code_unique',
  /** unique or primary key constraint on columns "id" */
  ProfPkey = 'prof_pkey',
}

/** input type for incrementing numeric columns in table "prof" */
export type Prof_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "prof" */
export type Prof_Insert_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
  prof_clear_buckets?: InputMaybe<Aggregate_Prof_Clear_Buckets_Arr_Rel_Insert_Input>;
  prof_courses?: InputMaybe<Prof_Teaches_Course_Arr_Rel_Insert_Input>;
  prof_engaging_buckets?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Arr_Rel_Insert_Input>;
  rating?: InputMaybe<Aggregate_Prof_Rating_Obj_Rel_Insert_Input>;
  reviews?: InputMaybe<Review_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type Prof_Max_Fields = {
  __typename?: 'prof_max_fields';
  code?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type Prof_Min_Fields = {
  __typename?: 'prof_min_fields';
  code?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "prof" */
export type Prof_Mutation_Response = {
  __typename?: 'prof_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Prof>;
};

/** input type for inserting object relation for remote table "prof" */
export type Prof_Obj_Rel_Insert_Input = {
  data: Prof_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<Prof_On_Conflict>;
};

/** on_conflict condition type for table "prof" */
export type Prof_On_Conflict = {
  constraint: Prof_Constraint;
  update_columns?: Array<Prof_Update_Column>;
  where?: InputMaybe<Prof_Bool_Exp>;
};

/** Ordering options when selecting data from "prof". */
export type Prof_Order_By = {
  code?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  picture_url?: InputMaybe<Order_By>;
  prof_clear_buckets_aggregate?: InputMaybe<Aggregate_Prof_Clear_Buckets_Aggregate_Order_By>;
  prof_courses_aggregate?: InputMaybe<Prof_Teaches_Course_Aggregate_Order_By>;
  prof_engaging_buckets_aggregate?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Aggregate_Order_By>;
  rating?: InputMaybe<Aggregate_Prof_Rating_Order_By>;
  reviews_aggregate?: InputMaybe<Review_Aggregate_Order_By>;
};

/** primary key columns input for table: prof */
export type Prof_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** columns and relationships of "prof_review_upvote" */
export type Prof_Review_Upvote = {
  __typename?: 'prof_review_upvote';
  review_id: Scalars['Int']['output'];
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "prof_review_upvote" */
export type Prof_Review_Upvote_Aggregate = {
  __typename?: 'prof_review_upvote_aggregate';
  aggregate?: Maybe<Prof_Review_Upvote_Aggregate_Fields>;
  nodes: Array<Prof_Review_Upvote>;
};

export type Prof_Review_Upvote_Aggregate_Bool_Exp = {
  count?: InputMaybe<Prof_Review_Upvote_Aggregate_Bool_Exp_Count>;
};

export type Prof_Review_Upvote_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "prof_review_upvote" */
export type Prof_Review_Upvote_Aggregate_Fields = {
  __typename?: 'prof_review_upvote_aggregate_fields';
  avg?: Maybe<Prof_Review_Upvote_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Prof_Review_Upvote_Max_Fields>;
  min?: Maybe<Prof_Review_Upvote_Min_Fields>;
  stddev?: Maybe<Prof_Review_Upvote_Stddev_Fields>;
  stddev_pop?: Maybe<Prof_Review_Upvote_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Prof_Review_Upvote_Stddev_Samp_Fields>;
  sum?: Maybe<Prof_Review_Upvote_Sum_Fields>;
  var_pop?: Maybe<Prof_Review_Upvote_Var_Pop_Fields>;
  var_samp?: Maybe<Prof_Review_Upvote_Var_Samp_Fields>;
  variance?: Maybe<Prof_Review_Upvote_Variance_Fields>;
};

/** aggregate fields of "prof_review_upvote" */
export type Prof_Review_Upvote_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "prof_review_upvote" */
export type Prof_Review_Upvote_Aggregate_Order_By = {
  avg?: InputMaybe<Prof_Review_Upvote_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Prof_Review_Upvote_Max_Order_By>;
  min?: InputMaybe<Prof_Review_Upvote_Min_Order_By>;
  stddev?: InputMaybe<Prof_Review_Upvote_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Prof_Review_Upvote_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Prof_Review_Upvote_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Prof_Review_Upvote_Sum_Order_By>;
  var_pop?: InputMaybe<Prof_Review_Upvote_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Prof_Review_Upvote_Var_Samp_Order_By>;
  variance?: InputMaybe<Prof_Review_Upvote_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "prof_review_upvote" */
export type Prof_Review_Upvote_Arr_Rel_Insert_Input = {
  data: Array<Prof_Review_Upvote_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Prof_Review_Upvote_On_Conflict>;
};

/** aggregate avg on columns */
export type Prof_Review_Upvote_Avg_Fields = {
  __typename?: 'prof_review_upvote_avg_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Avg_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "prof_review_upvote". All fields are combined with a logical 'AND'. */
export type Prof_Review_Upvote_Bool_Exp = {
  _and?: InputMaybe<Array<Prof_Review_Upvote_Bool_Exp>>;
  _not?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
  _or?: InputMaybe<Array<Prof_Review_Upvote_Bool_Exp>>;
  review_id?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "prof_review_upvote" */
export enum Prof_Review_Upvote_Constraint {
  /** unique or primary key constraint on columns "user_id", "review_id" */
  ProfReviewUpvoteUnique = 'prof_review_upvote_unique',
}

/** input type for incrementing numeric columns in table "prof_review_upvote" */
export type Prof_Review_Upvote_Inc_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "prof_review_upvote" */
export type Prof_Review_Upvote_Insert_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Prof_Review_Upvote_Max_Fields = {
  __typename?: 'prof_review_upvote_max_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Max_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Prof_Review_Upvote_Min_Fields = {
  __typename?: 'prof_review_upvote_min_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Min_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "prof_review_upvote" */
export type Prof_Review_Upvote_Mutation_Response = {
  __typename?: 'prof_review_upvote_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Prof_Review_Upvote>;
};

/** on_conflict condition type for table "prof_review_upvote" */
export type Prof_Review_Upvote_On_Conflict = {
  constraint: Prof_Review_Upvote_Constraint;
  update_columns?: Array<Prof_Review_Upvote_Update_Column>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

/** Ordering options when selecting data from "prof_review_upvote". */
export type Prof_Review_Upvote_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "prof_review_upvote" */
export enum Prof_Review_Upvote_Select_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "prof_review_upvote" */
export type Prof_Review_Upvote_Set_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Prof_Review_Upvote_Stddev_Fields = {
  __typename?: 'prof_review_upvote_stddev_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Stddev_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Prof_Review_Upvote_Stddev_Pop_Fields = {
  __typename?: 'prof_review_upvote_stddev_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Stddev_Pop_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Prof_Review_Upvote_Stddev_Samp_Fields = {
  __typename?: 'prof_review_upvote_stddev_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Stddev_Samp_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "prof_review_upvote" */
export type Prof_Review_Upvote_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Prof_Review_Upvote_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Prof_Review_Upvote_Stream_Cursor_Value_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Prof_Review_Upvote_Sum_Fields = {
  __typename?: 'prof_review_upvote_sum_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Sum_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** update columns of table "prof_review_upvote" */
export enum Prof_Review_Upvote_Update_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UserId = 'user_id',
}

export type Prof_Review_Upvote_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Prof_Review_Upvote_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Prof_Review_Upvote_Set_Input>;
  /** filter the rows which have to be updated */
  where: Prof_Review_Upvote_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Prof_Review_Upvote_Var_Pop_Fields = {
  __typename?: 'prof_review_upvote_var_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Var_Pop_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Prof_Review_Upvote_Var_Samp_Fields = {
  __typename?: 'prof_review_upvote_var_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Var_Samp_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Prof_Review_Upvote_Variance_Fields = {
  __typename?: 'prof_review_upvote_variance_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "prof_review_upvote" */
export type Prof_Review_Upvote_Variance_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** columns and relationships of "prof_search_index" */
export type Prof_Search_Index = {
  __typename?: 'prof_search_index';
  clear?: Maybe<Scalars['numeric']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  course_codes?: Maybe<Scalars['_text']['output']>;
  course_ids?: Maybe<Scalars['_int4']['output']>;
  document?: Maybe<Scalars['tsvector']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
};

/** aggregated selection of "prof_search_index" */
export type Prof_Search_Index_Aggregate = {
  __typename?: 'prof_search_index_aggregate';
  aggregate?: Maybe<Prof_Search_Index_Aggregate_Fields>;
  nodes: Array<Prof_Search_Index>;
};

/** aggregate fields of "prof_search_index" */
export type Prof_Search_Index_Aggregate_Fields = {
  __typename?: 'prof_search_index_aggregate_fields';
  avg?: Maybe<Prof_Search_Index_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Prof_Search_Index_Max_Fields>;
  min?: Maybe<Prof_Search_Index_Min_Fields>;
  stddev?: Maybe<Prof_Search_Index_Stddev_Fields>;
  stddev_pop?: Maybe<Prof_Search_Index_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Prof_Search_Index_Stddev_Samp_Fields>;
  sum?: Maybe<Prof_Search_Index_Sum_Fields>;
  var_pop?: Maybe<Prof_Search_Index_Var_Pop_Fields>;
  var_samp?: Maybe<Prof_Search_Index_Var_Samp_Fields>;
  variance?: Maybe<Prof_Search_Index_Variance_Fields>;
};

/** aggregate fields of "prof_search_index" */
export type Prof_Search_Index_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Prof_Search_Index_Avg_Fields = {
  __typename?: 'prof_search_index_avg_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "prof_search_index". All fields are combined with a logical 'AND'. */
export type Prof_Search_Index_Bool_Exp = {
  _and?: InputMaybe<Array<Prof_Search_Index_Bool_Exp>>;
  _not?: InputMaybe<Prof_Search_Index_Bool_Exp>;
  _or?: InputMaybe<Array<Prof_Search_Index_Bool_Exp>>;
  clear?: InputMaybe<Numeric_Comparison_Exp>;
  code?: InputMaybe<String_Comparison_Exp>;
  course_codes?: InputMaybe<_Text_Comparison_Exp>;
  course_ids?: InputMaybe<_Int4_Comparison_Exp>;
  document?: InputMaybe<Tsvector_Comparison_Exp>;
  engaging?: InputMaybe<Numeric_Comparison_Exp>;
  liked?: InputMaybe<Numeric_Comparison_Exp>;
  name?: InputMaybe<String_Comparison_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
  ratings?: InputMaybe<Bigint_Comparison_Exp>;
};

/** aggregate max on columns */
export type Prof_Search_Index_Max_Fields = {
  __typename?: 'prof_search_index_max_fields';
  clear?: Maybe<Scalars['numeric']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate min on columns */
export type Prof_Search_Index_Min_Fields = {
  __typename?: 'prof_search_index_min_fields';
  clear?: Maybe<Scalars['numeric']['output']>;
  code?: Maybe<Scalars['String']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
};

/** Ordering options when selecting data from "prof_search_index". */
export type Prof_Search_Index_Order_By = {
  clear?: InputMaybe<Order_By>;
  code?: InputMaybe<Order_By>;
  course_codes?: InputMaybe<Order_By>;
  course_ids?: InputMaybe<Order_By>;
  document?: InputMaybe<Order_By>;
  engaging?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  name?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  ratings?: InputMaybe<Order_By>;
};

/** select columns of table "prof_search_index" */
export enum Prof_Search_Index_Select_Column {
  /** column name */
  Clear = 'clear',
  /** column name */
  Code = 'code',
  /** column name */
  CourseCodes = 'course_codes',
  /** column name */
  CourseIds = 'course_ids',
  /** column name */
  Document = 'document',
  /** column name */
  Engaging = 'engaging',
  /** column name */
  Liked = 'liked',
  /** column name */
  Name = 'name',
  /** column name */
  ProfId = 'prof_id',
  /** column name */
  Ratings = 'ratings',
}

/** aggregate stddev on columns */
export type Prof_Search_Index_Stddev_Fields = {
  __typename?: 'prof_search_index_stddev_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Prof_Search_Index_Stddev_Pop_Fields = {
  __typename?: 'prof_search_index_stddev_pop_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Prof_Search_Index_Stddev_Samp_Fields = {
  __typename?: 'prof_search_index_stddev_samp_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "prof_search_index" */
export type Prof_Search_Index_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Prof_Search_Index_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Prof_Search_Index_Stream_Cursor_Value_Input = {
  clear?: InputMaybe<Scalars['numeric']['input']>;
  code?: InputMaybe<Scalars['String']['input']>;
  course_codes?: InputMaybe<Scalars['_text']['input']>;
  course_ids?: InputMaybe<Scalars['_int4']['input']>;
  document?: InputMaybe<Scalars['tsvector']['input']>;
  engaging?: InputMaybe<Scalars['numeric']['input']>;
  liked?: InputMaybe<Scalars['numeric']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  ratings?: InputMaybe<Scalars['bigint']['input']>;
};

/** aggregate sum on columns */
export type Prof_Search_Index_Sum_Fields = {
  __typename?: 'prof_search_index_sum_fields';
  clear?: Maybe<Scalars['numeric']['output']>;
  engaging?: Maybe<Scalars['numeric']['output']>;
  liked?: Maybe<Scalars['numeric']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  ratings?: Maybe<Scalars['bigint']['output']>;
};

/** aggregate var_pop on columns */
export type Prof_Search_Index_Var_Pop_Fields = {
  __typename?: 'prof_search_index_var_pop_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Prof_Search_Index_Var_Samp_Fields = {
  __typename?: 'prof_search_index_var_samp_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Prof_Search_Index_Variance_Fields = {
  __typename?: 'prof_search_index_variance_fields';
  clear?: Maybe<Scalars['Float']['output']>;
  engaging?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  ratings?: Maybe<Scalars['Float']['output']>;
};

/** select columns of table "prof" */
export enum Prof_Select_Column {
  /** column name */
  Code = 'code',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  PictureUrl = 'picture_url',
}

/** input type for updating data in table "prof" */
export type Prof_Set_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate stddev on columns */
export type Prof_Stddev_Fields = {
  __typename?: 'prof_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Prof_Stddev_Pop_Fields = {
  __typename?: 'prof_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Prof_Stddev_Samp_Fields = {
  __typename?: 'prof_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "prof" */
export type Prof_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Prof_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Prof_Stream_Cursor_Value_Input = {
  code?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type Prof_Sum_Fields = {
  __typename?: 'prof_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** columns and relationships of "prof_teaches_course" */
export type Prof_Teaches_Course = {
  __typename?: 'prof_teaches_course';
  /** An object relationship */
  course?: Maybe<Course>;
  course_id?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  prof?: Maybe<Prof>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "prof_teaches_course" */
export type Prof_Teaches_Course_Aggregate = {
  __typename?: 'prof_teaches_course_aggregate';
  aggregate?: Maybe<Prof_Teaches_Course_Aggregate_Fields>;
  nodes: Array<Prof_Teaches_Course>;
};

export type Prof_Teaches_Course_Aggregate_Bool_Exp = {
  count?: InputMaybe<Prof_Teaches_Course_Aggregate_Bool_Exp_Count>;
};

export type Prof_Teaches_Course_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "prof_teaches_course" */
export type Prof_Teaches_Course_Aggregate_Fields = {
  __typename?: 'prof_teaches_course_aggregate_fields';
  avg?: Maybe<Prof_Teaches_Course_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Prof_Teaches_Course_Max_Fields>;
  min?: Maybe<Prof_Teaches_Course_Min_Fields>;
  stddev?: Maybe<Prof_Teaches_Course_Stddev_Fields>;
  stddev_pop?: Maybe<Prof_Teaches_Course_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Prof_Teaches_Course_Stddev_Samp_Fields>;
  sum?: Maybe<Prof_Teaches_Course_Sum_Fields>;
  var_pop?: Maybe<Prof_Teaches_Course_Var_Pop_Fields>;
  var_samp?: Maybe<Prof_Teaches_Course_Var_Samp_Fields>;
  variance?: Maybe<Prof_Teaches_Course_Variance_Fields>;
};

/** aggregate fields of "prof_teaches_course" */
export type Prof_Teaches_Course_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "prof_teaches_course" */
export type Prof_Teaches_Course_Aggregate_Order_By = {
  avg?: InputMaybe<Prof_Teaches_Course_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Prof_Teaches_Course_Max_Order_By>;
  min?: InputMaybe<Prof_Teaches_Course_Min_Order_By>;
  stddev?: InputMaybe<Prof_Teaches_Course_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Prof_Teaches_Course_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Prof_Teaches_Course_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Prof_Teaches_Course_Sum_Order_By>;
  var_pop?: InputMaybe<Prof_Teaches_Course_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Prof_Teaches_Course_Var_Samp_Order_By>;
  variance?: InputMaybe<Prof_Teaches_Course_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "prof_teaches_course" */
export type Prof_Teaches_Course_Arr_Rel_Insert_Input = {
  data: Array<Prof_Teaches_Course_Insert_Input>;
};

/** aggregate avg on columns */
export type Prof_Teaches_Course_Avg_Fields = {
  __typename?: 'prof_teaches_course_avg_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Avg_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "prof_teaches_course". All fields are combined with a logical 'AND'. */
export type Prof_Teaches_Course_Bool_Exp = {
  _and?: InputMaybe<Array<Prof_Teaches_Course_Bool_Exp>>;
  _not?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
  _or?: InputMaybe<Array<Prof_Teaches_Course_Bool_Exp>>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  prof?: InputMaybe<Prof_Bool_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
};

/** input type for inserting data into table "prof_teaches_course" */
export type Prof_Teaches_Course_Insert_Input = {
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  prof?: InputMaybe<Prof_Obj_Rel_Insert_Input>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Prof_Teaches_Course_Max_Fields = {
  __typename?: 'prof_teaches_course_max_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Max_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Prof_Teaches_Course_Min_Fields = {
  __typename?: 'prof_teaches_course_min_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Min_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** Ordering options when selecting data from "prof_teaches_course". */
export type Prof_Teaches_Course_Order_By = {
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  prof?: InputMaybe<Prof_Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** select columns of table "prof_teaches_course" */
export enum Prof_Teaches_Course_Select_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  ProfId = 'prof_id',
}

/** aggregate stddev on columns */
export type Prof_Teaches_Course_Stddev_Fields = {
  __typename?: 'prof_teaches_course_stddev_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Stddev_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Prof_Teaches_Course_Stddev_Pop_Fields = {
  __typename?: 'prof_teaches_course_stddev_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Stddev_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Prof_Teaches_Course_Stddev_Samp_Fields = {
  __typename?: 'prof_teaches_course_stddev_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Stddev_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "prof_teaches_course" */
export type Prof_Teaches_Course_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Prof_Teaches_Course_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Prof_Teaches_Course_Stream_Cursor_Value_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Prof_Teaches_Course_Sum_Fields = {
  __typename?: 'prof_teaches_course_sum_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Sum_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** aggregate var_pop on columns */
export type Prof_Teaches_Course_Var_Pop_Fields = {
  __typename?: 'prof_teaches_course_var_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Var_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Prof_Teaches_Course_Var_Samp_Fields = {
  __typename?: 'prof_teaches_course_var_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Var_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Prof_Teaches_Course_Variance_Fields = {
  __typename?: 'prof_teaches_course_variance_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "prof_teaches_course" */
export type Prof_Teaches_Course_Variance_Order_By = {
  course_id?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
};

/** update columns of table "prof" */
export enum Prof_Update_Column {
  /** column name */
  Code = 'code',
  /** column name */
  Id = 'id',
  /** column name */
  Name = 'name',
  /** column name */
  PictureUrl = 'picture_url',
}

export type Prof_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Prof_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Prof_Set_Input>;
  /** filter the rows which have to be updated */
  where: Prof_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Prof_Var_Pop_Fields = {
  __typename?: 'prof_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Prof_Var_Samp_Fields = {
  __typename?: 'prof_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Prof_Variance_Fields = {
  __typename?: 'prof_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "aggregate.course_easy_buckets" */
  aggregate_course_easy_buckets: Array<Aggregate_Course_Easy_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.course_easy_buckets" */
  aggregate_course_easy_buckets_aggregate: Aggregate_Course_Easy_Buckets_Aggregate;
  /** fetch data from the table: "aggregate.course_rating" */
  aggregate_course_rating: Array<Aggregate_Course_Rating>;
  /** fetch aggregated fields from the table: "aggregate.course_rating" */
  aggregate_course_rating_aggregate: Aggregate_Course_Rating_Aggregate;
  /** fetch data from the table: "aggregate.course_review_rating" */
  aggregate_course_review_rating: Array<Aggregate_Course_Review_Rating>;
  /** fetch aggregated fields from the table: "aggregate.course_review_rating" */
  aggregate_course_review_rating_aggregate: Aggregate_Course_Review_Rating_Aggregate;
  /** fetch data from the table: "aggregate.course_useful_buckets" */
  aggregate_course_useful_buckets: Array<Aggregate_Course_Useful_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.course_useful_buckets" */
  aggregate_course_useful_buckets_aggregate: Aggregate_Course_Useful_Buckets_Aggregate;
  /** fetch data from the table: "aggregate.prof_clear_buckets" */
  aggregate_prof_clear_buckets: Array<Aggregate_Prof_Clear_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.prof_clear_buckets" */
  aggregate_prof_clear_buckets_aggregate: Aggregate_Prof_Clear_Buckets_Aggregate;
  /** fetch data from the table: "aggregate.prof_engaging_buckets" */
  aggregate_prof_engaging_buckets: Array<Aggregate_Prof_Engaging_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.prof_engaging_buckets" */
  aggregate_prof_engaging_buckets_aggregate: Aggregate_Prof_Engaging_Buckets_Aggregate;
  /** fetch data from the table: "aggregate.prof_rating" */
  aggregate_prof_rating: Array<Aggregate_Prof_Rating>;
  /** fetch aggregated fields from the table: "aggregate.prof_rating" */
  aggregate_prof_rating_aggregate: Aggregate_Prof_Rating_Aggregate;
  /** fetch data from the table: "aggregate.prof_review_rating" */
  aggregate_prof_review_rating: Array<Aggregate_Prof_Review_Rating>;
  /** fetch aggregated fields from the table: "aggregate.prof_review_rating" */
  aggregate_prof_review_rating_aggregate: Aggregate_Prof_Review_Rating_Aggregate;
  /** fetch data from the table: "course" */
  course: Array<Course>;
  /** fetch aggregated fields from the table: "course" */
  course_aggregate: Course_Aggregate;
  /** fetch data from the table: "course_antirequisite" */
  course_antirequisite: Array<Course_Antirequisite>;
  /** fetch aggregated fields from the table: "course_antirequisite" */
  course_antirequisite_aggregate: Course_Antirequisite_Aggregate;
  /** fetch data from the table: "course" using primary key columns */
  course_by_pk?: Maybe<Course>;
  /** fetch data from the table: "course_postrequisite" */
  course_postrequisite: Array<Course_Postrequisite>;
  /** fetch aggregated fields from the table: "course_postrequisite" */
  course_postrequisite_aggregate: Course_Postrequisite_Aggregate;
  /** fetch data from the table: "course_prerequisite" */
  course_prerequisite: Array<Course_Prerequisite>;
  /** fetch aggregated fields from the table: "course_prerequisite" */
  course_prerequisite_aggregate: Course_Prerequisite_Aggregate;
  /** fetch data from the table: "course_review_upvote" */
  course_review_upvote: Array<Course_Review_Upvote>;
  /** fetch aggregated fields from the table: "course_review_upvote" */
  course_review_upvote_aggregate: Course_Review_Upvote_Aggregate;
  /** fetch data from the table: "course_search_index" */
  course_search_index: Array<Course_Search_Index>;
  /** fetch aggregated fields from the table: "course_search_index" */
  course_search_index_aggregate: Course_Search_Index_Aggregate;
  /** fetch data from the table: "course_section" */
  course_section: Array<Course_Section>;
  /** fetch aggregated fields from the table: "course_section" */
  course_section_aggregate: Course_Section_Aggregate;
  /** fetch data from the table: "course_section" using primary key columns */
  course_section_by_pk?: Maybe<Course_Section>;
  /** fetch data from the table: "prof" */
  prof: Array<Prof>;
  /** fetch aggregated fields from the table: "prof" */
  prof_aggregate: Prof_Aggregate;
  /** fetch data from the table: "prof" using primary key columns */
  prof_by_pk?: Maybe<Prof>;
  /** fetch data from the table: "prof_review_upvote" */
  prof_review_upvote: Array<Prof_Review_Upvote>;
  /** fetch aggregated fields from the table: "prof_review_upvote" */
  prof_review_upvote_aggregate: Prof_Review_Upvote_Aggregate;
  /** fetch data from the table: "prof_search_index" */
  prof_search_index: Array<Prof_Search_Index>;
  /** fetch aggregated fields from the table: "prof_search_index" */
  prof_search_index_aggregate: Prof_Search_Index_Aggregate;
  /** fetch data from the table: "prof_teaches_course" */
  prof_teaches_course: Array<Prof_Teaches_Course>;
  /** fetch aggregated fields from the table: "prof_teaches_course" */
  prof_teaches_course_aggregate: Prof_Teaches_Course_Aggregate;
  /** fetch data from the table: "queue.section_subscribed" */
  queue_section_subscribed: Array<Queue_Section_Subscribed>;
  /** fetch aggregated fields from the table: "queue.section_subscribed" */
  queue_section_subscribed_aggregate: Queue_Section_Subscribed_Aggregate;
  /** fetch data from the table: "queue.section_subscribed" using primary key columns */
  queue_section_subscribed_by_pk?: Maybe<Queue_Section_Subscribed>;
  /** fetch data from the table: "review" */
  review: Array<Review>;
  /** fetch aggregated fields from the table: "review" */
  review_aggregate: Review_Aggregate;
  /** fetch data from the table: "review_author" */
  review_author: Array<Review_Author>;
  /** fetch aggregated fields from the table: "review_author" */
  review_author_aggregate: Review_Author_Aggregate;
  /** fetch data from the table: "review" using primary key columns */
  review_by_pk?: Maybe<Review>;
  /** fetch data from the table: "review_user_id" */
  review_user_id: Array<Review_User_Id>;
  /** fetch aggregated fields from the table: "review_user_id" */
  review_user_id_aggregate: Review_User_Id_Aggregate;
  /** execute function "search_courses" which returns "course_search_index" */
  search_courses: Array<Course_Search_Index>;
  /** execute function "search_courses" and query aggregates on result of table type "course_search_index" */
  search_courses_aggregate: Course_Search_Index_Aggregate;
  /** execute function "search_profs" which returns "prof_search_index" */
  search_profs: Array<Prof_Search_Index>;
  /** execute function "search_profs" and query aggregates on result of table type "prof_search_index" */
  search_profs_aggregate: Prof_Search_Index_Aggregate;
  /** fetch data from the table: "section_exam" */
  section_exam: Array<Section_Exam>;
  /** fetch aggregated fields from the table: "section_exam" */
  section_exam_aggregate: Section_Exam_Aggregate;
  /** fetch data from the table: "section_meeting" */
  section_meeting: Array<Section_Meeting>;
  /** fetch aggregated fields from the table: "section_meeting" */
  section_meeting_aggregate: Section_Meeting_Aggregate;
  /** fetch data from the table: "user" */
  user: Array<User>;
  /** fetch aggregated fields from the table: "user" */
  user_aggregate: User_Aggregate;
  /** fetch data from the table: "user" using primary key columns */
  user_by_pk?: Maybe<User>;
  /** fetch data from the table: "user_course_taken" */
  user_course_taken: Array<User_Course_Taken>;
  /** fetch aggregated fields from the table: "user_course_taken" */
  user_course_taken_aggregate: User_Course_Taken_Aggregate;
  /** fetch data from the table: "user_schedule" */
  user_schedule: Array<User_Schedule>;
  /** fetch aggregated fields from the table: "user_schedule" */
  user_schedule_aggregate: User_Schedule_Aggregate;
  /** fetch data from the table: "user_schedule_swap" */
  user_schedule_swap: Array<User_Schedule_Swap>;
  /** fetch aggregated fields from the table: "user_schedule_swap" */
  user_schedule_swap_aggregate: User_Schedule_Swap_Aggregate;
  /** fetch data from the table: "user_schedule_swap" using primary key columns */
  user_schedule_swap_by_pk?: Maybe<User_Schedule_Swap>;
  /** fetch data from the table: "user_shortlist" */
  user_shortlist: Array<User_Shortlist>;
  /** fetch aggregated fields from the table: "user_shortlist" */
  user_shortlist_aggregate: User_Shortlist_Aggregate;
};

export type Query_RootAggregate_Course_Easy_BucketsArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Course_Easy_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Course_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Course_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Course_Review_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Course_Review_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Course_Useful_BucketsArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Course_Useful_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Course_Useful_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Course_Useful_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Clear_BucketsArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Clear_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Engaging_BucketsArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Prof_Engaging_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Engaging_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Prof_Engaging_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

export type Query_RootAggregate_Prof_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Review_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
};

export type Query_RootAggregate_Prof_Review_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
};

export type Query_RootCourseArgs = {
  distinct_on?: InputMaybe<Array<Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Order_By>>;
  where?: InputMaybe<Course_Bool_Exp>;
};

export type Query_RootCourse_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Order_By>>;
  where?: InputMaybe<Course_Bool_Exp>;
};

export type Query_RootCourse_AntirequisiteArgs = {
  distinct_on?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Antirequisite_Order_By>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

export type Query_RootCourse_Antirequisite_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Antirequisite_Order_By>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

export type Query_RootCourse_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Query_RootCourse_PostrequisiteArgs = {
  distinct_on?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Postrequisite_Order_By>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

export type Query_RootCourse_Postrequisite_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Postrequisite_Order_By>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

export type Query_RootCourse_PrerequisiteArgs = {
  distinct_on?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Prerequisite_Order_By>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

export type Query_RootCourse_Prerequisite_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Prerequisite_Order_By>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

export type Query_RootCourse_Review_UpvoteArgs = {
  distinct_on?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Review_Upvote_Order_By>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

export type Query_RootCourse_Review_Upvote_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Review_Upvote_Order_By>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

export type Query_RootCourse_Search_IndexArgs = {
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Query_RootCourse_Search_Index_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Query_RootCourse_SectionArgs = {
  distinct_on?: InputMaybe<Array<Course_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Section_Order_By>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

export type Query_RootCourse_Section_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Section_Order_By>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

export type Query_RootCourse_Section_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Query_RootProfArgs = {
  distinct_on?: InputMaybe<Array<Prof_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Order_By>>;
  where?: InputMaybe<Prof_Bool_Exp>;
};

export type Query_RootProf_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Order_By>>;
  where?: InputMaybe<Prof_Bool_Exp>;
};

export type Query_RootProf_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Query_RootProf_Review_UpvoteArgs = {
  distinct_on?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Review_Upvote_Order_By>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

export type Query_RootProf_Review_Upvote_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Review_Upvote_Order_By>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

export type Query_RootProf_Search_IndexArgs = {
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Query_RootProf_Search_Index_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Query_RootProf_Teaches_CourseArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

export type Query_RootProf_Teaches_Course_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

export type Query_RootQueue_Section_SubscribedArgs = {
  distinct_on?: InputMaybe<Array<Queue_Section_Subscribed_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Queue_Section_Subscribed_Order_By>>;
  where?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
};

export type Query_RootQueue_Section_Subscribed_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Queue_Section_Subscribed_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Queue_Section_Subscribed_Order_By>>;
  where?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
};

export type Query_RootQueue_Section_Subscribed_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Query_RootReviewArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

export type Query_RootReview_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

export type Query_RootReview_AuthorArgs = {
  distinct_on?: InputMaybe<Array<Review_Author_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Author_Order_By>>;
  where?: InputMaybe<Review_Author_Bool_Exp>;
};

export type Query_RootReview_Author_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Author_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Author_Order_By>>;
  where?: InputMaybe<Review_Author_Bool_Exp>;
};

export type Query_RootReview_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Query_RootReview_User_IdArgs = {
  distinct_on?: InputMaybe<Array<Review_User_Id_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_User_Id_Order_By>>;
  where?: InputMaybe<Review_User_Id_Bool_Exp>;
};

export type Query_RootReview_User_Id_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_User_Id_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_User_Id_Order_By>>;
  where?: InputMaybe<Review_User_Id_Bool_Exp>;
};

export type Query_RootSearch_CoursesArgs = {
  args: Search_Courses_Args;
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Query_RootSearch_Courses_AggregateArgs = {
  args: Search_Courses_Args;
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Query_RootSearch_ProfsArgs = {
  args: Search_Profs_Args;
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Query_RootSearch_Profs_AggregateArgs = {
  args: Search_Profs_Args;
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Query_RootSection_ExamArgs = {
  distinct_on?: InputMaybe<Array<Section_Exam_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Exam_Order_By>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

export type Query_RootSection_Exam_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Section_Exam_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Exam_Order_By>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

export type Query_RootSection_MeetingArgs = {
  distinct_on?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Meeting_Order_By>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

export type Query_RootSection_Meeting_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Meeting_Order_By>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

export type Query_RootUserArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};

export type Query_RootUser_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};

export type Query_RootUser_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Query_RootUser_Course_TakenArgs = {
  distinct_on?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Course_Taken_Order_By>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

export type Query_RootUser_Course_Taken_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Course_Taken_Order_By>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

export type Query_RootUser_ScheduleArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Order_By>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

export type Query_RootUser_Schedule_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Order_By>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

export type Query_RootUser_Schedule_SwapArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Swap_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Swap_Order_By>>;
  where?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
};

export type Query_RootUser_Schedule_Swap_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Swap_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Swap_Order_By>>;
  where?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
};

export type Query_RootUser_Schedule_Swap_By_PkArgs = {
  source_section_id: Scalars['Int']['input'];
  user_id: Scalars['Int']['input'];
};

export type Query_RootUser_ShortlistArgs = {
  distinct_on?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Shortlist_Order_By>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

export type Query_RootUser_Shortlist_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Shortlist_Order_By>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

/** columns and relationships of "queue.section_subscribed" */
export type Queue_Section_Subscribed = {
  __typename?: 'queue_section_subscribed';
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['Int']['output'];
  /** An object relationship */
  section: Course_Section;
  section_id: Scalars['Int']['output'];
  seen_at?: Maybe<Scalars['timestamptz']['output']>;
  /** An object relationship */
  user: User;
  user_id: Scalars['Int']['output'];
};

/** aggregated selection of "queue.section_subscribed" */
export type Queue_Section_Subscribed_Aggregate = {
  __typename?: 'queue_section_subscribed_aggregate';
  aggregate?: Maybe<Queue_Section_Subscribed_Aggregate_Fields>;
  nodes: Array<Queue_Section_Subscribed>;
};

/** aggregate fields of "queue.section_subscribed" */
export type Queue_Section_Subscribed_Aggregate_Fields = {
  __typename?: 'queue_section_subscribed_aggregate_fields';
  avg?: Maybe<Queue_Section_Subscribed_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Queue_Section_Subscribed_Max_Fields>;
  min?: Maybe<Queue_Section_Subscribed_Min_Fields>;
  stddev?: Maybe<Queue_Section_Subscribed_Stddev_Fields>;
  stddev_pop?: Maybe<Queue_Section_Subscribed_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Queue_Section_Subscribed_Stddev_Samp_Fields>;
  sum?: Maybe<Queue_Section_Subscribed_Sum_Fields>;
  var_pop?: Maybe<Queue_Section_Subscribed_Var_Pop_Fields>;
  var_samp?: Maybe<Queue_Section_Subscribed_Var_Samp_Fields>;
  variance?: Maybe<Queue_Section_Subscribed_Variance_Fields>;
};

/** aggregate fields of "queue.section_subscribed" */
export type Queue_Section_Subscribed_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Queue_Section_Subscribed_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Queue_Section_Subscribed_Avg_Fields = {
  __typename?: 'queue_section_subscribed_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "queue.section_subscribed". All fields are combined with a logical 'AND'. */
export type Queue_Section_Subscribed_Bool_Exp = {
  _and?: InputMaybe<Array<Queue_Section_Subscribed_Bool_Exp>>;
  _not?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
  _or?: InputMaybe<Array<Queue_Section_Subscribed_Bool_Exp>>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  section?: InputMaybe<Course_Section_Bool_Exp>;
  section_id?: InputMaybe<Int_Comparison_Exp>;
  seen_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "queue.section_subscribed" */
export enum Queue_Section_Subscribed_Constraint {
  /** unique or primary key constraint on columns "id" */
  SectionSubscribedPkey = 'section_subscribed_pkey',
  /** unique or primary key constraint on columns "section_id", "user_id" */
  SectionSubscribedUnique = 'section_subscribed_unique',
}

/** input type for incrementing numeric columns in table "queue.section_subscribed" */
export type Queue_Section_Subscribed_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "queue.section_subscribed" */
export type Queue_Section_Subscribed_Insert_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  section?: InputMaybe<Course_Section_Obj_Rel_Insert_Input>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<User_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Queue_Section_Subscribed_Max_Fields = {
  __typename?: 'queue_section_subscribed_max_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  seen_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type Queue_Section_Subscribed_Min_Fields = {
  __typename?: 'queue_section_subscribed_min_fields';
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  seen_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** response of any mutation on the table "queue.section_subscribed" */
export type Queue_Section_Subscribed_Mutation_Response = {
  __typename?: 'queue_section_subscribed_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Queue_Section_Subscribed>;
};

/** on_conflict condition type for table "queue.section_subscribed" */
export type Queue_Section_Subscribed_On_Conflict = {
  constraint: Queue_Section_Subscribed_Constraint;
  update_columns?: Array<Queue_Section_Subscribed_Update_Column>;
  where?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
};

/** Ordering options when selecting data from "queue.section_subscribed". */
export type Queue_Section_Subscribed_Order_By = {
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  section?: InputMaybe<Course_Section_Order_By>;
  section_id?: InputMaybe<Order_By>;
  seen_at?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: queue.section_subscribed */
export type Queue_Section_Subscribed_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "queue.section_subscribed" */
export enum Queue_Section_Subscribed_Select_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  SeenAt = 'seen_at',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "queue.section_subscribed" */
export type Queue_Section_Subscribed_Set_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Queue_Section_Subscribed_Stddev_Fields = {
  __typename?: 'queue_section_subscribed_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Queue_Section_Subscribed_Stddev_Pop_Fields = {
  __typename?: 'queue_section_subscribed_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Queue_Section_Subscribed_Stddev_Samp_Fields = {
  __typename?: 'queue_section_subscribed_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "queue_section_subscribed" */
export type Queue_Section_Subscribed_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Queue_Section_Subscribed_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Queue_Section_Subscribed_Stream_Cursor_Value_Input = {
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  seen_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Queue_Section_Subscribed_Sum_Fields = {
  __typename?: 'queue_section_subscribed_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "queue.section_subscribed" */
export enum Queue_Section_Subscribed_Update_Column {
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  SeenAt = 'seen_at',
  /** column name */
  UserId = 'user_id',
}

export type Queue_Section_Subscribed_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Queue_Section_Subscribed_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Queue_Section_Subscribed_Set_Input>;
  /** filter the rows which have to be updated */
  where: Queue_Section_Subscribed_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Queue_Section_Subscribed_Var_Pop_Fields = {
  __typename?: 'queue_section_subscribed_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Queue_Section_Subscribed_Var_Samp_Fields = {
  __typename?: 'queue_section_subscribed_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Queue_Section_Subscribed_Variance_Fields = {
  __typename?: 'queue_section_subscribed_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** columns and relationships of "review" */
export type Review = {
  __typename?: 'review';
  /** An object relationship */
  author?: Maybe<Review_Author>;
  /** An object relationship */
  course?: Maybe<Course>;
  course_comment?: Maybe<Scalars['String']['output']>;
  course_easy?: Maybe<Scalars['smallint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  course_review_rating?: Maybe<Aggregate_Course_Review_Rating>;
  /** An array relationship */
  course_review_upvotes: Array<Course_Review_Upvote>;
  /** An aggregate relationship */
  course_review_upvotes_aggregate: Course_Review_Upvote_Aggregate;
  course_useful?: Maybe<Scalars['smallint']['output']>;
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['Int']['output'];
  legacy: Scalars['Boolean']['output'];
  liked?: Maybe<Scalars['smallint']['output']>;
  /** An object relationship */
  prof?: Maybe<Prof>;
  prof_clear?: Maybe<Scalars['smallint']['output']>;
  prof_comment?: Maybe<Scalars['String']['output']>;
  prof_engaging?: Maybe<Scalars['smallint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  /** An object relationship */
  prof_review_rating?: Maybe<Aggregate_Prof_Review_Rating>;
  /** An array relationship */
  prof_review_upvotes: Array<Prof_Review_Upvote>;
  /** An aggregate relationship */
  prof_review_upvotes_aggregate: Prof_Review_Upvote_Aggregate;
  public: Scalars['Boolean']['output'];
  updated_at: Scalars['timestamptz']['output'];
  /** An object relationship */
  user?: Maybe<Review_User_Id>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** columns and relationships of "review" */
export type ReviewCourse_Review_UpvotesArgs = {
  distinct_on?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Review_Upvote_Order_By>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

/** columns and relationships of "review" */
export type ReviewCourse_Review_Upvotes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Review_Upvote_Order_By>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

/** columns and relationships of "review" */
export type ReviewProf_Review_UpvotesArgs = {
  distinct_on?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Review_Upvote_Order_By>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

/** columns and relationships of "review" */
export type ReviewProf_Review_Upvotes_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Review_Upvote_Order_By>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

/** aggregated selection of "review" */
export type Review_Aggregate = {
  __typename?: 'review_aggregate';
  aggregate?: Maybe<Review_Aggregate_Fields>;
  nodes: Array<Review>;
};

export type Review_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Review_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Review_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Review_Aggregate_Bool_Exp_Count>;
};

export type Review_Aggregate_Bool_Exp_Bool_And = {
  arguments: Review_Select_Column_Review_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Review_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Review_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Review_Select_Column_Review_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Review_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Review_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Review_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Review_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "review" */
export type Review_Aggregate_Fields = {
  __typename?: 'review_aggregate_fields';
  avg?: Maybe<Review_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Review_Max_Fields>;
  min?: Maybe<Review_Min_Fields>;
  stddev?: Maybe<Review_Stddev_Fields>;
  stddev_pop?: Maybe<Review_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Review_Stddev_Samp_Fields>;
  sum?: Maybe<Review_Sum_Fields>;
  var_pop?: Maybe<Review_Var_Pop_Fields>;
  var_samp?: Maybe<Review_Var_Samp_Fields>;
  variance?: Maybe<Review_Variance_Fields>;
};

/** aggregate fields of "review" */
export type Review_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Review_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "review" */
export type Review_Aggregate_Order_By = {
  avg?: InputMaybe<Review_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Review_Max_Order_By>;
  min?: InputMaybe<Review_Min_Order_By>;
  stddev?: InputMaybe<Review_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Review_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Review_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Review_Sum_Order_By>;
  var_pop?: InputMaybe<Review_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Review_Var_Samp_Order_By>;
  variance?: InputMaybe<Review_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "review" */
export type Review_Arr_Rel_Insert_Input = {
  data: Array<Review_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Review_On_Conflict>;
};

/** columns and relationships of "review_author" */
export type Review_Author = {
  __typename?: 'review_author';
  full_name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
  program?: Maybe<Scalars['String']['output']>;
  review_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "review_author" */
export type Review_Author_Aggregate = {
  __typename?: 'review_author_aggregate';
  aggregate?: Maybe<Review_Author_Aggregate_Fields>;
  nodes: Array<Review_Author>;
};

/** aggregate fields of "review_author" */
export type Review_Author_Aggregate_Fields = {
  __typename?: 'review_author_aggregate_fields';
  avg?: Maybe<Review_Author_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Review_Author_Max_Fields>;
  min?: Maybe<Review_Author_Min_Fields>;
  stddev?: Maybe<Review_Author_Stddev_Fields>;
  stddev_pop?: Maybe<Review_Author_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Review_Author_Stddev_Samp_Fields>;
  sum?: Maybe<Review_Author_Sum_Fields>;
  var_pop?: Maybe<Review_Author_Var_Pop_Fields>;
  var_samp?: Maybe<Review_Author_Var_Samp_Fields>;
  variance?: Maybe<Review_Author_Variance_Fields>;
};

/** aggregate fields of "review_author" */
export type Review_Author_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Review_Author_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Review_Author_Avg_Fields = {
  __typename?: 'review_author_avg_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "review_author". All fields are combined with a logical 'AND'. */
export type Review_Author_Bool_Exp = {
  _and?: InputMaybe<Array<Review_Author_Bool_Exp>>;
  _not?: InputMaybe<Review_Author_Bool_Exp>;
  _or?: InputMaybe<Array<Review_Author_Bool_Exp>>;
  full_name?: InputMaybe<String_Comparison_Exp>;
  picture_url?: InputMaybe<String_Comparison_Exp>;
  program?: InputMaybe<String_Comparison_Exp>;
  review_id?: InputMaybe<Int_Comparison_Exp>;
};

/** input type for inserting data into table "review_author" */
export type Review_Author_Insert_Input = {
  full_name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
  program?: InputMaybe<Scalars['String']['input']>;
  review_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Review_Author_Max_Fields = {
  __typename?: 'review_author_max_fields';
  full_name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
  program?: Maybe<Scalars['String']['output']>;
  review_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type Review_Author_Min_Fields = {
  __typename?: 'review_author_min_fields';
  full_name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
  program?: Maybe<Scalars['String']['output']>;
  review_id?: Maybe<Scalars['Int']['output']>;
};

/** input type for inserting object relation for remote table "review_author" */
export type Review_Author_Obj_Rel_Insert_Input = {
  data: Review_Author_Insert_Input;
};

/** Ordering options when selecting data from "review_author". */
export type Review_Author_Order_By = {
  full_name?: InputMaybe<Order_By>;
  picture_url?: InputMaybe<Order_By>;
  program?: InputMaybe<Order_By>;
  review_id?: InputMaybe<Order_By>;
};

/** select columns of table "review_author" */
export enum Review_Author_Select_Column {
  /** column name */
  FullName = 'full_name',
  /** column name */
  PictureUrl = 'picture_url',
  /** column name */
  Program = 'program',
  /** column name */
  ReviewId = 'review_id',
}

/** aggregate stddev on columns */
export type Review_Author_Stddev_Fields = {
  __typename?: 'review_author_stddev_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Review_Author_Stddev_Pop_Fields = {
  __typename?: 'review_author_stddev_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Review_Author_Stddev_Samp_Fields = {
  __typename?: 'review_author_stddev_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "review_author" */
export type Review_Author_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Review_Author_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Review_Author_Stream_Cursor_Value_Input = {
  full_name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
  program?: InputMaybe<Scalars['String']['input']>;
  review_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Review_Author_Sum_Fields = {
  __typename?: 'review_author_sum_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate var_pop on columns */
export type Review_Author_Var_Pop_Fields = {
  __typename?: 'review_author_var_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Review_Author_Var_Samp_Fields = {
  __typename?: 'review_author_var_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Review_Author_Variance_Fields = {
  __typename?: 'review_author_variance_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate avg on columns */
export type Review_Avg_Fields = {
  __typename?: 'review_avg_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "review" */
export type Review_Avg_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "review". All fields are combined with a logical 'AND'. */
export type Review_Bool_Exp = {
  _and?: InputMaybe<Array<Review_Bool_Exp>>;
  _not?: InputMaybe<Review_Bool_Exp>;
  _or?: InputMaybe<Array<Review_Bool_Exp>>;
  author?: InputMaybe<Review_Author_Bool_Exp>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_comment?: InputMaybe<String_Comparison_Exp>;
  course_easy?: InputMaybe<Smallint_Comparison_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  course_review_rating?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
  course_review_upvotes?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
  course_review_upvotes_aggregate?: InputMaybe<Course_Review_Upvote_Aggregate_Bool_Exp>;
  course_useful?: InputMaybe<Smallint_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  legacy?: InputMaybe<Boolean_Comparison_Exp>;
  liked?: InputMaybe<Smallint_Comparison_Exp>;
  prof?: InputMaybe<Prof_Bool_Exp>;
  prof_clear?: InputMaybe<Smallint_Comparison_Exp>;
  prof_comment?: InputMaybe<String_Comparison_Exp>;
  prof_engaging?: InputMaybe<Smallint_Comparison_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
  prof_review_rating?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
  prof_review_upvotes?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
  prof_review_upvotes_aggregate?: InputMaybe<Prof_Review_Upvote_Aggregate_Bool_Exp>;
  public?: InputMaybe<Boolean_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  user?: InputMaybe<Review_User_Id_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "review" */
export enum Review_Constraint {
  /** unique or primary key constraint on columns "user_id", "course_id" */
  CourseUniquelyReviewed = 'course_uniquely_reviewed',
  /** unique or primary key constraint on columns "id" */
  ReviewPkey = 'review_pkey',
}

/** input type for incrementing numeric columns in table "review" */
export type Review_Inc_Input = {
  course_easy?: InputMaybe<Scalars['smallint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  course_useful?: InputMaybe<Scalars['smallint']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  liked?: InputMaybe<Scalars['smallint']['input']>;
  prof_clear?: InputMaybe<Scalars['smallint']['input']>;
  prof_engaging?: InputMaybe<Scalars['smallint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "review" */
export type Review_Insert_Input = {
  author?: InputMaybe<Review_Author_Obj_Rel_Insert_Input>;
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_comment?: InputMaybe<Scalars['String']['input']>;
  course_easy?: InputMaybe<Scalars['smallint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  course_review_rating?: InputMaybe<Aggregate_Course_Review_Rating_Obj_Rel_Insert_Input>;
  course_review_upvotes?: InputMaybe<Course_Review_Upvote_Arr_Rel_Insert_Input>;
  course_useful?: InputMaybe<Scalars['smallint']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  legacy?: InputMaybe<Scalars['Boolean']['input']>;
  liked?: InputMaybe<Scalars['smallint']['input']>;
  prof?: InputMaybe<Prof_Obj_Rel_Insert_Input>;
  prof_clear?: InputMaybe<Scalars['smallint']['input']>;
  prof_comment?: InputMaybe<Scalars['String']['input']>;
  prof_engaging?: InputMaybe<Scalars['smallint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  prof_review_rating?: InputMaybe<Aggregate_Prof_Review_Rating_Obj_Rel_Insert_Input>;
  prof_review_upvotes?: InputMaybe<Prof_Review_Upvote_Arr_Rel_Insert_Input>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user?: InputMaybe<Review_User_Id_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Review_Max_Fields = {
  __typename?: 'review_max_fields';
  course_comment?: Maybe<Scalars['String']['output']>;
  course_easy?: Maybe<Scalars['smallint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  course_useful?: Maybe<Scalars['smallint']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  liked?: Maybe<Scalars['smallint']['output']>;
  prof_clear?: Maybe<Scalars['smallint']['output']>;
  prof_comment?: Maybe<Scalars['String']['output']>;
  prof_engaging?: Maybe<Scalars['smallint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "review" */
export type Review_Max_Order_By = {
  course_comment?: InputMaybe<Order_By>;
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_comment?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Review_Min_Fields = {
  __typename?: 'review_min_fields';
  course_comment?: Maybe<Scalars['String']['output']>;
  course_easy?: Maybe<Scalars['smallint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  course_useful?: Maybe<Scalars['smallint']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  liked?: Maybe<Scalars['smallint']['output']>;
  prof_clear?: Maybe<Scalars['smallint']['output']>;
  prof_comment?: Maybe<Scalars['String']['output']>;
  prof_engaging?: Maybe<Scalars['smallint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "review" */
export type Review_Min_Order_By = {
  course_comment?: InputMaybe<Order_By>;
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_comment?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "review" */
export type Review_Mutation_Response = {
  __typename?: 'review_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Review>;
};

/** on_conflict condition type for table "review" */
export type Review_On_Conflict = {
  constraint: Review_Constraint;
  update_columns?: Array<Review_Update_Column>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** Ordering options when selecting data from "review". */
export type Review_Order_By = {
  author?: InputMaybe<Review_Author_Order_By>;
  course?: InputMaybe<Course_Order_By>;
  course_comment?: InputMaybe<Order_By>;
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_review_rating?: InputMaybe<Aggregate_Course_Review_Rating_Order_By>;
  course_review_upvotes_aggregate?: InputMaybe<Course_Review_Upvote_Aggregate_Order_By>;
  course_useful?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  legacy?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof?: InputMaybe<Prof_Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_comment?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  prof_review_rating?: InputMaybe<Aggregate_Prof_Review_Rating_Order_By>;
  prof_review_upvotes_aggregate?: InputMaybe<Prof_Review_Upvote_Aggregate_Order_By>;
  public?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
  user?: InputMaybe<Review_User_Id_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: review */
export type Review_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "review" */
export enum Review_Select_Column {
  /** column name */
  CourseComment = 'course_comment',
  /** column name */
  CourseEasy = 'course_easy',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  CourseUseful = 'course_useful',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Legacy = 'legacy',
  /** column name */
  Liked = 'liked',
  /** column name */
  ProfClear = 'prof_clear',
  /** column name */
  ProfComment = 'prof_comment',
  /** column name */
  ProfEngaging = 'prof_engaging',
  /** column name */
  ProfId = 'prof_id',
  /** column name */
  Public = 'public',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
}

/** select "review_aggregate_bool_exp_bool_and_arguments_columns" columns of table "review" */
export enum Review_Select_Column_Review_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  Legacy = 'legacy',
  /** column name */
  Public = 'public',
}

/** select "review_aggregate_bool_exp_bool_or_arguments_columns" columns of table "review" */
export enum Review_Select_Column_Review_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  Legacy = 'legacy',
  /** column name */
  Public = 'public',
}

/** input type for updating data in table "review" */
export type Review_Set_Input = {
  course_comment?: InputMaybe<Scalars['String']['input']>;
  course_easy?: InputMaybe<Scalars['smallint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  course_useful?: InputMaybe<Scalars['smallint']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  legacy?: InputMaybe<Scalars['Boolean']['input']>;
  liked?: InputMaybe<Scalars['smallint']['input']>;
  prof_clear?: InputMaybe<Scalars['smallint']['input']>;
  prof_comment?: InputMaybe<Scalars['String']['input']>;
  prof_engaging?: InputMaybe<Scalars['smallint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Review_Stddev_Fields = {
  __typename?: 'review_stddev_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "review" */
export type Review_Stddev_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Review_Stddev_Pop_Fields = {
  __typename?: 'review_stddev_pop_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "review" */
export type Review_Stddev_Pop_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Review_Stddev_Samp_Fields = {
  __typename?: 'review_stddev_samp_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "review" */
export type Review_Stddev_Samp_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "review" */
export type Review_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Review_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Review_Stream_Cursor_Value_Input = {
  course_comment?: InputMaybe<Scalars['String']['input']>;
  course_easy?: InputMaybe<Scalars['smallint']['input']>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  course_useful?: InputMaybe<Scalars['smallint']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  legacy?: InputMaybe<Scalars['Boolean']['input']>;
  liked?: InputMaybe<Scalars['smallint']['input']>;
  prof_clear?: InputMaybe<Scalars['smallint']['input']>;
  prof_comment?: InputMaybe<Scalars['String']['input']>;
  prof_engaging?: InputMaybe<Scalars['smallint']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  public?: InputMaybe<Scalars['Boolean']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Review_Sum_Fields = {
  __typename?: 'review_sum_fields';
  course_easy?: Maybe<Scalars['smallint']['output']>;
  course_id?: Maybe<Scalars['Int']['output']>;
  course_useful?: Maybe<Scalars['smallint']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  liked?: Maybe<Scalars['smallint']['output']>;
  prof_clear?: Maybe<Scalars['smallint']['output']>;
  prof_engaging?: Maybe<Scalars['smallint']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "review" */
export type Review_Sum_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** update columns of table "review" */
export enum Review_Update_Column {
  /** column name */
  CourseComment = 'course_comment',
  /** column name */
  CourseEasy = 'course_easy',
  /** column name */
  CourseId = 'course_id',
  /** column name */
  CourseUseful = 'course_useful',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  Legacy = 'legacy',
  /** column name */
  Liked = 'liked',
  /** column name */
  ProfClear = 'prof_clear',
  /** column name */
  ProfComment = 'prof_comment',
  /** column name */
  ProfEngaging = 'prof_engaging',
  /** column name */
  ProfId = 'prof_id',
  /** column name */
  Public = 'public',
  /** column name */
  UpdatedAt = 'updated_at',
  /** column name */
  UserId = 'user_id',
}

export type Review_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Review_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Review_Set_Input>;
  /** filter the rows which have to be updated */
  where: Review_Bool_Exp;
};

/** columns and relationships of "review_user_id" */
export type Review_User_Id = {
  __typename?: 'review_user_id';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "review_user_id" */
export type Review_User_Id_Aggregate = {
  __typename?: 'review_user_id_aggregate';
  aggregate?: Maybe<Review_User_Id_Aggregate_Fields>;
  nodes: Array<Review_User_Id>;
};

/** aggregate fields of "review_user_id" */
export type Review_User_Id_Aggregate_Fields = {
  __typename?: 'review_user_id_aggregate_fields';
  avg?: Maybe<Review_User_Id_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Review_User_Id_Max_Fields>;
  min?: Maybe<Review_User_Id_Min_Fields>;
  stddev?: Maybe<Review_User_Id_Stddev_Fields>;
  stddev_pop?: Maybe<Review_User_Id_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Review_User_Id_Stddev_Samp_Fields>;
  sum?: Maybe<Review_User_Id_Sum_Fields>;
  var_pop?: Maybe<Review_User_Id_Var_Pop_Fields>;
  var_samp?: Maybe<Review_User_Id_Var_Samp_Fields>;
  variance?: Maybe<Review_User_Id_Variance_Fields>;
};

/** aggregate fields of "review_user_id" */
export type Review_User_Id_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Review_User_Id_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Review_User_Id_Avg_Fields = {
  __typename?: 'review_user_id_avg_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "review_user_id". All fields are combined with a logical 'AND'. */
export type Review_User_Id_Bool_Exp = {
  _and?: InputMaybe<Array<Review_User_Id_Bool_Exp>>;
  _not?: InputMaybe<Review_User_Id_Bool_Exp>;
  _or?: InputMaybe<Array<Review_User_Id_Bool_Exp>>;
  review_id?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "review_user_id" */
export type Review_User_Id_Inc_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "review_user_id" */
export type Review_User_Id_Insert_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Review_User_Id_Max_Fields = {
  __typename?: 'review_user_id_max_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type Review_User_Id_Min_Fields = {
  __typename?: 'review_user_id_min_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** response of any mutation on the table "review_user_id" */
export type Review_User_Id_Mutation_Response = {
  __typename?: 'review_user_id_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Review_User_Id>;
};

/** input type for inserting object relation for remote table "review_user_id" */
export type Review_User_Id_Obj_Rel_Insert_Input = {
  data: Review_User_Id_Insert_Input;
};

/** Ordering options when selecting data from "review_user_id". */
export type Review_User_Id_Order_By = {
  review_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "review_user_id" */
export enum Review_User_Id_Select_Column {
  /** column name */
  ReviewId = 'review_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "review_user_id" */
export type Review_User_Id_Set_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Review_User_Id_Stddev_Fields = {
  __typename?: 'review_user_id_stddev_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Review_User_Id_Stddev_Pop_Fields = {
  __typename?: 'review_user_id_stddev_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Review_User_Id_Stddev_Samp_Fields = {
  __typename?: 'review_user_id_stddev_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "review_user_id" */
export type Review_User_Id_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Review_User_Id_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Review_User_Id_Stream_Cursor_Value_Input = {
  review_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Review_User_Id_Sum_Fields = {
  __typename?: 'review_user_id_sum_fields';
  review_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

export type Review_User_Id_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Review_User_Id_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Review_User_Id_Set_Input>;
  /** filter the rows which have to be updated */
  where: Review_User_Id_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Review_User_Id_Var_Pop_Fields = {
  __typename?: 'review_user_id_var_pop_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Review_User_Id_Var_Samp_Fields = {
  __typename?: 'review_user_id_var_samp_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Review_User_Id_Variance_Fields = {
  __typename?: 'review_user_id_variance_fields';
  review_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_pop on columns */
export type Review_Var_Pop_Fields = {
  __typename?: 'review_var_pop_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "review" */
export type Review_Var_Pop_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Review_Var_Samp_Fields = {
  __typename?: 'review_var_samp_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "review" */
export type Review_Var_Samp_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Review_Variance_Fields = {
  __typename?: 'review_variance_fields';
  course_easy?: Maybe<Scalars['Float']['output']>;
  course_id?: Maybe<Scalars['Float']['output']>;
  course_useful?: Maybe<Scalars['Float']['output']>;
  id?: Maybe<Scalars['Float']['output']>;
  liked?: Maybe<Scalars['Float']['output']>;
  prof_clear?: Maybe<Scalars['Float']['output']>;
  prof_engaging?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "review" */
export type Review_Variance_Order_By = {
  course_easy?: InputMaybe<Order_By>;
  course_id?: InputMaybe<Order_By>;
  course_useful?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  liked?: InputMaybe<Order_By>;
  prof_clear?: InputMaybe<Order_By>;
  prof_engaging?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

export type Search_Courses_Args = {
  code_only?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

export type Search_Profs_Args = {
  code_only?: InputMaybe<Scalars['Boolean']['input']>;
  query?: InputMaybe<Scalars['String']['input']>;
};

/** columns and relationships of "section_exam" */
export type Section_Exam = {
  __typename?: 'section_exam';
  date?: Maybe<Scalars['date']['output']>;
  day?: Maybe<Scalars['String']['output']>;
  end_seconds?: Maybe<Scalars['Int']['output']>;
  is_tba: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  section_id: Scalars['Int']['output'];
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "section_exam" */
export type Section_Exam_Aggregate = {
  __typename?: 'section_exam_aggregate';
  aggregate?: Maybe<Section_Exam_Aggregate_Fields>;
  nodes: Array<Section_Exam>;
};

export type Section_Exam_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Section_Exam_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Section_Exam_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Section_Exam_Aggregate_Bool_Exp_Count>;
};

export type Section_Exam_Aggregate_Bool_Exp_Bool_And = {
  arguments: Section_Exam_Select_Column_Section_Exam_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Section_Exam_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Section_Exam_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Section_Exam_Select_Column_Section_Exam_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Section_Exam_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Section_Exam_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Section_Exam_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Section_Exam_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "section_exam" */
export type Section_Exam_Aggregate_Fields = {
  __typename?: 'section_exam_aggregate_fields';
  avg?: Maybe<Section_Exam_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Section_Exam_Max_Fields>;
  min?: Maybe<Section_Exam_Min_Fields>;
  stddev?: Maybe<Section_Exam_Stddev_Fields>;
  stddev_pop?: Maybe<Section_Exam_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Section_Exam_Stddev_Samp_Fields>;
  sum?: Maybe<Section_Exam_Sum_Fields>;
  var_pop?: Maybe<Section_Exam_Var_Pop_Fields>;
  var_samp?: Maybe<Section_Exam_Var_Samp_Fields>;
  variance?: Maybe<Section_Exam_Variance_Fields>;
};

/** aggregate fields of "section_exam" */
export type Section_Exam_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Section_Exam_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "section_exam" */
export type Section_Exam_Aggregate_Order_By = {
  avg?: InputMaybe<Section_Exam_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Section_Exam_Max_Order_By>;
  min?: InputMaybe<Section_Exam_Min_Order_By>;
  stddev?: InputMaybe<Section_Exam_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Section_Exam_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Section_Exam_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Section_Exam_Sum_Order_By>;
  var_pop?: InputMaybe<Section_Exam_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Section_Exam_Var_Samp_Order_By>;
  variance?: InputMaybe<Section_Exam_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "section_exam" */
export type Section_Exam_Arr_Rel_Insert_Input = {
  data: Array<Section_Exam_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<Section_Exam_On_Conflict>;
};

/** aggregate avg on columns */
export type Section_Exam_Avg_Fields = {
  __typename?: 'section_exam_avg_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "section_exam" */
export type Section_Exam_Avg_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "section_exam". All fields are combined with a logical 'AND'. */
export type Section_Exam_Bool_Exp = {
  _and?: InputMaybe<Array<Section_Exam_Bool_Exp>>;
  _not?: InputMaybe<Section_Exam_Bool_Exp>;
  _or?: InputMaybe<Array<Section_Exam_Bool_Exp>>;
  date?: InputMaybe<Date_Comparison_Exp>;
  day?: InputMaybe<String_Comparison_Exp>;
  end_seconds?: InputMaybe<Int_Comparison_Exp>;
  is_tba?: InputMaybe<Boolean_Comparison_Exp>;
  location?: InputMaybe<String_Comparison_Exp>;
  section_id?: InputMaybe<Int_Comparison_Exp>;
  start_seconds?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "section_exam" */
export enum Section_Exam_Constraint {
  /** unique or primary key constraint on columns "section_id" */
  ExamUniqueToSection = 'exam_unique_to_section',
}

/** input type for incrementing numeric columns in table "section_exam" */
export type Section_Exam_Inc_Input = {
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "section_exam" */
export type Section_Exam_Insert_Input = {
  date?: InputMaybe<Scalars['date']['input']>;
  day?: InputMaybe<Scalars['String']['input']>;
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  is_tba?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Section_Exam_Max_Fields = {
  __typename?: 'section_exam_max_fields';
  date?: Maybe<Scalars['date']['output']>;
  day?: Maybe<Scalars['String']['output']>;
  end_seconds?: Maybe<Scalars['Int']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "section_exam" */
export type Section_Exam_Max_Order_By = {
  date?: InputMaybe<Order_By>;
  day?: InputMaybe<Order_By>;
  end_seconds?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Section_Exam_Min_Fields = {
  __typename?: 'section_exam_min_fields';
  date?: Maybe<Scalars['date']['output']>;
  day?: Maybe<Scalars['String']['output']>;
  end_seconds?: Maybe<Scalars['Int']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "section_exam" */
export type Section_Exam_Min_Order_By = {
  date?: InputMaybe<Order_By>;
  day?: InputMaybe<Order_By>;
  end_seconds?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "section_exam" */
export type Section_Exam_Mutation_Response = {
  __typename?: 'section_exam_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Section_Exam>;
};

/** on_conflict condition type for table "section_exam" */
export type Section_Exam_On_Conflict = {
  constraint: Section_Exam_Constraint;
  update_columns?: Array<Section_Exam_Update_Column>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

/** Ordering options when selecting data from "section_exam". */
export type Section_Exam_Order_By = {
  date?: InputMaybe<Order_By>;
  day?: InputMaybe<Order_By>;
  end_seconds?: InputMaybe<Order_By>;
  is_tba?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** select columns of table "section_exam" */
export enum Section_Exam_Select_Column {
  /** column name */
  Date = 'date',
  /** column name */
  Day = 'day',
  /** column name */
  EndSeconds = 'end_seconds',
  /** column name */
  IsTba = 'is_tba',
  /** column name */
  Location = 'location',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  StartSeconds = 'start_seconds',
}

/** select "section_exam_aggregate_bool_exp_bool_and_arguments_columns" columns of table "section_exam" */
export enum Section_Exam_Select_Column_Section_Exam_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsTba = 'is_tba',
}

/** select "section_exam_aggregate_bool_exp_bool_or_arguments_columns" columns of table "section_exam" */
export enum Section_Exam_Select_Column_Section_Exam_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsTba = 'is_tba',
}

/** input type for updating data in table "section_exam" */
export type Section_Exam_Set_Input = {
  date?: InputMaybe<Scalars['date']['input']>;
  day?: InputMaybe<Scalars['String']['input']>;
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  is_tba?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Section_Exam_Stddev_Fields = {
  __typename?: 'section_exam_stddev_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "section_exam" */
export type Section_Exam_Stddev_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Section_Exam_Stddev_Pop_Fields = {
  __typename?: 'section_exam_stddev_pop_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "section_exam" */
export type Section_Exam_Stddev_Pop_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Section_Exam_Stddev_Samp_Fields = {
  __typename?: 'section_exam_stddev_samp_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "section_exam" */
export type Section_Exam_Stddev_Samp_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "section_exam" */
export type Section_Exam_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Section_Exam_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Section_Exam_Stream_Cursor_Value_Input = {
  date?: InputMaybe<Scalars['date']['input']>;
  day?: InputMaybe<Scalars['String']['input']>;
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  is_tba?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Section_Exam_Sum_Fields = {
  __typename?: 'section_exam_sum_fields';
  end_seconds?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "section_exam" */
export type Section_Exam_Sum_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** update columns of table "section_exam" */
export enum Section_Exam_Update_Column {
  /** column name */
  Date = 'date',
  /** column name */
  Day = 'day',
  /** column name */
  EndSeconds = 'end_seconds',
  /** column name */
  IsTba = 'is_tba',
  /** column name */
  Location = 'location',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  StartSeconds = 'start_seconds',
}

export type Section_Exam_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Section_Exam_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Section_Exam_Set_Input>;
  /** filter the rows which have to be updated */
  where: Section_Exam_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Section_Exam_Var_Pop_Fields = {
  __typename?: 'section_exam_var_pop_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "section_exam" */
export type Section_Exam_Var_Pop_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Section_Exam_Var_Samp_Fields = {
  __typename?: 'section_exam_var_samp_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "section_exam" */
export type Section_Exam_Var_Samp_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Section_Exam_Variance_Fields = {
  __typename?: 'section_exam_variance_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "section_exam" */
export type Section_Exam_Variance_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** columns and relationships of "section_meeting" */
export type Section_Meeting = {
  __typename?: 'section_meeting';
  days: Scalars['_text']['output'];
  end_date: Scalars['date']['output'];
  end_seconds?: Maybe<Scalars['Int']['output']>;
  is_cancelled: Scalars['Boolean']['output'];
  is_closed: Scalars['Boolean']['output'];
  is_tba: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  prof?: Maybe<Prof>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  section_id: Scalars['Int']['output'];
  start_date: Scalars['date']['output'];
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "section_meeting" */
export type Section_Meeting_Aggregate = {
  __typename?: 'section_meeting_aggregate';
  aggregate?: Maybe<Section_Meeting_Aggregate_Fields>;
  nodes: Array<Section_Meeting>;
};

export type Section_Meeting_Aggregate_Bool_Exp = {
  bool_and?: InputMaybe<Section_Meeting_Aggregate_Bool_Exp_Bool_And>;
  bool_or?: InputMaybe<Section_Meeting_Aggregate_Bool_Exp_Bool_Or>;
  count?: InputMaybe<Section_Meeting_Aggregate_Bool_Exp_Count>;
};

export type Section_Meeting_Aggregate_Bool_Exp_Bool_And = {
  arguments: Section_Meeting_Select_Column_Section_Meeting_Aggregate_Bool_Exp_Bool_And_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Section_Meeting_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Section_Meeting_Aggregate_Bool_Exp_Bool_Or = {
  arguments: Section_Meeting_Select_Column_Section_Meeting_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Section_Meeting_Bool_Exp>;
  predicate: Boolean_Comparison_Exp;
};

export type Section_Meeting_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<Section_Meeting_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "section_meeting" */
export type Section_Meeting_Aggregate_Fields = {
  __typename?: 'section_meeting_aggregate_fields';
  avg?: Maybe<Section_Meeting_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Section_Meeting_Max_Fields>;
  min?: Maybe<Section_Meeting_Min_Fields>;
  stddev?: Maybe<Section_Meeting_Stddev_Fields>;
  stddev_pop?: Maybe<Section_Meeting_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Section_Meeting_Stddev_Samp_Fields>;
  sum?: Maybe<Section_Meeting_Sum_Fields>;
  var_pop?: Maybe<Section_Meeting_Var_Pop_Fields>;
  var_samp?: Maybe<Section_Meeting_Var_Samp_Fields>;
  variance?: Maybe<Section_Meeting_Variance_Fields>;
};

/** aggregate fields of "section_meeting" */
export type Section_Meeting_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "section_meeting" */
export type Section_Meeting_Aggregate_Order_By = {
  avg?: InputMaybe<Section_Meeting_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<Section_Meeting_Max_Order_By>;
  min?: InputMaybe<Section_Meeting_Min_Order_By>;
  stddev?: InputMaybe<Section_Meeting_Stddev_Order_By>;
  stddev_pop?: InputMaybe<Section_Meeting_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<Section_Meeting_Stddev_Samp_Order_By>;
  sum?: InputMaybe<Section_Meeting_Sum_Order_By>;
  var_pop?: InputMaybe<Section_Meeting_Var_Pop_Order_By>;
  var_samp?: InputMaybe<Section_Meeting_Var_Samp_Order_By>;
  variance?: InputMaybe<Section_Meeting_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "section_meeting" */
export type Section_Meeting_Arr_Rel_Insert_Input = {
  data: Array<Section_Meeting_Insert_Input>;
};

/** aggregate avg on columns */
export type Section_Meeting_Avg_Fields = {
  __typename?: 'section_meeting_avg_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "section_meeting" */
export type Section_Meeting_Avg_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "section_meeting". All fields are combined with a logical 'AND'. */
export type Section_Meeting_Bool_Exp = {
  _and?: InputMaybe<Array<Section_Meeting_Bool_Exp>>;
  _not?: InputMaybe<Section_Meeting_Bool_Exp>;
  _or?: InputMaybe<Array<Section_Meeting_Bool_Exp>>;
  days?: InputMaybe<_Text_Comparison_Exp>;
  end_date?: InputMaybe<Date_Comparison_Exp>;
  end_seconds?: InputMaybe<Int_Comparison_Exp>;
  is_cancelled?: InputMaybe<Boolean_Comparison_Exp>;
  is_closed?: InputMaybe<Boolean_Comparison_Exp>;
  is_tba?: InputMaybe<Boolean_Comparison_Exp>;
  location?: InputMaybe<String_Comparison_Exp>;
  prof?: InputMaybe<Prof_Bool_Exp>;
  prof_id?: InputMaybe<Int_Comparison_Exp>;
  section_id?: InputMaybe<Int_Comparison_Exp>;
  start_date?: InputMaybe<Date_Comparison_Exp>;
  start_seconds?: InputMaybe<Int_Comparison_Exp>;
};

/** input type for incrementing numeric columns in table "section_meeting" */
export type Section_Meeting_Inc_Input = {
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "section_meeting" */
export type Section_Meeting_Insert_Input = {
  days?: InputMaybe<Scalars['_text']['input']>;
  end_date?: InputMaybe<Scalars['date']['input']>;
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  is_cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  is_closed?: InputMaybe<Scalars['Boolean']['input']>;
  is_tba?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  prof?: InputMaybe<Prof_Obj_Rel_Insert_Input>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['date']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type Section_Meeting_Max_Fields = {
  __typename?: 'section_meeting_max_fields';
  end_date?: Maybe<Scalars['date']['output']>;
  end_seconds?: Maybe<Scalars['Int']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  start_date?: Maybe<Scalars['date']['output']>;
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "section_meeting" */
export type Section_Meeting_Max_Order_By = {
  end_date?: InputMaybe<Order_By>;
  end_seconds?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type Section_Meeting_Min_Fields = {
  __typename?: 'section_meeting_min_fields';
  end_date?: Maybe<Scalars['date']['output']>;
  end_seconds?: Maybe<Scalars['Int']['output']>;
  location?: Maybe<Scalars['String']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  start_date?: Maybe<Scalars['date']['output']>;
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "section_meeting" */
export type Section_Meeting_Min_Order_By = {
  end_date?: InputMaybe<Order_By>;
  end_seconds?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "section_meeting" */
export type Section_Meeting_Mutation_Response = {
  __typename?: 'section_meeting_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Section_Meeting>;
};

/** Ordering options when selecting data from "section_meeting". */
export type Section_Meeting_Order_By = {
  days?: InputMaybe<Order_By>;
  end_date?: InputMaybe<Order_By>;
  end_seconds?: InputMaybe<Order_By>;
  is_cancelled?: InputMaybe<Order_By>;
  is_closed?: InputMaybe<Order_By>;
  is_tba?: InputMaybe<Order_By>;
  location?: InputMaybe<Order_By>;
  prof?: InputMaybe<Prof_Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_date?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** select columns of table "section_meeting" */
export enum Section_Meeting_Select_Column {
  /** column name */
  Days = 'days',
  /** column name */
  EndDate = 'end_date',
  /** column name */
  EndSeconds = 'end_seconds',
  /** column name */
  IsCancelled = 'is_cancelled',
  /** column name */
  IsClosed = 'is_closed',
  /** column name */
  IsTba = 'is_tba',
  /** column name */
  Location = 'location',
  /** column name */
  ProfId = 'prof_id',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  StartDate = 'start_date',
  /** column name */
  StartSeconds = 'start_seconds',
}

/** select "section_meeting_aggregate_bool_exp_bool_and_arguments_columns" columns of table "section_meeting" */
export enum Section_Meeting_Select_Column_Section_Meeting_Aggregate_Bool_Exp_Bool_And_Arguments_Columns {
  /** column name */
  IsCancelled = 'is_cancelled',
  /** column name */
  IsClosed = 'is_closed',
  /** column name */
  IsTba = 'is_tba',
}

/** select "section_meeting_aggregate_bool_exp_bool_or_arguments_columns" columns of table "section_meeting" */
export enum Section_Meeting_Select_Column_Section_Meeting_Aggregate_Bool_Exp_Bool_Or_Arguments_Columns {
  /** column name */
  IsCancelled = 'is_cancelled',
  /** column name */
  IsClosed = 'is_closed',
  /** column name */
  IsTba = 'is_tba',
}

/** input type for updating data in table "section_meeting" */
export type Section_Meeting_Set_Input = {
  days?: InputMaybe<Scalars['_text']['input']>;
  end_date?: InputMaybe<Scalars['date']['input']>;
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  is_cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  is_closed?: InputMaybe<Scalars['Boolean']['input']>;
  is_tba?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['date']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type Section_Meeting_Stddev_Fields = {
  __typename?: 'section_meeting_stddev_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "section_meeting" */
export type Section_Meeting_Stddev_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type Section_Meeting_Stddev_Pop_Fields = {
  __typename?: 'section_meeting_stddev_pop_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "section_meeting" */
export type Section_Meeting_Stddev_Pop_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type Section_Meeting_Stddev_Samp_Fields = {
  __typename?: 'section_meeting_stddev_samp_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "section_meeting" */
export type Section_Meeting_Stddev_Samp_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "section_meeting" */
export type Section_Meeting_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Section_Meeting_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Section_Meeting_Stream_Cursor_Value_Input = {
  days?: InputMaybe<Scalars['_text']['input']>;
  end_date?: InputMaybe<Scalars['date']['input']>;
  end_seconds?: InputMaybe<Scalars['Int']['input']>;
  is_cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  is_closed?: InputMaybe<Scalars['Boolean']['input']>;
  is_tba?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  prof_id?: InputMaybe<Scalars['Int']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  start_date?: InputMaybe<Scalars['date']['input']>;
  start_seconds?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type Section_Meeting_Sum_Fields = {
  __typename?: 'section_meeting_sum_fields';
  end_seconds?: Maybe<Scalars['Int']['output']>;
  prof_id?: Maybe<Scalars['Int']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  start_seconds?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "section_meeting" */
export type Section_Meeting_Sum_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

export type Section_Meeting_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Section_Meeting_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Section_Meeting_Set_Input>;
  /** filter the rows which have to be updated */
  where: Section_Meeting_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Section_Meeting_Var_Pop_Fields = {
  __typename?: 'section_meeting_var_pop_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "section_meeting" */
export type Section_Meeting_Var_Pop_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type Section_Meeting_Var_Samp_Fields = {
  __typename?: 'section_meeting_var_samp_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "section_meeting" */
export type Section_Meeting_Var_Samp_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type Section_Meeting_Variance_Fields = {
  __typename?: 'section_meeting_variance_fields';
  end_seconds?: Maybe<Scalars['Float']['output']>;
  prof_id?: Maybe<Scalars['Float']['output']>;
  section_id?: Maybe<Scalars['Float']['output']>;
  start_seconds?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "section_meeting" */
export type Section_Meeting_Variance_Order_By = {
  end_seconds?: InputMaybe<Order_By>;
  prof_id?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  start_seconds?: InputMaybe<Order_By>;
};

/** Boolean expression to compare columns of type "smallint". All fields are combined with logical 'AND'. */
export type Smallint_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['smallint']['input']>;
  _gt?: InputMaybe<Scalars['smallint']['input']>;
  _gte?: InputMaybe<Scalars['smallint']['input']>;
  _in?: InputMaybe<Array<Scalars['smallint']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['smallint']['input']>;
  _lte?: InputMaybe<Scalars['smallint']['input']>;
  _neq?: InputMaybe<Scalars['smallint']['input']>;
  _nin?: InputMaybe<Array<Scalars['smallint']['input']>>;
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "aggregate.course_easy_buckets" */
  aggregate_course_easy_buckets: Array<Aggregate_Course_Easy_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.course_easy_buckets" */
  aggregate_course_easy_buckets_aggregate: Aggregate_Course_Easy_Buckets_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.course_easy_buckets" */
  aggregate_course_easy_buckets_stream: Array<Aggregate_Course_Easy_Buckets>;
  /** fetch data from the table: "aggregate.course_rating" */
  aggregate_course_rating: Array<Aggregate_Course_Rating>;
  /** fetch aggregated fields from the table: "aggregate.course_rating" */
  aggregate_course_rating_aggregate: Aggregate_Course_Rating_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.course_rating" */
  aggregate_course_rating_stream: Array<Aggregate_Course_Rating>;
  /** fetch data from the table: "aggregate.course_review_rating" */
  aggregate_course_review_rating: Array<Aggregate_Course_Review_Rating>;
  /** fetch aggregated fields from the table: "aggregate.course_review_rating" */
  aggregate_course_review_rating_aggregate: Aggregate_Course_Review_Rating_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.course_review_rating" */
  aggregate_course_review_rating_stream: Array<Aggregate_Course_Review_Rating>;
  /** fetch data from the table: "aggregate.course_useful_buckets" */
  aggregate_course_useful_buckets: Array<Aggregate_Course_Useful_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.course_useful_buckets" */
  aggregate_course_useful_buckets_aggregate: Aggregate_Course_Useful_Buckets_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.course_useful_buckets" */
  aggregate_course_useful_buckets_stream: Array<Aggregate_Course_Useful_Buckets>;
  /** fetch data from the table: "aggregate.prof_clear_buckets" */
  aggregate_prof_clear_buckets: Array<Aggregate_Prof_Clear_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.prof_clear_buckets" */
  aggregate_prof_clear_buckets_aggregate: Aggregate_Prof_Clear_Buckets_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.prof_clear_buckets" */
  aggregate_prof_clear_buckets_stream: Array<Aggregate_Prof_Clear_Buckets>;
  /** fetch data from the table: "aggregate.prof_engaging_buckets" */
  aggregate_prof_engaging_buckets: Array<Aggregate_Prof_Engaging_Buckets>;
  /** fetch aggregated fields from the table: "aggregate.prof_engaging_buckets" */
  aggregate_prof_engaging_buckets_aggregate: Aggregate_Prof_Engaging_Buckets_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.prof_engaging_buckets" */
  aggregate_prof_engaging_buckets_stream: Array<Aggregate_Prof_Engaging_Buckets>;
  /** fetch data from the table: "aggregate.prof_rating" */
  aggregate_prof_rating: Array<Aggregate_Prof_Rating>;
  /** fetch aggregated fields from the table: "aggregate.prof_rating" */
  aggregate_prof_rating_aggregate: Aggregate_Prof_Rating_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.prof_rating" */
  aggregate_prof_rating_stream: Array<Aggregate_Prof_Rating>;
  /** fetch data from the table: "aggregate.prof_review_rating" */
  aggregate_prof_review_rating: Array<Aggregate_Prof_Review_Rating>;
  /** fetch aggregated fields from the table: "aggregate.prof_review_rating" */
  aggregate_prof_review_rating_aggregate: Aggregate_Prof_Review_Rating_Aggregate;
  /** fetch data from the table in a streaming manner: "aggregate.prof_review_rating" */
  aggregate_prof_review_rating_stream: Array<Aggregate_Prof_Review_Rating>;
  /** fetch data from the table: "course" */
  course: Array<Course>;
  /** fetch aggregated fields from the table: "course" */
  course_aggregate: Course_Aggregate;
  /** fetch data from the table: "course_antirequisite" */
  course_antirequisite: Array<Course_Antirequisite>;
  /** fetch aggregated fields from the table: "course_antirequisite" */
  course_antirequisite_aggregate: Course_Antirequisite_Aggregate;
  /** fetch data from the table in a streaming manner: "course_antirequisite" */
  course_antirequisite_stream: Array<Course_Antirequisite>;
  /** fetch data from the table: "course" using primary key columns */
  course_by_pk?: Maybe<Course>;
  /** fetch data from the table: "course_postrequisite" */
  course_postrequisite: Array<Course_Postrequisite>;
  /** fetch aggregated fields from the table: "course_postrequisite" */
  course_postrequisite_aggregate: Course_Postrequisite_Aggregate;
  /** fetch data from the table in a streaming manner: "course_postrequisite" */
  course_postrequisite_stream: Array<Course_Postrequisite>;
  /** fetch data from the table: "course_prerequisite" */
  course_prerequisite: Array<Course_Prerequisite>;
  /** fetch aggregated fields from the table: "course_prerequisite" */
  course_prerequisite_aggregate: Course_Prerequisite_Aggregate;
  /** fetch data from the table in a streaming manner: "course_prerequisite" */
  course_prerequisite_stream: Array<Course_Prerequisite>;
  /** fetch data from the table: "course_review_upvote" */
  course_review_upvote: Array<Course_Review_Upvote>;
  /** fetch aggregated fields from the table: "course_review_upvote" */
  course_review_upvote_aggregate: Course_Review_Upvote_Aggregate;
  /** fetch data from the table in a streaming manner: "course_review_upvote" */
  course_review_upvote_stream: Array<Course_Review_Upvote>;
  /** fetch data from the table: "course_search_index" */
  course_search_index: Array<Course_Search_Index>;
  /** fetch aggregated fields from the table: "course_search_index" */
  course_search_index_aggregate: Course_Search_Index_Aggregate;
  /** fetch data from the table in a streaming manner: "course_search_index" */
  course_search_index_stream: Array<Course_Search_Index>;
  /** fetch data from the table: "course_section" */
  course_section: Array<Course_Section>;
  /** fetch aggregated fields from the table: "course_section" */
  course_section_aggregate: Course_Section_Aggregate;
  /** fetch data from the table: "course_section" using primary key columns */
  course_section_by_pk?: Maybe<Course_Section>;
  /** fetch data from the table in a streaming manner: "course_section" */
  course_section_stream: Array<Course_Section>;
  /** fetch data from the table in a streaming manner: "course" */
  course_stream: Array<Course>;
  /** fetch data from the table: "prof" */
  prof: Array<Prof>;
  /** fetch aggregated fields from the table: "prof" */
  prof_aggregate: Prof_Aggregate;
  /** fetch data from the table: "prof" using primary key columns */
  prof_by_pk?: Maybe<Prof>;
  /** fetch data from the table: "prof_review_upvote" */
  prof_review_upvote: Array<Prof_Review_Upvote>;
  /** fetch aggregated fields from the table: "prof_review_upvote" */
  prof_review_upvote_aggregate: Prof_Review_Upvote_Aggregate;
  /** fetch data from the table in a streaming manner: "prof_review_upvote" */
  prof_review_upvote_stream: Array<Prof_Review_Upvote>;
  /** fetch data from the table: "prof_search_index" */
  prof_search_index: Array<Prof_Search_Index>;
  /** fetch aggregated fields from the table: "prof_search_index" */
  prof_search_index_aggregate: Prof_Search_Index_Aggregate;
  /** fetch data from the table in a streaming manner: "prof_search_index" */
  prof_search_index_stream: Array<Prof_Search_Index>;
  /** fetch data from the table in a streaming manner: "prof" */
  prof_stream: Array<Prof>;
  /** fetch data from the table: "prof_teaches_course" */
  prof_teaches_course: Array<Prof_Teaches_Course>;
  /** fetch aggregated fields from the table: "prof_teaches_course" */
  prof_teaches_course_aggregate: Prof_Teaches_Course_Aggregate;
  /** fetch data from the table in a streaming manner: "prof_teaches_course" */
  prof_teaches_course_stream: Array<Prof_Teaches_Course>;
  /** fetch data from the table: "queue.section_subscribed" */
  queue_section_subscribed: Array<Queue_Section_Subscribed>;
  /** fetch aggregated fields from the table: "queue.section_subscribed" */
  queue_section_subscribed_aggregate: Queue_Section_Subscribed_Aggregate;
  /** fetch data from the table: "queue.section_subscribed" using primary key columns */
  queue_section_subscribed_by_pk?: Maybe<Queue_Section_Subscribed>;
  /** fetch data from the table in a streaming manner: "queue.section_subscribed" */
  queue_section_subscribed_stream: Array<Queue_Section_Subscribed>;
  /** fetch data from the table: "review" */
  review: Array<Review>;
  /** fetch aggregated fields from the table: "review" */
  review_aggregate: Review_Aggregate;
  /** fetch data from the table: "review_author" */
  review_author: Array<Review_Author>;
  /** fetch aggregated fields from the table: "review_author" */
  review_author_aggregate: Review_Author_Aggregate;
  /** fetch data from the table in a streaming manner: "review_author" */
  review_author_stream: Array<Review_Author>;
  /** fetch data from the table: "review" using primary key columns */
  review_by_pk?: Maybe<Review>;
  /** fetch data from the table in a streaming manner: "review" */
  review_stream: Array<Review>;
  /** fetch data from the table: "review_user_id" */
  review_user_id: Array<Review_User_Id>;
  /** fetch aggregated fields from the table: "review_user_id" */
  review_user_id_aggregate: Review_User_Id_Aggregate;
  /** fetch data from the table in a streaming manner: "review_user_id" */
  review_user_id_stream: Array<Review_User_Id>;
  /** execute function "search_courses" which returns "course_search_index" */
  search_courses: Array<Course_Search_Index>;
  /** execute function "search_courses" and query aggregates on result of table type "course_search_index" */
  search_courses_aggregate: Course_Search_Index_Aggregate;
  /** execute function "search_profs" which returns "prof_search_index" */
  search_profs: Array<Prof_Search_Index>;
  /** execute function "search_profs" and query aggregates on result of table type "prof_search_index" */
  search_profs_aggregate: Prof_Search_Index_Aggregate;
  /** fetch data from the table: "section_exam" */
  section_exam: Array<Section_Exam>;
  /** fetch aggregated fields from the table: "section_exam" */
  section_exam_aggregate: Section_Exam_Aggregate;
  /** fetch data from the table in a streaming manner: "section_exam" */
  section_exam_stream: Array<Section_Exam>;
  /** fetch data from the table: "section_meeting" */
  section_meeting: Array<Section_Meeting>;
  /** fetch aggregated fields from the table: "section_meeting" */
  section_meeting_aggregate: Section_Meeting_Aggregate;
  /** fetch data from the table in a streaming manner: "section_meeting" */
  section_meeting_stream: Array<Section_Meeting>;
  /** fetch data from the table: "user" */
  user: Array<User>;
  /** fetch aggregated fields from the table: "user" */
  user_aggregate: User_Aggregate;
  /** fetch data from the table: "user" using primary key columns */
  user_by_pk?: Maybe<User>;
  /** fetch data from the table: "user_course_taken" */
  user_course_taken: Array<User_Course_Taken>;
  /** fetch aggregated fields from the table: "user_course_taken" */
  user_course_taken_aggregate: User_Course_Taken_Aggregate;
  /** fetch data from the table in a streaming manner: "user_course_taken" */
  user_course_taken_stream: Array<User_Course_Taken>;
  /** fetch data from the table: "user_schedule" */
  user_schedule: Array<User_Schedule>;
  /** fetch aggregated fields from the table: "user_schedule" */
  user_schedule_aggregate: User_Schedule_Aggregate;
  /** fetch data from the table in a streaming manner: "user_schedule" */
  user_schedule_stream: Array<User_Schedule>;
  /** fetch data from the table: "user_schedule_swap" */
  user_schedule_swap: Array<User_Schedule_Swap>;
  /** fetch aggregated fields from the table: "user_schedule_swap" */
  user_schedule_swap_aggregate: User_Schedule_Swap_Aggregate;
  /** fetch data from the table: "user_schedule_swap" using primary key columns */
  user_schedule_swap_by_pk?: Maybe<User_Schedule_Swap>;
  /** fetch data from the table in a streaming manner: "user_schedule_swap" */
  user_schedule_swap_stream: Array<User_Schedule_Swap>;
  /** fetch data from the table: "user_shortlist" */
  user_shortlist: Array<User_Shortlist>;
  /** fetch aggregated fields from the table: "user_shortlist" */
  user_shortlist_aggregate: User_Shortlist_Aggregate;
  /** fetch data from the table in a streaming manner: "user_shortlist" */
  user_shortlist_stream: Array<User_Shortlist>;
  /** fetch data from the table in a streaming manner: "user" */
  user_stream: Array<User>;
};

export type Subscription_RootAggregate_Course_Easy_BucketsArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Easy_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Easy_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Easy_Buckets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Aggregate_Course_Easy_Buckets_Stream_Cursor_Input>>;
  where?: InputMaybe<Aggregate_Course_Easy_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Rating_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Aggregate_Course_Rating_Stream_Cursor_Input>>;
  where?: InputMaybe<Aggregate_Course_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Review_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Review_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Course_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Review_Rating_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Aggregate_Course_Review_Rating_Stream_Cursor_Input>>;
  where?: InputMaybe<Aggregate_Course_Review_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Useful_BucketsArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Course_Useful_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Useful_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Course_Useful_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Course_Useful_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Course_Useful_Buckets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<
    InputMaybe<Aggregate_Course_Useful_Buckets_Stream_Cursor_Input>
  >;
  where?: InputMaybe<Aggregate_Course_Useful_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Clear_BucketsArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Clear_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Clear_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Clear_Buckets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Aggregate_Prof_Clear_Buckets_Stream_Cursor_Input>>;
  where?: InputMaybe<Aggregate_Prof_Clear_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Engaging_BucketsArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Prof_Engaging_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Engaging_Buckets_AggregateArgs = {
  distinct_on?: InputMaybe<
    Array<Aggregate_Prof_Engaging_Buckets_Select_Column>
  >;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Engaging_Buckets_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Engaging_Buckets_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<
    InputMaybe<Aggregate_Prof_Engaging_Buckets_Stream_Cursor_Input>
  >;
  where?: InputMaybe<Aggregate_Prof_Engaging_Buckets_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Rating_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Aggregate_Prof_Rating_Stream_Cursor_Input>>;
  where?: InputMaybe<Aggregate_Prof_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Review_RatingArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Review_Rating_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Aggregate_Prof_Review_Rating_Order_By>>;
  where?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
};

export type Subscription_RootAggregate_Prof_Review_Rating_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Aggregate_Prof_Review_Rating_Stream_Cursor_Input>>;
  where?: InputMaybe<Aggregate_Prof_Review_Rating_Bool_Exp>;
};

export type Subscription_RootCourseArgs = {
  distinct_on?: InputMaybe<Array<Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Order_By>>;
  where?: InputMaybe<Course_Bool_Exp>;
};

export type Subscription_RootCourse_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Order_By>>;
  where?: InputMaybe<Course_Bool_Exp>;
};

export type Subscription_RootCourse_AntirequisiteArgs = {
  distinct_on?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Antirequisite_Order_By>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Antirequisite_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Antirequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Antirequisite_Order_By>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Antirequisite_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Antirequisite_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Antirequisite_Bool_Exp>;
};

export type Subscription_RootCourse_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_RootCourse_PostrequisiteArgs = {
  distinct_on?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Postrequisite_Order_By>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Postrequisite_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Postrequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Postrequisite_Order_By>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Postrequisite_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Postrequisite_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Postrequisite_Bool_Exp>;
};

export type Subscription_RootCourse_PrerequisiteArgs = {
  distinct_on?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Prerequisite_Order_By>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Prerequisite_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Prerequisite_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Prerequisite_Order_By>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Prerequisite_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Prerequisite_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Prerequisite_Bool_Exp>;
};

export type Subscription_RootCourse_Review_UpvoteArgs = {
  distinct_on?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Review_Upvote_Order_By>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

export type Subscription_RootCourse_Review_Upvote_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Review_Upvote_Order_By>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

export type Subscription_RootCourse_Review_Upvote_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Review_Upvote_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Review_Upvote_Bool_Exp>;
};

export type Subscription_RootCourse_Search_IndexArgs = {
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Subscription_RootCourse_Search_Index_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Subscription_RootCourse_Search_Index_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Search_Index_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Subscription_RootCourse_SectionArgs = {
  distinct_on?: InputMaybe<Array<Course_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Section_Order_By>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

export type Subscription_RootCourse_Section_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Course_Section_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Section_Order_By>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

export type Subscription_RootCourse_Section_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_RootCourse_Section_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Section_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Section_Bool_Exp>;
};

export type Subscription_RootCourse_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Course_Stream_Cursor_Input>>;
  where?: InputMaybe<Course_Bool_Exp>;
};

export type Subscription_RootProfArgs = {
  distinct_on?: InputMaybe<Array<Prof_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Order_By>>;
  where?: InputMaybe<Prof_Bool_Exp>;
};

export type Subscription_RootProf_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Order_By>>;
  where?: InputMaybe<Prof_Bool_Exp>;
};

export type Subscription_RootProf_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_RootProf_Review_UpvoteArgs = {
  distinct_on?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Review_Upvote_Order_By>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

export type Subscription_RootProf_Review_Upvote_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Review_Upvote_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Review_Upvote_Order_By>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

export type Subscription_RootProf_Review_Upvote_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Prof_Review_Upvote_Stream_Cursor_Input>>;
  where?: InputMaybe<Prof_Review_Upvote_Bool_Exp>;
};

export type Subscription_RootProf_Search_IndexArgs = {
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Subscription_RootProf_Search_Index_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Subscription_RootProf_Search_Index_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Prof_Search_Index_Stream_Cursor_Input>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Subscription_RootProf_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Prof_Stream_Cursor_Input>>;
  where?: InputMaybe<Prof_Bool_Exp>;
};

export type Subscription_RootProf_Teaches_CourseArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

export type Subscription_RootProf_Teaches_Course_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Prof_Teaches_Course_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Teaches_Course_Order_By>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

export type Subscription_RootProf_Teaches_Course_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Prof_Teaches_Course_Stream_Cursor_Input>>;
  where?: InputMaybe<Prof_Teaches_Course_Bool_Exp>;
};

export type Subscription_RootQueue_Section_SubscribedArgs = {
  distinct_on?: InputMaybe<Array<Queue_Section_Subscribed_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Queue_Section_Subscribed_Order_By>>;
  where?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
};

export type Subscription_RootQueue_Section_Subscribed_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Queue_Section_Subscribed_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Queue_Section_Subscribed_Order_By>>;
  where?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
};

export type Subscription_RootQueue_Section_Subscribed_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_RootQueue_Section_Subscribed_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Queue_Section_Subscribed_Stream_Cursor_Input>>;
  where?: InputMaybe<Queue_Section_Subscribed_Bool_Exp>;
};

export type Subscription_RootReviewArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

export type Subscription_RootReview_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

export type Subscription_RootReview_AuthorArgs = {
  distinct_on?: InputMaybe<Array<Review_Author_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Author_Order_By>>;
  where?: InputMaybe<Review_Author_Bool_Exp>;
};

export type Subscription_RootReview_Author_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Author_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Author_Order_By>>;
  where?: InputMaybe<Review_Author_Bool_Exp>;
};

export type Subscription_RootReview_Author_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Review_Author_Stream_Cursor_Input>>;
  where?: InputMaybe<Review_Author_Bool_Exp>;
};

export type Subscription_RootReview_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_RootReview_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Review_Stream_Cursor_Input>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

export type Subscription_RootReview_User_IdArgs = {
  distinct_on?: InputMaybe<Array<Review_User_Id_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_User_Id_Order_By>>;
  where?: InputMaybe<Review_User_Id_Bool_Exp>;
};

export type Subscription_RootReview_User_Id_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_User_Id_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_User_Id_Order_By>>;
  where?: InputMaybe<Review_User_Id_Bool_Exp>;
};

export type Subscription_RootReview_User_Id_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Review_User_Id_Stream_Cursor_Input>>;
  where?: InputMaybe<Review_User_Id_Bool_Exp>;
};

export type Subscription_RootSearch_CoursesArgs = {
  args: Search_Courses_Args;
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Subscription_RootSearch_Courses_AggregateArgs = {
  args: Search_Courses_Args;
  distinct_on?: InputMaybe<Array<Course_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Course_Search_Index_Order_By>>;
  where?: InputMaybe<Course_Search_Index_Bool_Exp>;
};

export type Subscription_RootSearch_ProfsArgs = {
  args: Search_Profs_Args;
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Subscription_RootSearch_Profs_AggregateArgs = {
  args: Search_Profs_Args;
  distinct_on?: InputMaybe<Array<Prof_Search_Index_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Prof_Search_Index_Order_By>>;
  where?: InputMaybe<Prof_Search_Index_Bool_Exp>;
};

export type Subscription_RootSection_ExamArgs = {
  distinct_on?: InputMaybe<Array<Section_Exam_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Exam_Order_By>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

export type Subscription_RootSection_Exam_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Section_Exam_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Exam_Order_By>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

export type Subscription_RootSection_Exam_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Section_Exam_Stream_Cursor_Input>>;
  where?: InputMaybe<Section_Exam_Bool_Exp>;
};

export type Subscription_RootSection_MeetingArgs = {
  distinct_on?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Meeting_Order_By>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

export type Subscription_RootSection_Meeting_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Section_Meeting_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Section_Meeting_Order_By>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

export type Subscription_RootSection_Meeting_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Section_Meeting_Stream_Cursor_Input>>;
  where?: InputMaybe<Section_Meeting_Bool_Exp>;
};

export type Subscription_RootUserArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};

export type Subscription_RootUser_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Order_By>>;
  where?: InputMaybe<User_Bool_Exp>;
};

export type Subscription_RootUser_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_RootUser_Course_TakenArgs = {
  distinct_on?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Course_Taken_Order_By>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

export type Subscription_RootUser_Course_Taken_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Course_Taken_Order_By>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

export type Subscription_RootUser_Course_Taken_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Course_Taken_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

export type Subscription_RootUser_ScheduleArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Order_By>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

export type Subscription_RootUser_Schedule_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Order_By>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

export type Subscription_RootUser_Schedule_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Schedule_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

export type Subscription_RootUser_Schedule_SwapArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Swap_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Swap_Order_By>>;
  where?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
};

export type Subscription_RootUser_Schedule_Swap_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Swap_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Swap_Order_By>>;
  where?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
};

export type Subscription_RootUser_Schedule_Swap_By_PkArgs = {
  source_section_id: Scalars['Int']['input'];
  user_id: Scalars['Int']['input'];
};

export type Subscription_RootUser_Schedule_Swap_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Schedule_Swap_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
};

export type Subscription_RootUser_ShortlistArgs = {
  distinct_on?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Shortlist_Order_By>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

export type Subscription_RootUser_Shortlist_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Shortlist_Order_By>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

export type Subscription_RootUser_Shortlist_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Shortlist_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

export type Subscription_RootUser_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<User_Stream_Cursor_Input>>;
  where?: InputMaybe<User_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Boolean expression to compare columns of type "tsvector". All fields are combined with logical 'AND'. */
export type Tsvector_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['tsvector']['input']>;
  _gt?: InputMaybe<Scalars['tsvector']['input']>;
  _gte?: InputMaybe<Scalars['tsvector']['input']>;
  _in?: InputMaybe<Array<Scalars['tsvector']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['tsvector']['input']>;
  _lte?: InputMaybe<Scalars['tsvector']['input']>;
  _neq?: InputMaybe<Scalars['tsvector']['input']>;
  _nin?: InputMaybe<Array<Scalars['tsvector']['input']>>;
};

/** columns and relationships of "user" */
export type User = {
  __typename?: 'user';
  /** An array relationship */
  courses_taken: Array<User_Course_Taken>;
  /** An aggregate relationship */
  courses_taken_aggregate: User_Course_Taken_Aggregate;
  email?: Maybe<Scalars['String']['output']>;
  first_name: Scalars['String']['output'];
  full_name: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  join_date: Scalars['timestamptz']['output'];
  join_source: Scalars['join_source']['output'];
  last_name: Scalars['String']['output'];
  picture_url?: Maybe<Scalars['String']['output']>;
  program?: Maybe<Scalars['String']['output']>;
  /** An array relationship */
  reviews: Array<Review>;
  /** An aggregate relationship */
  reviews_aggregate: Review_Aggregate;
  /** An array relationship */
  schedule: Array<User_Schedule>;
  /** An aggregate relationship */
  schedule_aggregate: User_Schedule_Aggregate;
  secret_id: Scalars['String']['output'];
  /** An array relationship */
  shortlist: Array<User_Shortlist>;
  /** An aggregate relationship */
  shortlist_aggregate: User_Shortlist_Aggregate;
};

/** columns and relationships of "user" */
export type UserCourses_TakenArgs = {
  distinct_on?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Course_Taken_Order_By>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserCourses_Taken_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Course_Taken_Order_By>>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserReviewsArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserReviews_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Review_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Review_Order_By>>;
  where?: InputMaybe<Review_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserScheduleArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Order_By>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserSchedule_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Schedule_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Schedule_Order_By>>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserShortlistArgs = {
  distinct_on?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Shortlist_Order_By>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

/** columns and relationships of "user" */
export type UserShortlist_AggregateArgs = {
  distinct_on?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<User_Shortlist_Order_By>>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

/** aggregated selection of "user" */
export type User_Aggregate = {
  __typename?: 'user_aggregate';
  aggregate?: Maybe<User_Aggregate_Fields>;
  nodes: Array<User>;
};

/** aggregate fields of "user" */
export type User_Aggregate_Fields = {
  __typename?: 'user_aggregate_fields';
  avg?: Maybe<User_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Max_Fields>;
  min?: Maybe<User_Min_Fields>;
  stddev?: Maybe<User_Stddev_Fields>;
  stddev_pop?: Maybe<User_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Stddev_Samp_Fields>;
  sum?: Maybe<User_Sum_Fields>;
  var_pop?: Maybe<User_Var_Pop_Fields>;
  var_samp?: Maybe<User_Var_Samp_Fields>;
  variance?: Maybe<User_Variance_Fields>;
};

/** aggregate fields of "user" */
export type User_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type User_Avg_Fields = {
  __typename?: 'user_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user". All fields are combined with a logical 'AND'. */
export type User_Bool_Exp = {
  _and?: InputMaybe<Array<User_Bool_Exp>>;
  _not?: InputMaybe<User_Bool_Exp>;
  _or?: InputMaybe<Array<User_Bool_Exp>>;
  courses_taken?: InputMaybe<User_Course_Taken_Bool_Exp>;
  courses_taken_aggregate?: InputMaybe<User_Course_Taken_Aggregate_Bool_Exp>;
  email?: InputMaybe<String_Comparison_Exp>;
  first_name?: InputMaybe<String_Comparison_Exp>;
  full_name?: InputMaybe<String_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  join_date?: InputMaybe<Timestamptz_Comparison_Exp>;
  join_source?: InputMaybe<Join_Source_Comparison_Exp>;
  last_name?: InputMaybe<String_Comparison_Exp>;
  picture_url?: InputMaybe<String_Comparison_Exp>;
  program?: InputMaybe<String_Comparison_Exp>;
  reviews?: InputMaybe<Review_Bool_Exp>;
  reviews_aggregate?: InputMaybe<Review_Aggregate_Bool_Exp>;
  schedule?: InputMaybe<User_Schedule_Bool_Exp>;
  schedule_aggregate?: InputMaybe<User_Schedule_Aggregate_Bool_Exp>;
  secret_id?: InputMaybe<String_Comparison_Exp>;
  shortlist?: InputMaybe<User_Shortlist_Bool_Exp>;
  shortlist_aggregate?: InputMaybe<User_Shortlist_Aggregate_Bool_Exp>;
};

/** unique or primary key constraints on table "user" */
export enum User_Constraint {
  /** unique or primary key constraint on columns "id" */
  UserPkey = 'user_pkey',
  /** unique or primary key constraint on columns "secret_id" */
  UserSecretIdKey = 'user_secret_id_key',
}

/** columns and relationships of "user_course_taken" */
export type User_Course_Taken = {
  __typename?: 'user_course_taken';
  /** An object relationship */
  course?: Maybe<Course>;
  course_id?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['String']['output']>;
  term_id: Scalars['Int']['output'];
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "user_course_taken" */
export type User_Course_Taken_Aggregate = {
  __typename?: 'user_course_taken_aggregate';
  aggregate?: Maybe<User_Course_Taken_Aggregate_Fields>;
  nodes: Array<User_Course_Taken>;
};

export type User_Course_Taken_Aggregate_Bool_Exp = {
  count?: InputMaybe<User_Course_Taken_Aggregate_Bool_Exp_Count>;
};

export type User_Course_Taken_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Course_Taken_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_course_taken" */
export type User_Course_Taken_Aggregate_Fields = {
  __typename?: 'user_course_taken_aggregate_fields';
  avg?: Maybe<User_Course_Taken_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Course_Taken_Max_Fields>;
  min?: Maybe<User_Course_Taken_Min_Fields>;
  stddev?: Maybe<User_Course_Taken_Stddev_Fields>;
  stddev_pop?: Maybe<User_Course_Taken_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Course_Taken_Stddev_Samp_Fields>;
  sum?: Maybe<User_Course_Taken_Sum_Fields>;
  var_pop?: Maybe<User_Course_Taken_Var_Pop_Fields>;
  var_samp?: Maybe<User_Course_Taken_Var_Samp_Fields>;
  variance?: Maybe<User_Course_Taken_Variance_Fields>;
};

/** aggregate fields of "user_course_taken" */
export type User_Course_Taken_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Course_Taken_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user_course_taken" */
export type User_Course_Taken_Aggregate_Order_By = {
  avg?: InputMaybe<User_Course_Taken_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Course_Taken_Max_Order_By>;
  min?: InputMaybe<User_Course_Taken_Min_Order_By>;
  stddev?: InputMaybe<User_Course_Taken_Stddev_Order_By>;
  stddev_pop?: InputMaybe<User_Course_Taken_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<User_Course_Taken_Stddev_Samp_Order_By>;
  sum?: InputMaybe<User_Course_Taken_Sum_Order_By>;
  var_pop?: InputMaybe<User_Course_Taken_Var_Pop_Order_By>;
  var_samp?: InputMaybe<User_Course_Taken_Var_Samp_Order_By>;
  variance?: InputMaybe<User_Course_Taken_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "user_course_taken" */
export type User_Course_Taken_Arr_Rel_Insert_Input = {
  data: Array<User_Course_Taken_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Course_Taken_On_Conflict>;
};

/** aggregate avg on columns */
export type User_Course_Taken_Avg_Fields = {
  __typename?: 'user_course_taken_avg_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "user_course_taken" */
export type User_Course_Taken_Avg_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "user_course_taken". All fields are combined with a logical 'AND'. */
export type User_Course_Taken_Bool_Exp = {
  _and?: InputMaybe<Array<User_Course_Taken_Bool_Exp>>;
  _not?: InputMaybe<User_Course_Taken_Bool_Exp>;
  _or?: InputMaybe<Array<User_Course_Taken_Bool_Exp>>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  level?: InputMaybe<String_Comparison_Exp>;
  term_id?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_course_taken" */
export enum User_Course_Taken_Constraint {
  /** unique or primary key constraint on columns "user_id", "term_id", "course_id" */
  CourseUniquelyTaken = 'course_uniquely_taken',
}

/** input type for incrementing numeric columns in table "user_course_taken" */
export type User_Course_Taken_Inc_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_course_taken" */
export type User_Course_Taken_Insert_Input = {
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['String']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type User_Course_Taken_Max_Fields = {
  __typename?: 'user_course_taken_max_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['String']['output']>;
  term_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "user_course_taken" */
export type User_Course_Taken_Max_Order_By = {
  course_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Course_Taken_Min_Fields = {
  __typename?: 'user_course_taken_min_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  level?: Maybe<Scalars['String']['output']>;
  term_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "user_course_taken" */
export type User_Course_Taken_Min_Order_By = {
  course_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_course_taken" */
export type User_Course_Taken_Mutation_Response = {
  __typename?: 'user_course_taken_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Course_Taken>;
};

/** on_conflict condition type for table "user_course_taken" */
export type User_Course_Taken_On_Conflict = {
  constraint: User_Course_Taken_Constraint;
  update_columns?: Array<User_Course_Taken_Update_Column>;
  where?: InputMaybe<User_Course_Taken_Bool_Exp>;
};

/** Ordering options when selecting data from "user_course_taken". */
export type User_Course_Taken_Order_By = {
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  level?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "user_course_taken" */
export enum User_Course_Taken_Select_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  Level = 'level',
  /** column name */
  TermId = 'term_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "user_course_taken" */
export type User_Course_Taken_Set_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['String']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type User_Course_Taken_Stddev_Fields = {
  __typename?: 'user_course_taken_stddev_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "user_course_taken" */
export type User_Course_Taken_Stddev_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type User_Course_Taken_Stddev_Pop_Fields = {
  __typename?: 'user_course_taken_stddev_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "user_course_taken" */
export type User_Course_Taken_Stddev_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type User_Course_Taken_Stddev_Samp_Fields = {
  __typename?: 'user_course_taken_stddev_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "user_course_taken" */
export type User_Course_Taken_Stddev_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "user_course_taken" */
export type User_Course_Taken_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Course_Taken_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Course_Taken_Stream_Cursor_Value_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  level?: InputMaybe<Scalars['String']['input']>;
  term_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type User_Course_Taken_Sum_Fields = {
  __typename?: 'user_course_taken_sum_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  term_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "user_course_taken" */
export type User_Course_Taken_Sum_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** update columns of table "user_course_taken" */
export enum User_Course_Taken_Update_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  Level = 'level',
  /** column name */
  TermId = 'term_id',
  /** column name */
  UserId = 'user_id',
}

export type User_Course_Taken_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Course_Taken_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Course_Taken_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Course_Taken_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Course_Taken_Var_Pop_Fields = {
  __typename?: 'user_course_taken_var_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "user_course_taken" */
export type User_Course_Taken_Var_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type User_Course_Taken_Var_Samp_Fields = {
  __typename?: 'user_course_taken_var_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "user_course_taken" */
export type User_Course_Taken_Var_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type User_Course_Taken_Variance_Fields = {
  __typename?: 'user_course_taken_variance_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  term_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "user_course_taken" */
export type User_Course_Taken_Variance_Order_By = {
  course_id?: InputMaybe<Order_By>;
  term_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** input type for incrementing numeric columns in table "user" */
export type User_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user" */
export type User_Insert_Input = {
  courses_taken?: InputMaybe<User_Course_Taken_Arr_Rel_Insert_Input>;
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  join_date?: InputMaybe<Scalars['timestamptz']['input']>;
  join_source?: InputMaybe<Scalars['join_source']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
  program?: InputMaybe<Scalars['String']['input']>;
  reviews?: InputMaybe<Review_Arr_Rel_Insert_Input>;
  schedule?: InputMaybe<User_Schedule_Arr_Rel_Insert_Input>;
  secret_id?: InputMaybe<Scalars['String']['input']>;
  shortlist?: InputMaybe<User_Shortlist_Arr_Rel_Insert_Input>;
};

/** aggregate max on columns */
export type User_Max_Fields = {
  __typename?: 'user_max_fields';
  email?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  join_date?: Maybe<Scalars['timestamptz']['output']>;
  join_source?: Maybe<Scalars['join_source']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
  program?: Maybe<Scalars['String']['output']>;
  secret_id?: Maybe<Scalars['String']['output']>;
};

/** aggregate min on columns */
export type User_Min_Fields = {
  __typename?: 'user_min_fields';
  email?: Maybe<Scalars['String']['output']>;
  first_name?: Maybe<Scalars['String']['output']>;
  full_name?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  join_date?: Maybe<Scalars['timestamptz']['output']>;
  join_source?: Maybe<Scalars['join_source']['output']>;
  last_name?: Maybe<Scalars['String']['output']>;
  picture_url?: Maybe<Scalars['String']['output']>;
  program?: Maybe<Scalars['String']['output']>;
  secret_id?: Maybe<Scalars['String']['output']>;
};

/** response of any mutation on the table "user" */
export type User_Mutation_Response = {
  __typename?: 'user_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User>;
};

/** input type for inserting object relation for remote table "user" */
export type User_Obj_Rel_Insert_Input = {
  data: User_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_On_Conflict>;
};

/** on_conflict condition type for table "user" */
export type User_On_Conflict = {
  constraint: User_Constraint;
  update_columns?: Array<User_Update_Column>;
  where?: InputMaybe<User_Bool_Exp>;
};

/** Ordering options when selecting data from "user". */
export type User_Order_By = {
  courses_taken_aggregate?: InputMaybe<User_Course_Taken_Aggregate_Order_By>;
  email?: InputMaybe<Order_By>;
  first_name?: InputMaybe<Order_By>;
  full_name?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  join_date?: InputMaybe<Order_By>;
  join_source?: InputMaybe<Order_By>;
  last_name?: InputMaybe<Order_By>;
  picture_url?: InputMaybe<Order_By>;
  program?: InputMaybe<Order_By>;
  reviews_aggregate?: InputMaybe<Review_Aggregate_Order_By>;
  schedule_aggregate?: InputMaybe<User_Schedule_Aggregate_Order_By>;
  secret_id?: InputMaybe<Order_By>;
  shortlist_aggregate?: InputMaybe<User_Shortlist_Aggregate_Order_By>;
};

/** primary key columns input for table: user */
export type User_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** columns and relationships of "user_schedule" */
export type User_Schedule = {
  __typename?: 'user_schedule';
  location?: Maybe<Scalars['String']['output']>;
  /** An object relationship */
  section: Course_Section;
  section_id: Scalars['Int']['output'];
  /** An object relationship */
  user: User;
  user_id: Scalars['Int']['output'];
};

/** aggregated selection of "user_schedule" */
export type User_Schedule_Aggregate = {
  __typename?: 'user_schedule_aggregate';
  aggregate?: Maybe<User_Schedule_Aggregate_Fields>;
  nodes: Array<User_Schedule>;
};

export type User_Schedule_Aggregate_Bool_Exp = {
  count?: InputMaybe<User_Schedule_Aggregate_Bool_Exp_Count>;
};

export type User_Schedule_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Schedule_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Schedule_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_schedule" */
export type User_Schedule_Aggregate_Fields = {
  __typename?: 'user_schedule_aggregate_fields';
  avg?: Maybe<User_Schedule_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Schedule_Max_Fields>;
  min?: Maybe<User_Schedule_Min_Fields>;
  stddev?: Maybe<User_Schedule_Stddev_Fields>;
  stddev_pop?: Maybe<User_Schedule_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Schedule_Stddev_Samp_Fields>;
  sum?: Maybe<User_Schedule_Sum_Fields>;
  var_pop?: Maybe<User_Schedule_Var_Pop_Fields>;
  var_samp?: Maybe<User_Schedule_Var_Samp_Fields>;
  variance?: Maybe<User_Schedule_Variance_Fields>;
};

/** aggregate fields of "user_schedule" */
export type User_Schedule_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Schedule_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user_schedule" */
export type User_Schedule_Aggregate_Order_By = {
  avg?: InputMaybe<User_Schedule_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Schedule_Max_Order_By>;
  min?: InputMaybe<User_Schedule_Min_Order_By>;
  stddev?: InputMaybe<User_Schedule_Stddev_Order_By>;
  stddev_pop?: InputMaybe<User_Schedule_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<User_Schedule_Stddev_Samp_Order_By>;
  sum?: InputMaybe<User_Schedule_Sum_Order_By>;
  var_pop?: InputMaybe<User_Schedule_Var_Pop_Order_By>;
  var_samp?: InputMaybe<User_Schedule_Var_Samp_Order_By>;
  variance?: InputMaybe<User_Schedule_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "user_schedule" */
export type User_Schedule_Arr_Rel_Insert_Input = {
  data: Array<User_Schedule_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Schedule_On_Conflict>;
};

/** aggregate avg on columns */
export type User_Schedule_Avg_Fields = {
  __typename?: 'user_schedule_avg_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "user_schedule" */
export type User_Schedule_Avg_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "user_schedule". All fields are combined with a logical 'AND'. */
export type User_Schedule_Bool_Exp = {
  _and?: InputMaybe<Array<User_Schedule_Bool_Exp>>;
  _not?: InputMaybe<User_Schedule_Bool_Exp>;
  _or?: InputMaybe<Array<User_Schedule_Bool_Exp>>;
  location?: InputMaybe<String_Comparison_Exp>;
  section?: InputMaybe<Course_Section_Bool_Exp>;
  section_id?: InputMaybe<Int_Comparison_Exp>;
  user?: InputMaybe<User_Bool_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_schedule" */
export enum User_Schedule_Constraint {
  /** unique or primary key constraint on columns "section_id", "user_id" */
  SectionUniquelyTaken = 'section_uniquely_taken',
}

/** input type for incrementing numeric columns in table "user_schedule" */
export type User_Schedule_Inc_Input = {
  section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_schedule" */
export type User_Schedule_Insert_Input = {
  location?: InputMaybe<Scalars['String']['input']>;
  section?: InputMaybe<Course_Section_Obj_Rel_Insert_Input>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  user?: InputMaybe<User_Obj_Rel_Insert_Input>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type User_Schedule_Max_Fields = {
  __typename?: 'user_schedule_max_fields';
  location?: Maybe<Scalars['String']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "user_schedule" */
export type User_Schedule_Max_Order_By = {
  location?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Schedule_Min_Fields = {
  __typename?: 'user_schedule_min_fields';
  location?: Maybe<Scalars['String']['output']>;
  section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "user_schedule" */
export type User_Schedule_Min_Order_By = {
  location?: InputMaybe<Order_By>;
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_schedule" */
export type User_Schedule_Mutation_Response = {
  __typename?: 'user_schedule_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Schedule>;
};

/** input type for inserting object relation for remote table "user_schedule" */
export type User_Schedule_Obj_Rel_Insert_Input = {
  data: User_Schedule_Insert_Input;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Schedule_On_Conflict>;
};

/** on_conflict condition type for table "user_schedule" */
export type User_Schedule_On_Conflict = {
  constraint: User_Schedule_Constraint;
  update_columns?: Array<User_Schedule_Update_Column>;
  where?: InputMaybe<User_Schedule_Bool_Exp>;
};

/** Ordering options when selecting data from "user_schedule". */
export type User_Schedule_Order_By = {
  location?: InputMaybe<Order_By>;
  section?: InputMaybe<Course_Section_Order_By>;
  section_id?: InputMaybe<Order_By>;
  user?: InputMaybe<User_Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "user_schedule" */
export enum User_Schedule_Select_Column {
  /** column name */
  Location = 'location',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "user_schedule" */
export type User_Schedule_Set_Input = {
  location?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type User_Schedule_Stddev_Fields = {
  __typename?: 'user_schedule_stddev_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "user_schedule" */
export type User_Schedule_Stddev_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type User_Schedule_Stddev_Pop_Fields = {
  __typename?: 'user_schedule_stddev_pop_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "user_schedule" */
export type User_Schedule_Stddev_Pop_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type User_Schedule_Stddev_Samp_Fields = {
  __typename?: 'user_schedule_stddev_samp_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "user_schedule" */
export type User_Schedule_Stddev_Samp_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "user_schedule" */
export type User_Schedule_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Schedule_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Schedule_Stream_Cursor_Value_Input = {
  location?: InputMaybe<Scalars['String']['input']>;
  section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type User_Schedule_Sum_Fields = {
  __typename?: 'user_schedule_sum_fields';
  section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "user_schedule" */
export type User_Schedule_Sum_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** columns and relationships of "user_schedule_swap" */
export type User_Schedule_Swap = {
  __typename?: 'user_schedule_swap';
  /** An object relationship */
  replacement_section: Course_Section;
  replacement_section_id: Scalars['Int']['output'];
  /** An object relationship */
  source_schedule: User_Schedule;
  source_section_id: Scalars['Int']['output'];
  user_id: Scalars['Int']['output'];
};

/** aggregated selection of "user_schedule_swap" */
export type User_Schedule_Swap_Aggregate = {
  __typename?: 'user_schedule_swap_aggregate';
  aggregate?: Maybe<User_Schedule_Swap_Aggregate_Fields>;
  nodes: Array<User_Schedule_Swap>;
};

/** aggregate fields of "user_schedule_swap" */
export type User_Schedule_Swap_Aggregate_Fields = {
  __typename?: 'user_schedule_swap_aggregate_fields';
  avg?: Maybe<User_Schedule_Swap_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Schedule_Swap_Max_Fields>;
  min?: Maybe<User_Schedule_Swap_Min_Fields>;
  stddev?: Maybe<User_Schedule_Swap_Stddev_Fields>;
  stddev_pop?: Maybe<User_Schedule_Swap_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Schedule_Swap_Stddev_Samp_Fields>;
  sum?: Maybe<User_Schedule_Swap_Sum_Fields>;
  var_pop?: Maybe<User_Schedule_Swap_Var_Pop_Fields>;
  var_samp?: Maybe<User_Schedule_Swap_Var_Samp_Fields>;
  variance?: Maybe<User_Schedule_Swap_Variance_Fields>;
};

/** aggregate fields of "user_schedule_swap" */
export type User_Schedule_Swap_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Schedule_Swap_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type User_Schedule_Swap_Avg_Fields = {
  __typename?: 'user_schedule_swap_avg_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "user_schedule_swap". All fields are combined with a logical 'AND'. */
export type User_Schedule_Swap_Bool_Exp = {
  _and?: InputMaybe<Array<User_Schedule_Swap_Bool_Exp>>;
  _not?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
  _or?: InputMaybe<Array<User_Schedule_Swap_Bool_Exp>>;
  replacement_section?: InputMaybe<Course_Section_Bool_Exp>;
  replacement_section_id?: InputMaybe<Int_Comparison_Exp>;
  source_schedule?: InputMaybe<User_Schedule_Bool_Exp>;
  source_section_id?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_schedule_swap" */
export enum User_Schedule_Swap_Constraint {
  /** unique or primary key constraint on columns "user_id", "source_section_id" */
  UserScheduleSwapPkey = 'user_schedule_swap_pkey',
}

/** input type for incrementing numeric columns in table "user_schedule_swap" */
export type User_Schedule_Swap_Inc_Input = {
  replacement_section_id?: InputMaybe<Scalars['Int']['input']>;
  source_section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_schedule_swap" */
export type User_Schedule_Swap_Insert_Input = {
  replacement_section?: InputMaybe<Course_Section_Obj_Rel_Insert_Input>;
  replacement_section_id?: InputMaybe<Scalars['Int']['input']>;
  source_schedule?: InputMaybe<User_Schedule_Obj_Rel_Insert_Input>;
  source_section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type User_Schedule_Swap_Max_Fields = {
  __typename?: 'user_schedule_swap_max_fields';
  replacement_section_id?: Maybe<Scalars['Int']['output']>;
  source_section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregate min on columns */
export type User_Schedule_Swap_Min_Fields = {
  __typename?: 'user_schedule_swap_min_fields';
  replacement_section_id?: Maybe<Scalars['Int']['output']>;
  source_section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** response of any mutation on the table "user_schedule_swap" */
export type User_Schedule_Swap_Mutation_Response = {
  __typename?: 'user_schedule_swap_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Schedule_Swap>;
};

/** on_conflict condition type for table "user_schedule_swap" */
export type User_Schedule_Swap_On_Conflict = {
  constraint: User_Schedule_Swap_Constraint;
  update_columns?: Array<User_Schedule_Swap_Update_Column>;
  where?: InputMaybe<User_Schedule_Swap_Bool_Exp>;
};

/** Ordering options when selecting data from "user_schedule_swap". */
export type User_Schedule_Swap_Order_By = {
  replacement_section?: InputMaybe<Course_Section_Order_By>;
  replacement_section_id?: InputMaybe<Order_By>;
  source_schedule?: InputMaybe<User_Schedule_Order_By>;
  source_section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** primary key columns input for table: user_schedule_swap */
export type User_Schedule_Swap_Pk_Columns_Input = {
  source_section_id: Scalars['Int']['input'];
  user_id: Scalars['Int']['input'];
};

/** select columns of table "user_schedule_swap" */
export enum User_Schedule_Swap_Select_Column {
  /** column name */
  ReplacementSectionId = 'replacement_section_id',
  /** column name */
  SourceSectionId = 'source_section_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "user_schedule_swap" */
export type User_Schedule_Swap_Set_Input = {
  replacement_section_id?: InputMaybe<Scalars['Int']['input']>;
  source_section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type User_Schedule_Swap_Stddev_Fields = {
  __typename?: 'user_schedule_swap_stddev_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Schedule_Swap_Stddev_Pop_Fields = {
  __typename?: 'user_schedule_swap_stddev_pop_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Schedule_Swap_Stddev_Samp_Fields = {
  __typename?: 'user_schedule_swap_stddev_samp_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user_schedule_swap" */
export type User_Schedule_Swap_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Schedule_Swap_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Schedule_Swap_Stream_Cursor_Value_Input = {
  replacement_section_id?: InputMaybe<Scalars['Int']['input']>;
  source_section_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type User_Schedule_Swap_Sum_Fields = {
  __typename?: 'user_schedule_swap_sum_fields';
  replacement_section_id?: Maybe<Scalars['Int']['output']>;
  source_section_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "user_schedule_swap" */
export enum User_Schedule_Swap_Update_Column {
  /** column name */
  ReplacementSectionId = 'replacement_section_id',
  /** column name */
  SourceSectionId = 'source_section_id',
  /** column name */
  UserId = 'user_id',
}

export type User_Schedule_Swap_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Schedule_Swap_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Schedule_Swap_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Schedule_Swap_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Schedule_Swap_Var_Pop_Fields = {
  __typename?: 'user_schedule_swap_var_pop_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Schedule_Swap_Var_Samp_Fields = {
  __typename?: 'user_schedule_swap_var_samp_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Schedule_Swap_Variance_Fields = {
  __typename?: 'user_schedule_swap_variance_fields';
  replacement_section_id?: Maybe<Scalars['Float']['output']>;
  source_section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** update columns of table "user_schedule" */
export enum User_Schedule_Update_Column {
  /** column name */
  Location = 'location',
  /** column name */
  SectionId = 'section_id',
  /** column name */
  UserId = 'user_id',
}

export type User_Schedule_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Schedule_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Schedule_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Schedule_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Schedule_Var_Pop_Fields = {
  __typename?: 'user_schedule_var_pop_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "user_schedule" */
export type User_Schedule_Var_Pop_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type User_Schedule_Var_Samp_Fields = {
  __typename?: 'user_schedule_var_samp_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "user_schedule" */
export type User_Schedule_Var_Samp_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type User_Schedule_Variance_Fields = {
  __typename?: 'user_schedule_variance_fields';
  section_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "user_schedule" */
export type User_Schedule_Variance_Order_By = {
  section_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "user" */
export enum User_Select_Column {
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  FullName = 'full_name',
  /** column name */
  Id = 'id',
  /** column name */
  JoinDate = 'join_date',
  /** column name */
  JoinSource = 'join_source',
  /** column name */
  LastName = 'last_name',
  /** column name */
  PictureUrl = 'picture_url',
  /** column name */
  Program = 'program',
  /** column name */
  SecretId = 'secret_id',
}

/** input type for updating data in table "user" */
export type User_Set_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  join_date?: InputMaybe<Scalars['timestamptz']['input']>;
  join_source?: InputMaybe<Scalars['join_source']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
  program?: InputMaybe<Scalars['String']['input']>;
  secret_id?: InputMaybe<Scalars['String']['input']>;
};

/** columns and relationships of "user_shortlist" */
export type User_Shortlist = {
  __typename?: 'user_shortlist';
  /** An object relationship */
  course?: Maybe<Course>;
  course_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** aggregated selection of "user_shortlist" */
export type User_Shortlist_Aggregate = {
  __typename?: 'user_shortlist_aggregate';
  aggregate?: Maybe<User_Shortlist_Aggregate_Fields>;
  nodes: Array<User_Shortlist>;
};

export type User_Shortlist_Aggregate_Bool_Exp = {
  count?: InputMaybe<User_Shortlist_Aggregate_Bool_Exp_Count>;
};

export type User_Shortlist_Aggregate_Bool_Exp_Count = {
  arguments?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
  filter?: InputMaybe<User_Shortlist_Bool_Exp>;
  predicate: Int_Comparison_Exp;
};

/** aggregate fields of "user_shortlist" */
export type User_Shortlist_Aggregate_Fields = {
  __typename?: 'user_shortlist_aggregate_fields';
  avg?: Maybe<User_Shortlist_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<User_Shortlist_Max_Fields>;
  min?: Maybe<User_Shortlist_Min_Fields>;
  stddev?: Maybe<User_Shortlist_Stddev_Fields>;
  stddev_pop?: Maybe<User_Shortlist_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<User_Shortlist_Stddev_Samp_Fields>;
  sum?: Maybe<User_Shortlist_Sum_Fields>;
  var_pop?: Maybe<User_Shortlist_Var_Pop_Fields>;
  var_samp?: Maybe<User_Shortlist_Var_Samp_Fields>;
  variance?: Maybe<User_Shortlist_Variance_Fields>;
};

/** aggregate fields of "user_shortlist" */
export type User_Shortlist_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<User_Shortlist_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** order by aggregate values of table "user_shortlist" */
export type User_Shortlist_Aggregate_Order_By = {
  avg?: InputMaybe<User_Shortlist_Avg_Order_By>;
  count?: InputMaybe<Order_By>;
  max?: InputMaybe<User_Shortlist_Max_Order_By>;
  min?: InputMaybe<User_Shortlist_Min_Order_By>;
  stddev?: InputMaybe<User_Shortlist_Stddev_Order_By>;
  stddev_pop?: InputMaybe<User_Shortlist_Stddev_Pop_Order_By>;
  stddev_samp?: InputMaybe<User_Shortlist_Stddev_Samp_Order_By>;
  sum?: InputMaybe<User_Shortlist_Sum_Order_By>;
  var_pop?: InputMaybe<User_Shortlist_Var_Pop_Order_By>;
  var_samp?: InputMaybe<User_Shortlist_Var_Samp_Order_By>;
  variance?: InputMaybe<User_Shortlist_Variance_Order_By>;
};

/** input type for inserting array relation for remote table "user_shortlist" */
export type User_Shortlist_Arr_Rel_Insert_Input = {
  data: Array<User_Shortlist_Insert_Input>;
  /** upsert condition */
  on_conflict?: InputMaybe<User_Shortlist_On_Conflict>;
};

/** aggregate avg on columns */
export type User_Shortlist_Avg_Fields = {
  __typename?: 'user_shortlist_avg_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by avg() on columns of table "user_shortlist" */
export type User_Shortlist_Avg_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Boolean expression to filter rows from the table "user_shortlist". All fields are combined with a logical 'AND'. */
export type User_Shortlist_Bool_Exp = {
  _and?: InputMaybe<Array<User_Shortlist_Bool_Exp>>;
  _not?: InputMaybe<User_Shortlist_Bool_Exp>;
  _or?: InputMaybe<Array<User_Shortlist_Bool_Exp>>;
  course?: InputMaybe<Course_Bool_Exp>;
  course_id?: InputMaybe<Int_Comparison_Exp>;
  user_id?: InputMaybe<Int_Comparison_Exp>;
};

/** unique or primary key constraints on table "user_shortlist" */
export enum User_Shortlist_Constraint {
  /** unique or primary key constraint on columns "user_id", "course_id" */
  CourseUniquelyShortlisted = 'course_uniquely_shortlisted',
}

/** input type for incrementing numeric columns in table "user_shortlist" */
export type User_Shortlist_Inc_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "user_shortlist" */
export type User_Shortlist_Insert_Input = {
  course?: InputMaybe<Course_Obj_Rel_Insert_Input>;
  course_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate max on columns */
export type User_Shortlist_Max_Fields = {
  __typename?: 'user_shortlist_max_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by max() on columns of table "user_shortlist" */
export type User_Shortlist_Max_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate min on columns */
export type User_Shortlist_Min_Fields = {
  __typename?: 'user_shortlist_min_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by min() on columns of table "user_shortlist" */
export type User_Shortlist_Min_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** response of any mutation on the table "user_shortlist" */
export type User_Shortlist_Mutation_Response = {
  __typename?: 'user_shortlist_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<User_Shortlist>;
};

/** on_conflict condition type for table "user_shortlist" */
export type User_Shortlist_On_Conflict = {
  constraint: User_Shortlist_Constraint;
  update_columns?: Array<User_Shortlist_Update_Column>;
  where?: InputMaybe<User_Shortlist_Bool_Exp>;
};

/** Ordering options when selecting data from "user_shortlist". */
export type User_Shortlist_Order_By = {
  course?: InputMaybe<Course_Order_By>;
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** select columns of table "user_shortlist" */
export enum User_Shortlist_Select_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  UserId = 'user_id',
}

/** input type for updating data in table "user_shortlist" */
export type User_Shortlist_Set_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate stddev on columns */
export type User_Shortlist_Stddev_Fields = {
  __typename?: 'user_shortlist_stddev_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev() on columns of table "user_shortlist" */
export type User_Shortlist_Stddev_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_pop on columns */
export type User_Shortlist_Stddev_Pop_Fields = {
  __typename?: 'user_shortlist_stddev_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_pop() on columns of table "user_shortlist" */
export type User_Shortlist_Stddev_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev_samp on columns */
export type User_Shortlist_Stddev_Samp_Fields = {
  __typename?: 'user_shortlist_stddev_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by stddev_samp() on columns of table "user_shortlist" */
export type User_Shortlist_Stddev_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** Streaming cursor of the table "user_shortlist" */
export type User_Shortlist_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Shortlist_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Shortlist_Stream_Cursor_Value_Input = {
  course_id?: InputMaybe<Scalars['Int']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

/** aggregate sum on columns */
export type User_Shortlist_Sum_Fields = {
  __typename?: 'user_shortlist_sum_fields';
  course_id?: Maybe<Scalars['Int']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

/** order by sum() on columns of table "user_shortlist" */
export type User_Shortlist_Sum_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** update columns of table "user_shortlist" */
export enum User_Shortlist_Update_Column {
  /** column name */
  CourseId = 'course_id',
  /** column name */
  UserId = 'user_id',
}

export type User_Shortlist_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Shortlist_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Shortlist_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Shortlist_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Shortlist_Var_Pop_Fields = {
  __typename?: 'user_shortlist_var_pop_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_pop() on columns of table "user_shortlist" */
export type User_Shortlist_Var_Pop_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate var_samp on columns */
export type User_Shortlist_Var_Samp_Fields = {
  __typename?: 'user_shortlist_var_samp_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by var_samp() on columns of table "user_shortlist" */
export type User_Shortlist_Var_Samp_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate variance on columns */
export type User_Shortlist_Variance_Fields = {
  __typename?: 'user_shortlist_variance_fields';
  course_id?: Maybe<Scalars['Float']['output']>;
  user_id?: Maybe<Scalars['Float']['output']>;
};

/** order by variance() on columns of table "user_shortlist" */
export type User_Shortlist_Variance_Order_By = {
  course_id?: InputMaybe<Order_By>;
  user_id?: InputMaybe<Order_By>;
};

/** aggregate stddev on columns */
export type User_Stddev_Fields = {
  __typename?: 'user_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type User_Stddev_Pop_Fields = {
  __typename?: 'user_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type User_Stddev_Samp_Fields = {
  __typename?: 'user_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "user" */
export type User_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: User_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type User_Stream_Cursor_Value_Input = {
  email?: InputMaybe<Scalars['String']['input']>;
  first_name?: InputMaybe<Scalars['String']['input']>;
  full_name?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  join_date?: InputMaybe<Scalars['timestamptz']['input']>;
  join_source?: InputMaybe<Scalars['join_source']['input']>;
  last_name?: InputMaybe<Scalars['String']['input']>;
  picture_url?: InputMaybe<Scalars['String']['input']>;
  program?: InputMaybe<Scalars['String']['input']>;
  secret_id?: InputMaybe<Scalars['String']['input']>;
};

/** aggregate sum on columns */
export type User_Sum_Fields = {
  __typename?: 'user_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "user" */
export enum User_Update_Column {
  /** column name */
  Email = 'email',
  /** column name */
  FirstName = 'first_name',
  /** column name */
  Id = 'id',
  /** column name */
  JoinDate = 'join_date',
  /** column name */
  JoinSource = 'join_source',
  /** column name */
  LastName = 'last_name',
  /** column name */
  PictureUrl = 'picture_url',
  /** column name */
  Program = 'program',
  /** column name */
  SecretId = 'secret_id',
}

export type User_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<User_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<User_Set_Input>;
  /** filter the rows which have to be updated */
  where: User_Bool_Exp;
};

/** aggregate var_pop on columns */
export type User_Var_Pop_Fields = {
  __typename?: 'user_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type User_Var_Samp_Fields = {
  __typename?: 'user_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type User_Variance_Fields = {
  __typename?: 'user_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

export type CourseInfoFragment = {
  id: number;
  code: string;
  name: string;
  description: string | null;
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
      days: any;
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

export type ProfInfoFragment = { id: number; name: string; code: string };

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
  useful: any;
  terms: any;
  terms_with_seats: any;
  terms_with_online_sections: any;
  ratings: any;
  prof_ids: any;
  liked: any;
  easy: any;
  has_prereqs: boolean | null;
};

export type ProfSearchFragment = {
  prof_id: number | null;
  name: string | null;
  code: string | null;
  clear: any;
  course_ids: any;
  course_codes: any;
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
        days: any;
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
    days: any;
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

export const CourseInfoFragmentDoc = gql`
  fragment CourseInfo on course {
    id
    code
    name
    description
    profs_teaching {
      prof {
        id
        code
        name
        rating {
          liked
          comment_count
        }
      }
    }
  }
`;
export const CourseTermFragmentDoc = gql`
  fragment CourseTerm on course {
    id
    sections {
      id
      term_id
    }
  }
`;
export const CourseScheduleFragmentDoc = gql`
  fragment CourseSchedule on course {
    id
    sections {
      id
      enrollment_capacity
      enrollment_total
      class_number
      section_name
      term_id
      updated_at
      meetings {
        days
        start_date
        end_date
        start_seconds
        end_seconds
        location
        prof {
          id
          code
          name
        }
        is_closed
        is_cancelled
        is_tba
      }
      exams {
        date
        day
        end_seconds
        is_tba
        location
        section_id
        start_seconds
      }
    }
  }
`;
export const CourseRequirementsFragmentDoc = gql`
  fragment CourseRequirements on course {
    id
    antireqs
    prereqs
    coreqs
    postrequisites {
      postrequisite {
        id
        code
        name
      }
    }
  }
`;
export const CourseRatingFragmentDoc = gql`
  fragment CourseRating on course {
    id
    rating {
      liked
      easy
      useful
      filled_count
      comment_count
    }
  }
`;
export const CourseReviewDistributionFragmentDoc = gql`
  fragment CourseReviewDistribution on course {
    id
    course_useful_buckets {
      value
      count
    }
    course_easy_buckets {
      value
      count
    }
  }
`;
export const ProfInfoFragmentDoc = gql`
  fragment ProfInfo on prof {
    id
    name
    code
  }
`;
export const ProfCoursesTaughtFragmentDoc = gql`
  fragment ProfCoursesTaught on prof {
    id
    prof_courses {
      course {
        id
        code
      }
    }
  }
`;
export const ProfRatingFragmentDoc = gql`
  fragment ProfRating on prof {
    id
    rating {
      liked
      clear
      engaging
      filled_count
      comment_count
    }
  }
`;
export const ProfReviewDistributionFragmentDoc = gql`
  fragment ProfReviewDistribution on prof {
    id
    prof_engaging_buckets {
      value
      count
    }
    prof_clear_buckets {
      value
      count
    }
  }
`;
export const ReviewInfoFragmentDoc = gql`
  fragment ReviewInfo on review {
    id
    created_at
    updated_at
    public
    liked
    course_comment
    course_easy
    course_useful
    prof_engaging
    prof_comment
    prof_clear
    author {
      full_name
      picture_url
      program
    }
    course_id
    course {
      id
      code
      name
      profs_teaching {
        prof {
          id
          name
        }
      }
      rating {
        liked
      }
    }
    prof_id
    prof {
      id
      name
      code
      picture_url
      rating {
        liked
      }
    }
  }
`;
export const ReviewUpdateInfoFragmentDoc = gql`
  fragment ReviewUpdateInfo on review {
    id
    created_at
    updated_at
    public
    liked
    course_comment
    course_easy
    course_useful
    prof_engaging
    prof_comment
    prof_clear
    course_id
    prof_id
  }
`;
export const ReviewVoteCountsFragmentDoc = gql`
  fragment ReviewVoteCounts on review {
    id
    course_review_rating {
      upvote_count
    }
    prof_review_rating {
      upvote_count
    }
  }
`;
export const UserReviewFieldsFragmentDoc = gql`
  fragment UserReviewFields on review {
    id
    course_review_upvotes {
      user_id
    }
    prof_review_upvotes {
      user_id
    }
    user {
      user_id
    }
  }
`;
export const ReviewProfsFragmentDoc = gql`
  fragment ReviewProfs on review {
    id
    prof {
      id
      name
      code
    }
    course_id
  }
`;
export const CourseSearchFragmentDoc = gql`
  fragment CourseSearch on course_search_index {
    course_id
    name
    code
    useful
    terms
    terms_with_seats
    terms_with_online_sections
    ratings
    prof_ids
    liked
    easy
    has_prereqs
  }
`;
export const ProfSearchFragmentDoc = gql`
  fragment ProfSearch on prof_search_index {
    prof_id
    name
    code
    clear
    course_ids
    course_codes
    engaging
    liked
    ratings
  }
`;
export const UserInfoFragmentDoc = gql`
  fragment UserInfo on user {
    id
    full_name
    program
    picture_url
    secret_id
    email
  }
`;
export const UserShortlistFragmentDoc = gql`
  fragment UserShortlist on user {
    id
    shortlist {
      course_id
      user_id
      course {
        id
        code
        name
      }
    }
  }
`;
export const UserScheduleFragmentDoc = gql`
  fragment UserSchedule on user {
    id
    schedule {
      user_id
      section {
        id
        class_number
        term_id
        exams {
          date
          day
          location
          start_seconds
          end_seconds
        }
        meetings {
          days
          end_date
          end_seconds
          is_cancelled
          location
          prof {
            id
            name
          }
          section_id
          start_date
          start_seconds
        }
        section_name
        course {
          id
          name
          code
        }
      }
    }
  }
`;
export const UserCoursesTakenFragmentDoc = gql`
  fragment UserCoursesTaken on user_course_taken {
    term_id
    course_id
    course {
      id
      code
      name
      rating {
        liked
      }
      profs_teaching {
        prof {
          id
          code
          name
        }
      }
      sections {
        id
        term_id
        updated_at
        exams {
          date
          day
          end_seconds
          is_tba
          location
          section_id
          start_seconds
        }
      }
    }
  }
`;
export const SwapCourseSectionFragmentDoc = gql`
  fragment SwapCourseSection on course_section {
    id
    section_name
    class_number
    term_id
    enrollment_capacity
    enrollment_total
    updated_at
    exams {
      date
      day
      location
      start_seconds
      end_seconds
    }
    meetings {
      days
      end_date
      end_seconds
      is_cancelled
      is_tba
      location
      section_id
      start_date
      start_seconds
      prof {
        id
        code
        name
        rating {
          clear
          engaging
        }
      }
    }
    course {
      id
      name
      code
    }
  }
`;
export const UpdateUserEmailDocument = gql`
  mutation updateUserEmail($user_id: Int, $email: String) {
    update_user(where: { id: { _eq: $user_id } }, _set: { email: $email }) {
      affected_rows
      returning {
        id
        email
      }
    }
  }
`;
export type UpdateUserEmailMutationFn = Apollo.MutationFunction<
  UpdateUserEmailMutation,
  UpdateUserEmailMutationVariables
>;

/**
 * __useUpdateUserEmailMutation__
 *
 * To run a mutation, you first call `useUpdateUserEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserEmailMutation, { data, loading, error }] = useUpdateUserEmailMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useUpdateUserEmailMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateUserEmailMutation,
    UpdateUserEmailMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateUserEmailMutation,
    UpdateUserEmailMutationVariables
  >(UpdateUserEmailDocument, options);
}
export type UpdateUserEmailMutationHookResult = ReturnType<
  typeof useUpdateUserEmailMutation
>;
export type UpdateUserEmailMutationResult =
  Apollo.MutationResult<UpdateUserEmailMutation>;
export type UpdateUserEmailMutationOptions = Apollo.BaseMutationOptions<
  UpdateUserEmailMutation,
  UpdateUserEmailMutationVariables
>;
export const UpsertReviewDocument = gql`
  mutation upsertReview(
    $user_id: Int
    $course_id: Int
    $prof_id: Int
    $liked: smallint
    $public: Boolean
    $course_easy: smallint
    $course_useful: smallint
    $course_comment: String
    $prof_clear: smallint
    $prof_engaging: smallint
    $prof_comment: String
  ) {
    insert_review(
      objects: {
        user_id: $user_id
        course_id: $course_id
        prof_id: $prof_id
        liked: $liked
        public: $public
        course_easy: $course_easy
        course_useful: $course_useful
        course_comment: $course_comment
        prof_clear: $prof_clear
        prof_engaging: $prof_engaging
        prof_comment: $prof_comment
      }
      on_conflict: {
        constraint: course_uniquely_reviewed
        update_columns: [
          prof_id
          liked
          course_easy
          course_useful
          course_comment
          prof_clear
          prof_engaging
          prof_comment
          public
        ]
      }
    ) {
      returning {
        ...ReviewUpdateInfo
      }
    }
  }
  ${ReviewUpdateInfoFragmentDoc}
`;
export type UpsertReviewMutationFn = Apollo.MutationFunction<
  UpsertReviewMutation,
  UpsertReviewMutationVariables
>;

/**
 * __useUpsertReviewMutation__
 *
 * To run a mutation, you first call `useUpsertReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertReviewMutation, { data, loading, error }] = useUpsertReviewMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      course_id: // value for 'course_id'
 *      prof_id: // value for 'prof_id'
 *      liked: // value for 'liked'
 *      public: // value for 'public'
 *      course_easy: // value for 'course_easy'
 *      course_useful: // value for 'course_useful'
 *      course_comment: // value for 'course_comment'
 *      prof_clear: // value for 'prof_clear'
 *      prof_engaging: // value for 'prof_engaging'
 *      prof_comment: // value for 'prof_comment'
 *   },
 * });
 */
export function useUpsertReviewMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertReviewMutation,
    UpsertReviewMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertReviewMutation,
    UpsertReviewMutationVariables
  >(UpsertReviewDocument, options);
}
export type UpsertReviewMutationHookResult = ReturnType<
  typeof useUpsertReviewMutation
>;
export type UpsertReviewMutationResult =
  Apollo.MutationResult<UpsertReviewMutation>;
export type UpsertReviewMutationOptions = Apollo.BaseMutationOptions<
  UpsertReviewMutation,
  UpsertReviewMutationVariables
>;
export const DeleteReviewDocument = gql`
  mutation deleteReview($review_id: Int) {
    delete_review(where: { id: { _eq: $review_id } }) {
      returning {
        ...ReviewUpdateInfo
      }
    }
  }
  ${ReviewUpdateInfoFragmentDoc}
`;
export type DeleteReviewMutationFn = Apollo.MutationFunction<
  DeleteReviewMutation,
  DeleteReviewMutationVariables
>;

/**
 * __useDeleteReviewMutation__
 *
 * To run a mutation, you first call `useDeleteReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteReviewMutation, { data, loading, error }] = useDeleteReviewMutation({
 *   variables: {
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useDeleteReviewMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteReviewMutation,
    DeleteReviewMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteReviewMutation,
    DeleteReviewMutationVariables
  >(DeleteReviewDocument, options);
}
export type DeleteReviewMutationHookResult = ReturnType<
  typeof useDeleteReviewMutation
>;
export type DeleteReviewMutationResult =
  Apollo.MutationResult<DeleteReviewMutation>;
export type DeleteReviewMutationOptions = Apollo.BaseMutationOptions<
  DeleteReviewMutation,
  DeleteReviewMutationVariables
>;
export const UpsertLikedReviewDocument = gql`
  mutation upsertLikedReview($user_id: Int, $course_id: Int, $liked: smallint) {
    insert_review(
      objects: {
        user_id: $user_id
        course_id: $course_id
        liked: $liked
        public: false
      }
      on_conflict: {
        constraint: course_uniquely_reviewed
        update_columns: [liked]
      }
    ) {
      returning {
        id
        liked
      }
    }
  }
`;
export type UpsertLikedReviewMutationFn = Apollo.MutationFunction<
  UpsertLikedReviewMutation,
  UpsertLikedReviewMutationVariables
>;

/**
 * __useUpsertLikedReviewMutation__
 *
 * To run a mutation, you first call `useUpsertLikedReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertLikedReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertLikedReviewMutation, { data, loading, error }] = useUpsertLikedReviewMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      course_id: // value for 'course_id'
 *      liked: // value for 'liked'
 *   },
 * });
 */
export function useUpsertLikedReviewMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertLikedReviewMutation,
    UpsertLikedReviewMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertLikedReviewMutation,
    UpsertLikedReviewMutationVariables
  >(UpsertLikedReviewDocument, options);
}
export type UpsertLikedReviewMutationHookResult = ReturnType<
  typeof useUpsertLikedReviewMutation
>;
export type UpsertLikedReviewMutationResult =
  Apollo.MutationResult<UpsertLikedReviewMutation>;
export type UpsertLikedReviewMutationOptions = Apollo.BaseMutationOptions<
  UpsertLikedReviewMutation,
  UpsertLikedReviewMutationVariables
>;
export const UpsertScheduleSwapDocument = gql`
  mutation upsertScheduleSwap(
    $userId: Int!
    $sourceSectionId: Int!
    $replacementSectionId: Int!
  ) {
    insert_user_schedule_swap_one(
      object: {
        user_id: $userId
        source_section_id: $sourceSectionId
        replacement_section_id: $replacementSectionId
      }
      on_conflict: {
        constraint: user_schedule_swap_pkey
        update_columns: [replacement_section_id]
      }
    ) {
      user_id
      source_section_id
    }
  }
`;
export type UpsertScheduleSwapMutationFn = Apollo.MutationFunction<
  UpsertScheduleSwapMutation,
  UpsertScheduleSwapMutationVariables
>;

/**
 * __useUpsertScheduleSwapMutation__
 *
 * To run a mutation, you first call `useUpsertScheduleSwapMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertScheduleSwapMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertScheduleSwapMutation, { data, loading, error }] = useUpsertScheduleSwapMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      sourceSectionId: // value for 'sourceSectionId'
 *      replacementSectionId: // value for 'replacementSectionId'
 *   },
 * });
 */
export function useUpsertScheduleSwapMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertScheduleSwapMutation,
    UpsertScheduleSwapMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertScheduleSwapMutation,
    UpsertScheduleSwapMutationVariables
  >(UpsertScheduleSwapDocument, options);
}
export type UpsertScheduleSwapMutationHookResult = ReturnType<
  typeof useUpsertScheduleSwapMutation
>;
export type UpsertScheduleSwapMutationResult =
  Apollo.MutationResult<UpsertScheduleSwapMutation>;
export type UpsertScheduleSwapMutationOptions = Apollo.BaseMutationOptions<
  UpsertScheduleSwapMutation,
  UpsertScheduleSwapMutationVariables
>;
export const DeleteScheduleSwapDocument = gql`
  mutation deleteScheduleSwap($userId: Int!, $sourceSectionId: Int!) {
    delete_user_schedule_swap_by_pk(
      user_id: $userId
      source_section_id: $sourceSectionId
    ) {
      user_id
      source_section_id
    }
  }
`;
export type DeleteScheduleSwapMutationFn = Apollo.MutationFunction<
  DeleteScheduleSwapMutation,
  DeleteScheduleSwapMutationVariables
>;

/**
 * __useDeleteScheduleSwapMutation__
 *
 * To run a mutation, you first call `useDeleteScheduleSwapMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteScheduleSwapMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteScheduleSwapMutation, { data, loading, error }] = useDeleteScheduleSwapMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      sourceSectionId: // value for 'sourceSectionId'
 *   },
 * });
 */
export function useDeleteScheduleSwapMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteScheduleSwapMutation,
    DeleteScheduleSwapMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteScheduleSwapMutation,
    DeleteScheduleSwapMutationVariables
  >(DeleteScheduleSwapDocument, options);
}
export type DeleteScheduleSwapMutationHookResult = ReturnType<
  typeof useDeleteScheduleSwapMutation
>;
export type DeleteScheduleSwapMutationResult =
  Apollo.MutationResult<DeleteScheduleSwapMutation>;
export type DeleteScheduleSwapMutationOptions = Apollo.BaseMutationOptions<
  DeleteScheduleSwapMutation,
  DeleteScheduleSwapMutationVariables
>;
export const ClearScheduleSwapsDocument = gql`
  mutation clearScheduleSwaps($userId: Int!) {
    delete_user_schedule_swap(where: { user_id: { _eq: $userId } }) {
      affected_rows
    }
  }
`;
export type ClearScheduleSwapsMutationFn = Apollo.MutationFunction<
  ClearScheduleSwapsMutation,
  ClearScheduleSwapsMutationVariables
>;

/**
 * __useClearScheduleSwapsMutation__
 *
 * To run a mutation, you first call `useClearScheduleSwapsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearScheduleSwapsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearScheduleSwapsMutation, { data, loading, error }] = useClearScheduleSwapsMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useClearScheduleSwapsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ClearScheduleSwapsMutation,
    ClearScheduleSwapsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    ClearScheduleSwapsMutation,
    ClearScheduleSwapsMutationVariables
  >(ClearScheduleSwapsDocument, options);
}
export type ClearScheduleSwapsMutationHookResult = ReturnType<
  typeof useClearScheduleSwapsMutation
>;
export type ClearScheduleSwapsMutationResult =
  Apollo.MutationResult<ClearScheduleSwapsMutation>;
export type ClearScheduleSwapsMutationOptions = Apollo.BaseMutationOptions<
  ClearScheduleSwapsMutation,
  ClearScheduleSwapsMutationVariables
>;
export const InsertSectionSubscriptionDocument = gql`
  mutation insertSectionSubscription($section_id: Int, $user_id: Int) {
    insert_queue_section_subscribed(
      objects: { section_id: $section_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;
export type InsertSectionSubscriptionMutationFn = Apollo.MutationFunction<
  InsertSectionSubscriptionMutation,
  InsertSectionSubscriptionMutationVariables
>;

/**
 * __useInsertSectionSubscriptionMutation__
 *
 * To run a mutation, you first call `useInsertSectionSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertSectionSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertSectionSubscriptionMutation, { data, loading, error }] = useInsertSectionSubscriptionMutation({
 *   variables: {
 *      section_id: // value for 'section_id'
 *      user_id: // value for 'user_id'
 *   },
 * });
 */
export function useInsertSectionSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertSectionSubscriptionMutation,
    InsertSectionSubscriptionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertSectionSubscriptionMutation,
    InsertSectionSubscriptionMutationVariables
  >(InsertSectionSubscriptionDocument, options);
}
export type InsertSectionSubscriptionMutationHookResult = ReturnType<
  typeof useInsertSectionSubscriptionMutation
>;
export type InsertSectionSubscriptionMutationResult =
  Apollo.MutationResult<InsertSectionSubscriptionMutation>;
export type InsertSectionSubscriptionMutationOptions =
  Apollo.BaseMutationOptions<
    InsertSectionSubscriptionMutation,
    InsertSectionSubscriptionMutationVariables
  >;
export const DeleteSectionSubscriptionDocument = gql`
  mutation deleteSectionSubscription($section_id: Int) {
    delete_queue_section_subscribed(
      where: { section_id: { _eq: $section_id } }
    ) {
      affected_rows
    }
  }
`;
export type DeleteSectionSubscriptionMutationFn = Apollo.MutationFunction<
  DeleteSectionSubscriptionMutation,
  DeleteSectionSubscriptionMutationVariables
>;

/**
 * __useDeleteSectionSubscriptionMutation__
 *
 * To run a mutation, you first call `useDeleteSectionSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteSectionSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteSectionSubscriptionMutation, { data, loading, error }] = useDeleteSectionSubscriptionMutation({
 *   variables: {
 *      section_id: // value for 'section_id'
 *   },
 * });
 */
export function useDeleteSectionSubscriptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteSectionSubscriptionMutation,
    DeleteSectionSubscriptionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteSectionSubscriptionMutation,
    DeleteSectionSubscriptionMutationVariables
  >(DeleteSectionSubscriptionDocument, options);
}
export type DeleteSectionSubscriptionMutationHookResult = ReturnType<
  typeof useDeleteSectionSubscriptionMutation
>;
export type DeleteSectionSubscriptionMutationResult =
  Apollo.MutationResult<DeleteSectionSubscriptionMutation>;
export type DeleteSectionSubscriptionMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteSectionSubscriptionMutation,
    DeleteSectionSubscriptionMutationVariables
  >;
export const InsertUserShortlistDocument = gql`
  mutation insertUserShortlist($user_id: Int, $course_id: Int) {
    insert_user_shortlist(
      objects: { course_id: $course_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;
export type InsertUserShortlistMutationFn = Apollo.MutationFunction<
  InsertUserShortlistMutation,
  InsertUserShortlistMutationVariables
>;

/**
 * __useInsertUserShortlistMutation__
 *
 * To run a mutation, you first call `useInsertUserShortlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertUserShortlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertUserShortlistMutation, { data, loading, error }] = useInsertUserShortlistMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      course_id: // value for 'course_id'
 *   },
 * });
 */
export function useInsertUserShortlistMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertUserShortlistMutation,
    InsertUserShortlistMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertUserShortlistMutation,
    InsertUserShortlistMutationVariables
  >(InsertUserShortlistDocument, options);
}
export type InsertUserShortlistMutationHookResult = ReturnType<
  typeof useInsertUserShortlistMutation
>;
export type InsertUserShortlistMutationResult =
  Apollo.MutationResult<InsertUserShortlistMutation>;
export type InsertUserShortlistMutationOptions = Apollo.BaseMutationOptions<
  InsertUserShortlistMutation,
  InsertUserShortlistMutationVariables
>;
export const DeleteUserShortlistDocument = gql`
  mutation deleteUserShortlist($course_id: Int) {
    delete_user_shortlist(where: { course_id: { _eq: $course_id } }) {
      affected_rows
    }
  }
`;
export type DeleteUserShortlistMutationFn = Apollo.MutationFunction<
  DeleteUserShortlistMutation,
  DeleteUserShortlistMutationVariables
>;

/**
 * __useDeleteUserShortlistMutation__
 *
 * To run a mutation, you first call `useDeleteUserShortlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteUserShortlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteUserShortlistMutation, { data, loading, error }] = useDeleteUserShortlistMutation({
 *   variables: {
 *      course_id: // value for 'course_id'
 *   },
 * });
 */
export function useDeleteUserShortlistMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteUserShortlistMutation,
    DeleteUserShortlistMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteUserShortlistMutation,
    DeleteUserShortlistMutationVariables
  >(DeleteUserShortlistDocument, options);
}
export type DeleteUserShortlistMutationHookResult = ReturnType<
  typeof useDeleteUserShortlistMutation
>;
export type DeleteUserShortlistMutationResult =
  Apollo.MutationResult<DeleteUserShortlistMutation>;
export type DeleteUserShortlistMutationOptions = Apollo.BaseMutationOptions<
  DeleteUserShortlistMutation,
  DeleteUserShortlistMutationVariables
>;
export const InsertCourseReviewVoteDocument = gql`
  mutation insertCourseReviewVote($user_id: Int, $review_id: Int) {
    insert_course_review_upvote(
      objects: { review_id: $review_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;
export type InsertCourseReviewVoteMutationFn = Apollo.MutationFunction<
  InsertCourseReviewVoteMutation,
  InsertCourseReviewVoteMutationVariables
>;

/**
 * __useInsertCourseReviewVoteMutation__
 *
 * To run a mutation, you first call `useInsertCourseReviewVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertCourseReviewVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertCourseReviewVoteMutation, { data, loading, error }] = useInsertCourseReviewVoteMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useInsertCourseReviewVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertCourseReviewVoteMutation,
    InsertCourseReviewVoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertCourseReviewVoteMutation,
    InsertCourseReviewVoteMutationVariables
  >(InsertCourseReviewVoteDocument, options);
}
export type InsertCourseReviewVoteMutationHookResult = ReturnType<
  typeof useInsertCourseReviewVoteMutation
>;
export type InsertCourseReviewVoteMutationResult =
  Apollo.MutationResult<InsertCourseReviewVoteMutation>;
export type InsertCourseReviewVoteMutationOptions = Apollo.BaseMutationOptions<
  InsertCourseReviewVoteMutation,
  InsertCourseReviewVoteMutationVariables
>;
export const DeleteCourseReviewVoteDocument = gql`
  mutation deleteCourseReviewVote($user_id: Int, $review_id: Int) {
    delete_course_review_upvote(
      where: { user_id: { _eq: $user_id }, review_id: { _eq: $review_id } }
    ) {
      affected_rows
    }
  }
`;
export type DeleteCourseReviewVoteMutationFn = Apollo.MutationFunction<
  DeleteCourseReviewVoteMutation,
  DeleteCourseReviewVoteMutationVariables
>;

/**
 * __useDeleteCourseReviewVoteMutation__
 *
 * To run a mutation, you first call `useDeleteCourseReviewVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCourseReviewVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCourseReviewVoteMutation, { data, loading, error }] = useDeleteCourseReviewVoteMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useDeleteCourseReviewVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteCourseReviewVoteMutation,
    DeleteCourseReviewVoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteCourseReviewVoteMutation,
    DeleteCourseReviewVoteMutationVariables
  >(DeleteCourseReviewVoteDocument, options);
}
export type DeleteCourseReviewVoteMutationHookResult = ReturnType<
  typeof useDeleteCourseReviewVoteMutation
>;
export type DeleteCourseReviewVoteMutationResult =
  Apollo.MutationResult<DeleteCourseReviewVoteMutation>;
export type DeleteCourseReviewVoteMutationOptions = Apollo.BaseMutationOptions<
  DeleteCourseReviewVoteMutation,
  DeleteCourseReviewVoteMutationVariables
>;
export const InsertProfReviewVoteDocument = gql`
  mutation insertProfReviewVote($user_id: Int, $review_id: Int) {
    insert_prof_review_upvote(
      objects: { review_id: $review_id, user_id: $user_id }
    ) {
      affected_rows
    }
  }
`;
export type InsertProfReviewVoteMutationFn = Apollo.MutationFunction<
  InsertProfReviewVoteMutation,
  InsertProfReviewVoteMutationVariables
>;

/**
 * __useInsertProfReviewVoteMutation__
 *
 * To run a mutation, you first call `useInsertProfReviewVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertProfReviewVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertProfReviewVoteMutation, { data, loading, error }] = useInsertProfReviewVoteMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useInsertProfReviewVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertProfReviewVoteMutation,
    InsertProfReviewVoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertProfReviewVoteMutation,
    InsertProfReviewVoteMutationVariables
  >(InsertProfReviewVoteDocument, options);
}
export type InsertProfReviewVoteMutationHookResult = ReturnType<
  typeof useInsertProfReviewVoteMutation
>;
export type InsertProfReviewVoteMutationResult =
  Apollo.MutationResult<InsertProfReviewVoteMutation>;
export type InsertProfReviewVoteMutationOptions = Apollo.BaseMutationOptions<
  InsertProfReviewVoteMutation,
  InsertProfReviewVoteMutationVariables
>;
export const Delete_Prof_Review_VoteDocument = gql`
  mutation DELETE_PROF_REVIEW_VOTE($user_id: Int, $review_id: Int) {
    delete_prof_review_upvote(
      where: { user_id: { _eq: $user_id }, review_id: { _eq: $review_id } }
    ) {
      affected_rows
    }
  }
`;
export type Delete_Prof_Review_VoteMutationFn = Apollo.MutationFunction<
  Delete_Prof_Review_VoteMutation,
  Delete_Prof_Review_VoteMutationVariables
>;

/**
 * __useDelete_Prof_Review_VoteMutation__
 *
 * To run a mutation, you first call `useDelete_Prof_Review_VoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDelete_Prof_Review_VoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProfReviewVoteMutation, { data, loading, error }] = useDelete_Prof_Review_VoteMutation({
 *   variables: {
 *      user_id: // value for 'user_id'
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useDelete_Prof_Review_VoteMutation(
  baseOptions?: Apollo.MutationHookOptions<
    Delete_Prof_Review_VoteMutation,
    Delete_Prof_Review_VoteMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    Delete_Prof_Review_VoteMutation,
    Delete_Prof_Review_VoteMutationVariables
  >(Delete_Prof_Review_VoteDocument, options);
}
export type Delete_Prof_Review_VoteMutationHookResult = ReturnType<
  typeof useDelete_Prof_Review_VoteMutation
>;
export type Delete_Prof_Review_VoteMutationResult =
  Apollo.MutationResult<Delete_Prof_Review_VoteMutation>;
export type Delete_Prof_Review_VoteMutationOptions = Apollo.BaseMutationOptions<
  Delete_Prof_Review_VoteMutation,
  Delete_Prof_Review_VoteMutationVariables
>;
export const GetCourseDocument = gql`
  query getCourse($code: String) {
    course(where: { code: { _eq: $code } }) {
      ...CourseInfo
      ...CourseSchedule
      ...CourseRequirements
      ...CourseRating
      ...CourseReviewDistribution
    }
  }
  ${CourseInfoFragmentDoc}
  ${CourseScheduleFragmentDoc}
  ${CourseRequirementsFragmentDoc}
  ${CourseRatingFragmentDoc}
  ${CourseReviewDistributionFragmentDoc}
`;

/**
 * __useGetCourseQuery__
 *
 * To run a query within a React component, call `useGetCourseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useGetCourseQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCourseQuery,
    GetCourseQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCourseQuery, GetCourseQueryVariables>(
    GetCourseDocument,
    options,
  );
}
export function useGetCourseLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCourseQuery,
    GetCourseQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCourseQuery, GetCourseQueryVariables>(
    GetCourseDocument,
    options,
  );
}
// @ts-ignore
export function useGetCourseSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCourseQuery,
    GetCourseQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetCourseQuery, GetCourseQueryVariables>;
export function useGetCourseSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  GetCourseQuery | undefined,
  GetCourseQueryVariables
>;
export function useGetCourseSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCourseQuery, GetCourseQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCourseQuery, GetCourseQueryVariables>(
    GetCourseDocument,
    options,
  );
}
export type GetCourseQueryHookResult = ReturnType<typeof useGetCourseQuery>;
export type GetCourseLazyQueryHookResult = ReturnType<
  typeof useGetCourseLazyQuery
>;
export type GetCourseSuspenseQueryHookResult = ReturnType<
  typeof useGetCourseSuspenseQuery
>;
export type GetCourseQueryResult = Apollo.QueryResult<
  GetCourseQuery,
  GetCourseQueryVariables
>;
export const GetCourseWithUserDataDocument = gql`
  query getCourseWithUserData($code: String, $user_id: Int) {
    course(where: { code: { _eq: $code } }) {
      ...CourseInfo
      ...CourseSchedule
      ...CourseRequirements
      ...CourseRating
      ...CourseReviewDistribution
    }
    user_shortlist(
      where: { user_id: { _eq: $user_id }, course: { code: { _eq: $code } } }
    ) {
      course_id
      user_id
    }
    user_course_taken(
      where: { course: { code: { _eq: $code } }, user_id: { _eq: $user_id } }
    ) {
      term_id
      course_id
    }
    queue_section_subscribed(
      where: {
        section: { course: { code: { _eq: $code } } }
        user_id: { _eq: $user_id }
      }
    ) {
      section_id
      user_id
    }
    review(
      where: {
        course: { code: { _eq: $code } }
        user: { user_id: { _eq: $user_id } }
      }
    ) {
      ...ReviewInfo
    }
    user {
      email
    }
  }
  ${CourseInfoFragmentDoc}
  ${CourseScheduleFragmentDoc}
  ${CourseRequirementsFragmentDoc}
  ${CourseRatingFragmentDoc}
  ${CourseReviewDistributionFragmentDoc}
  ${ReviewInfoFragmentDoc}
`;

/**
 * __useGetCourseWithUserDataQuery__
 *
 * To run a query within a React component, call `useGetCourseWithUserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseWithUserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseWithUserDataQuery({
 *   variables: {
 *      code: // value for 'code'
 *      user_id: // value for 'user_id'
 *   },
 * });
 */
export function useGetCourseWithUserDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCourseWithUserDataQuery,
    GetCourseWithUserDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCourseWithUserDataQuery,
    GetCourseWithUserDataQueryVariables
  >(GetCourseWithUserDataDocument, options);
}
export function useGetCourseWithUserDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCourseWithUserDataQuery,
    GetCourseWithUserDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCourseWithUserDataQuery,
    GetCourseWithUserDataQueryVariables
  >(GetCourseWithUserDataDocument, options);
}
// @ts-ignore
export function useGetCourseWithUserDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCourseWithUserDataQuery,
    GetCourseWithUserDataQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCourseWithUserDataQuery,
  GetCourseWithUserDataQueryVariables
>;
export function useGetCourseWithUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCourseWithUserDataQuery,
        GetCourseWithUserDataQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCourseWithUserDataQuery | undefined,
  GetCourseWithUserDataQueryVariables
>;
export function useGetCourseWithUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCourseWithUserDataQuery,
        GetCourseWithUserDataQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCourseWithUserDataQuery,
    GetCourseWithUserDataQueryVariables
  >(GetCourseWithUserDataDocument, options);
}
export type GetCourseWithUserDataQueryHookResult = ReturnType<
  typeof useGetCourseWithUserDataQuery
>;
export type GetCourseWithUserDataLazyQueryHookResult = ReturnType<
  typeof useGetCourseWithUserDataLazyQuery
>;
export type GetCourseWithUserDataSuspenseQueryHookResult = ReturnType<
  typeof useGetCourseWithUserDataSuspenseQuery
>;
export type GetCourseWithUserDataQueryResult = Apollo.QueryResult<
  GetCourseWithUserDataQuery,
  GetCourseWithUserDataQueryVariables
>;
export const RefetchCourseShortlistDocument = gql`
  query refetchCourseShortlist($code: String, $user_id: Int) {
    user_shortlist(
      where: { user_id: { _eq: $user_id }, course: { code: { _eq: $code } } }
    ) {
      course_id
      user_id
    }
  }
`;

/**
 * __useRefetchCourseShortlistQuery__
 *
 * To run a query within a React component, call `useRefetchCourseShortlistQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchCourseShortlistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchCourseShortlistQuery({
 *   variables: {
 *      code: // value for 'code'
 *      user_id: // value for 'user_id'
 *   },
 * });
 */
export function useRefetchCourseShortlistQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchCourseShortlistQuery,
    RefetchCourseShortlistQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RefetchCourseShortlistQuery,
    RefetchCourseShortlistQueryVariables
  >(RefetchCourseShortlistDocument, options);
}
export function useRefetchCourseShortlistLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchCourseShortlistQuery,
    RefetchCourseShortlistQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RefetchCourseShortlistQuery,
    RefetchCourseShortlistQueryVariables
  >(RefetchCourseShortlistDocument, options);
}
// @ts-ignore
export function useRefetchCourseShortlistSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchCourseShortlistQuery,
    RefetchCourseShortlistQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchCourseShortlistQuery,
  RefetchCourseShortlistQueryVariables
>;
export function useRefetchCourseShortlistSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchCourseShortlistQuery,
        RefetchCourseShortlistQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchCourseShortlistQuery | undefined,
  RefetchCourseShortlistQueryVariables
>;
export function useRefetchCourseShortlistSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchCourseShortlistQuery,
        RefetchCourseShortlistQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchCourseShortlistQuery,
    RefetchCourseShortlistQueryVariables
  >(RefetchCourseShortlistDocument, options);
}
export type RefetchCourseShortlistQueryHookResult = ReturnType<
  typeof useRefetchCourseShortlistQuery
>;
export type RefetchCourseShortlistLazyQueryHookResult = ReturnType<
  typeof useRefetchCourseShortlistLazyQuery
>;
export type RefetchCourseShortlistSuspenseQueryHookResult = ReturnType<
  typeof useRefetchCourseShortlistSuspenseQuery
>;
export type RefetchCourseShortlistQueryResult = Apollo.QueryResult<
  RefetchCourseShortlistQuery,
  RefetchCourseShortlistQueryVariables
>;
export const RefetchRatingsDocument = gql`
  query refetchRatings($course_id: Int, $prof_id: Int) {
    course(where: { id: { _eq: $course_id } }) {
      ...CourseRating
    }
    prof(where: { id: { _eq: $prof_id } }) {
      ...ProfRating
    }
  }
  ${CourseRatingFragmentDoc}
  ${ProfRatingFragmentDoc}
`;

/**
 * __useRefetchRatingsQuery__
 *
 * To run a query within a React component, call `useRefetchRatingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchRatingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchRatingsQuery({
 *   variables: {
 *      course_id: // value for 'course_id'
 *      prof_id: // value for 'prof_id'
 *   },
 * });
 */
export function useRefetchRatingsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchRatingsQuery,
    RefetchRatingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<RefetchRatingsQuery, RefetchRatingsQueryVariables>(
    RefetchRatingsDocument,
    options,
  );
}
export function useRefetchRatingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchRatingsQuery,
    RefetchRatingsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<RefetchRatingsQuery, RefetchRatingsQueryVariables>(
    RefetchRatingsDocument,
    options,
  );
}
// @ts-ignore
export function useRefetchRatingsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchRatingsQuery,
    RefetchRatingsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchRatingsQuery,
  RefetchRatingsQueryVariables
>;
export function useRefetchRatingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchRatingsQuery,
        RefetchRatingsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchRatingsQuery | undefined,
  RefetchRatingsQueryVariables
>;
export function useRefetchRatingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchRatingsQuery,
        RefetchRatingsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchRatingsQuery,
    RefetchRatingsQueryVariables
  >(RefetchRatingsDocument, options);
}
export type RefetchRatingsQueryHookResult = ReturnType<
  typeof useRefetchRatingsQuery
>;
export type RefetchRatingsLazyQueryHookResult = ReturnType<
  typeof useRefetchRatingsLazyQuery
>;
export type RefetchRatingsSuspenseQueryHookResult = ReturnType<
  typeof useRefetchRatingsSuspenseQuery
>;
export type RefetchRatingsQueryResult = Apollo.QueryResult<
  RefetchRatingsQuery,
  RefetchRatingsQueryVariables
>;
export const RefetchSectionSubscriptionsDocument = gql`
  query refetchSectionSubscriptions($course_id: Int, $user_id: Int) {
    queue_section_subscribed(
      where: {
        section: { course_id: { _eq: $course_id } }
        user_id: { _eq: $user_id }
      }
    ) {
      section_id
      user_id
    }
  }
`;

/**
 * __useRefetchSectionSubscriptionsQuery__
 *
 * To run a query within a React component, call `useRefetchSectionSubscriptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchSectionSubscriptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchSectionSubscriptionsQuery({
 *   variables: {
 *      course_id: // value for 'course_id'
 *      user_id: // value for 'user_id'
 *   },
 * });
 */
export function useRefetchSectionSubscriptionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchSectionSubscriptionsQuery,
    RefetchSectionSubscriptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RefetchSectionSubscriptionsQuery,
    RefetchSectionSubscriptionsQueryVariables
  >(RefetchSectionSubscriptionsDocument, options);
}
export function useRefetchSectionSubscriptionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchSectionSubscriptionsQuery,
    RefetchSectionSubscriptionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RefetchSectionSubscriptionsQuery,
    RefetchSectionSubscriptionsQueryVariables
  >(RefetchSectionSubscriptionsDocument, options);
}
// @ts-ignore
export function useRefetchSectionSubscriptionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchSectionSubscriptionsQuery,
    RefetchSectionSubscriptionsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchSectionSubscriptionsQuery,
  RefetchSectionSubscriptionsQueryVariables
>;
export function useRefetchSectionSubscriptionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchSectionSubscriptionsQuery,
        RefetchSectionSubscriptionsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchSectionSubscriptionsQuery | undefined,
  RefetchSectionSubscriptionsQueryVariables
>;
export function useRefetchSectionSubscriptionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchSectionSubscriptionsQuery,
        RefetchSectionSubscriptionsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchSectionSubscriptionsQuery,
    RefetchSectionSubscriptionsQueryVariables
  >(RefetchSectionSubscriptionsDocument, options);
}
export type RefetchSectionSubscriptionsQueryHookResult = ReturnType<
  typeof useRefetchSectionSubscriptionsQuery
>;
export type RefetchSectionSubscriptionsLazyQueryHookResult = ReturnType<
  typeof useRefetchSectionSubscriptionsLazyQuery
>;
export type RefetchSectionSubscriptionsSuspenseQueryHookResult = ReturnType<
  typeof useRefetchSectionSubscriptionsSuspenseQuery
>;
export type RefetchSectionSubscriptionsQueryResult = Apollo.QueryResult<
  RefetchSectionSubscriptionsQuery,
  RefetchSectionSubscriptionsQueryVariables
>;
export const RefetchCourseReviewsDocument = gql`
  query refetchCourseReviews($code: String, $user_id: Int) {
    review(
      where: {
        course: { code: { _eq: $code } }
        user: { user_id: { _eq: $user_id } }
      }
    ) {
      ...ReviewInfo
    }
  }
  ${ReviewInfoFragmentDoc}
`;

/**
 * __useRefetchCourseReviewsQuery__
 *
 * To run a query within a React component, call `useRefetchCourseReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchCourseReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchCourseReviewsQuery({
 *   variables: {
 *      code: // value for 'code'
 *      user_id: // value for 'user_id'
 *   },
 * });
 */
export function useRefetchCourseReviewsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchCourseReviewsQuery,
    RefetchCourseReviewsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RefetchCourseReviewsQuery,
    RefetchCourseReviewsQueryVariables
  >(RefetchCourseReviewsDocument, options);
}
export function useRefetchCourseReviewsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchCourseReviewsQuery,
    RefetchCourseReviewsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RefetchCourseReviewsQuery,
    RefetchCourseReviewsQueryVariables
  >(RefetchCourseReviewsDocument, options);
}
// @ts-ignore
export function useRefetchCourseReviewsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchCourseReviewsQuery,
    RefetchCourseReviewsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchCourseReviewsQuery,
  RefetchCourseReviewsQueryVariables
>;
export function useRefetchCourseReviewsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchCourseReviewsQuery,
        RefetchCourseReviewsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchCourseReviewsQuery | undefined,
  RefetchCourseReviewsQueryVariables
>;
export function useRefetchCourseReviewsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchCourseReviewsQuery,
        RefetchCourseReviewsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchCourseReviewsQuery,
    RefetchCourseReviewsQueryVariables
  >(RefetchCourseReviewsDocument, options);
}
export type RefetchCourseReviewsQueryHookResult = ReturnType<
  typeof useRefetchCourseReviewsQuery
>;
export type RefetchCourseReviewsLazyQueryHookResult = ReturnType<
  typeof useRefetchCourseReviewsLazyQuery
>;
export type RefetchCourseReviewsSuspenseQueryHookResult = ReturnType<
  typeof useRefetchCourseReviewsSuspenseQuery
>;
export type RefetchCourseReviewsQueryResult = Apollo.QueryResult<
  RefetchCourseReviewsQuery,
  RefetchCourseReviewsQueryVariables
>;
export const CourseReviewsDocument = gql`
  query courseReviews($id: Int) {
    review(
      where: {
        course_id: { _eq: $id }
        _or: [
          { course_comment: { _is_null: false } }
          { prof_comment: { _is_null: false } }
        ]
      }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
    }
  }
  ${ReviewInfoFragmentDoc}
  ${ReviewVoteCountsFragmentDoc}
`;

/**
 * __useCourseReviewsQuery__
 *
 * To run a query within a React component, call `useCourseReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseReviewsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCourseReviewsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CourseReviewsQuery,
    CourseReviewsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CourseReviewsQuery, CourseReviewsQueryVariables>(
    CourseReviewsDocument,
    options,
  );
}
export function useCourseReviewsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CourseReviewsQuery,
    CourseReviewsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CourseReviewsQuery, CourseReviewsQueryVariables>(
    CourseReviewsDocument,
    options,
  );
}
// @ts-ignore
export function useCourseReviewsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CourseReviewsQuery,
    CourseReviewsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  CourseReviewsQuery,
  CourseReviewsQueryVariables
>;
export function useCourseReviewsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseReviewsQuery,
        CourseReviewsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  CourseReviewsQuery | undefined,
  CourseReviewsQueryVariables
>;
export function useCourseReviewsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseReviewsQuery,
        CourseReviewsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CourseReviewsQuery,
    CourseReviewsQueryVariables
  >(CourseReviewsDocument, options);
}
export type CourseReviewsQueryHookResult = ReturnType<
  typeof useCourseReviewsQuery
>;
export type CourseReviewsLazyQueryHookResult = ReturnType<
  typeof useCourseReviewsLazyQuery
>;
export type CourseReviewsSuspenseQueryHookResult = ReturnType<
  typeof useCourseReviewsSuspenseQuery
>;
export type CourseReviewsQueryResult = Apollo.QueryResult<
  CourseReviewsQuery,
  CourseReviewsQueryVariables
>;
export const CourseReviewsWithUserDataDocument = gql`
  query courseReviewsWithUserData($id: Int) {
    review(
      where: {
        course_id: { _eq: $id }
        _or: [
          { course_comment: { _is_null: false } }
          { prof_comment: { _is_null: false } }
        ]
      }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
      ...UserReviewFields
    }
  }
  ${ReviewInfoFragmentDoc}
  ${ReviewVoteCountsFragmentDoc}
  ${UserReviewFieldsFragmentDoc}
`;

/**
 * __useCourseReviewsWithUserDataQuery__
 *
 * To run a query within a React component, call `useCourseReviewsWithUserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseReviewsWithUserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseReviewsWithUserDataQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCourseReviewsWithUserDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CourseReviewsWithUserDataQuery,
    CourseReviewsWithUserDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CourseReviewsWithUserDataQuery,
    CourseReviewsWithUserDataQueryVariables
  >(CourseReviewsWithUserDataDocument, options);
}
export function useCourseReviewsWithUserDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CourseReviewsWithUserDataQuery,
    CourseReviewsWithUserDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CourseReviewsWithUserDataQuery,
    CourseReviewsWithUserDataQueryVariables
  >(CourseReviewsWithUserDataDocument, options);
}
// @ts-ignore
export function useCourseReviewsWithUserDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CourseReviewsWithUserDataQuery,
    CourseReviewsWithUserDataQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  CourseReviewsWithUserDataQuery,
  CourseReviewsWithUserDataQueryVariables
>;
export function useCourseReviewsWithUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseReviewsWithUserDataQuery,
        CourseReviewsWithUserDataQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  CourseReviewsWithUserDataQuery | undefined,
  CourseReviewsWithUserDataQueryVariables
>;
export function useCourseReviewsWithUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseReviewsWithUserDataQuery,
        CourseReviewsWithUserDataQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CourseReviewsWithUserDataQuery,
    CourseReviewsWithUserDataQueryVariables
  >(CourseReviewsWithUserDataDocument, options);
}
export type CourseReviewsWithUserDataQueryHookResult = ReturnType<
  typeof useCourseReviewsWithUserDataQuery
>;
export type CourseReviewsWithUserDataLazyQueryHookResult = ReturnType<
  typeof useCourseReviewsWithUserDataLazyQuery
>;
export type CourseReviewsWithUserDataSuspenseQueryHookResult = ReturnType<
  typeof useCourseReviewsWithUserDataSuspenseQuery
>;
export type CourseReviewsWithUserDataQueryResult = Apollo.QueryResult<
  CourseReviewsWithUserDataQuery,
  CourseReviewsWithUserDataQueryVariables
>;
export const RefetchCourseReviewUpvoteDocument = gql`
  query refetchCourseReviewUpvote($review_id: Int) {
    review(where: { id: { _eq: $review_id } }) {
      ...ReviewVoteCounts
    }
  }
  ${ReviewVoteCountsFragmentDoc}
`;

/**
 * __useRefetchCourseReviewUpvoteQuery__
 *
 * To run a query within a React component, call `useRefetchCourseReviewUpvoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchCourseReviewUpvoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchCourseReviewUpvoteQuery({
 *   variables: {
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useRefetchCourseReviewUpvoteQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchCourseReviewUpvoteQuery,
    RefetchCourseReviewUpvoteQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RefetchCourseReviewUpvoteQuery,
    RefetchCourseReviewUpvoteQueryVariables
  >(RefetchCourseReviewUpvoteDocument, options);
}
export function useRefetchCourseReviewUpvoteLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchCourseReviewUpvoteQuery,
    RefetchCourseReviewUpvoteQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RefetchCourseReviewUpvoteQuery,
    RefetchCourseReviewUpvoteQueryVariables
  >(RefetchCourseReviewUpvoteDocument, options);
}
// @ts-ignore
export function useRefetchCourseReviewUpvoteSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchCourseReviewUpvoteQuery,
    RefetchCourseReviewUpvoteQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchCourseReviewUpvoteQuery,
  RefetchCourseReviewUpvoteQueryVariables
>;
export function useRefetchCourseReviewUpvoteSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchCourseReviewUpvoteQuery,
        RefetchCourseReviewUpvoteQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchCourseReviewUpvoteQuery | undefined,
  RefetchCourseReviewUpvoteQueryVariables
>;
export function useRefetchCourseReviewUpvoteSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchCourseReviewUpvoteQuery,
        RefetchCourseReviewUpvoteQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchCourseReviewUpvoteQuery,
    RefetchCourseReviewUpvoteQueryVariables
  >(RefetchCourseReviewUpvoteDocument, options);
}
export type RefetchCourseReviewUpvoteQueryHookResult = ReturnType<
  typeof useRefetchCourseReviewUpvoteQuery
>;
export type RefetchCourseReviewUpvoteLazyQueryHookResult = ReturnType<
  typeof useRefetchCourseReviewUpvoteLazyQuery
>;
export type RefetchCourseReviewUpvoteSuspenseQueryHookResult = ReturnType<
  typeof useRefetchCourseReviewUpvoteSuspenseQuery
>;
export type RefetchCourseReviewUpvoteQueryResult = Apollo.QueryResult<
  RefetchCourseReviewUpvoteQuery,
  RefetchCourseReviewUpvoteQueryVariables
>;
export const CourseReviewProfsDocument = gql`
  query courseReviewProfs($courseIds: [Int!]) {
    allProfs: prof(order_by: { name: asc }) {
      ...ProfInfo
    }
    reviewProfs: review(
      where: {
        course_id: { _in: $courseIds }
        prof_id: { _is_null: false }
        prof_comment: { _is_null: false }
      }
      order_by: [{ course_id: asc }, { prof_id: asc }, { id: desc }]
      distinct_on: [course_id, prof_id]
    ) {
      ...ReviewProfs
    }
  }
  ${ProfInfoFragmentDoc}
  ${ReviewProfsFragmentDoc}
`;

/**
 * __useCourseReviewProfsQuery__
 *
 * To run a query within a React component, call `useCourseReviewProfsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseReviewProfsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseReviewProfsQuery({
 *   variables: {
 *      courseIds: // value for 'courseIds'
 *   },
 * });
 */
export function useCourseReviewProfsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    CourseReviewProfsQuery,
    CourseReviewProfsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CourseReviewProfsQuery,
    CourseReviewProfsQueryVariables
  >(CourseReviewProfsDocument, options);
}
export function useCourseReviewProfsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CourseReviewProfsQuery,
    CourseReviewProfsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CourseReviewProfsQuery,
    CourseReviewProfsQueryVariables
  >(CourseReviewProfsDocument, options);
}
// @ts-ignore
export function useCourseReviewProfsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CourseReviewProfsQuery,
    CourseReviewProfsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  CourseReviewProfsQuery,
  CourseReviewProfsQueryVariables
>;
export function useCourseReviewProfsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseReviewProfsQuery,
        CourseReviewProfsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  CourseReviewProfsQuery | undefined,
  CourseReviewProfsQueryVariables
>;
export function useCourseReviewProfsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseReviewProfsQuery,
        CourseReviewProfsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CourseReviewProfsQuery,
    CourseReviewProfsQueryVariables
  >(CourseReviewProfsDocument, options);
}
export type CourseReviewProfsQueryHookResult = ReturnType<
  typeof useCourseReviewProfsQuery
>;
export type CourseReviewProfsLazyQueryHookResult = ReturnType<
  typeof useCourseReviewProfsLazyQuery
>;
export type CourseReviewProfsSuspenseQueryHookResult = ReturnType<
  typeof useCourseReviewProfsSuspenseQuery
>;
export type CourseReviewProfsQueryResult = Apollo.QueryResult<
  CourseReviewProfsQuery,
  CourseReviewProfsQueryVariables
>;
export const GetSectionsByClassNumbersDocument = gql`
  query getSectionsByClassNumbers($classNumbers: [Int!]!, $termId: Int!) {
    course_section(
      where: { class_number: { _in: $classNumbers }, term_id: { _eq: $termId } }
    ) {
      ...SwapCourseSection
    }
  }
  ${SwapCourseSectionFragmentDoc}
`;

/**
 * __useGetSectionsByClassNumbersQuery__
 *
 * To run a query within a React component, call `useGetSectionsByClassNumbersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSectionsByClassNumbersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSectionsByClassNumbersQuery({
 *   variables: {
 *      classNumbers: // value for 'classNumbers'
 *      termId: // value for 'termId'
 *   },
 * });
 */
export function useGetSectionsByClassNumbersQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSectionsByClassNumbersQuery,
    GetSectionsByClassNumbersQueryVariables
  > &
    (
      | { variables: GetSectionsByClassNumbersQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSectionsByClassNumbersQuery,
    GetSectionsByClassNumbersQueryVariables
  >(GetSectionsByClassNumbersDocument, options);
}
export function useGetSectionsByClassNumbersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSectionsByClassNumbersQuery,
    GetSectionsByClassNumbersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSectionsByClassNumbersQuery,
    GetSectionsByClassNumbersQueryVariables
  >(GetSectionsByClassNumbersDocument, options);
}
// @ts-ignore
export function useGetSectionsByClassNumbersSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSectionsByClassNumbersQuery,
    GetSectionsByClassNumbersQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetSectionsByClassNumbersQuery,
  GetSectionsByClassNumbersQueryVariables
>;
export function useGetSectionsByClassNumbersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSectionsByClassNumbersQuery,
        GetSectionsByClassNumbersQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetSectionsByClassNumbersQuery | undefined,
  GetSectionsByClassNumbersQueryVariables
>;
export function useGetSectionsByClassNumbersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSectionsByClassNumbersQuery,
        GetSectionsByClassNumbersQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSectionsByClassNumbersQuery,
    GetSectionsByClassNumbersQueryVariables
  >(GetSectionsByClassNumbersDocument, options);
}
export type GetSectionsByClassNumbersQueryHookResult = ReturnType<
  typeof useGetSectionsByClassNumbersQuery
>;
export type GetSectionsByClassNumbersLazyQueryHookResult = ReturnType<
  typeof useGetSectionsByClassNumbersLazyQuery
>;
export type GetSectionsByClassNumbersSuspenseQueryHookResult = ReturnType<
  typeof useGetSectionsByClassNumbersSuspenseQuery
>;
export type GetSectionsByClassNumbersQueryResult = Apollo.QueryResult<
  GetSectionsByClassNumbersQuery,
  GetSectionsByClassNumbersQueryVariables
>;
export const GetCourseForSwapDocument = gql`
  query getCourseForSwap($code: String!, $termId: Int!) {
    course_section(
      where: { course: { code: { _eq: $code } }, term_id: { _eq: $termId } }
      order_by: { section_name: asc }
    ) {
      ...SwapCourseSection
    }
  }
  ${SwapCourseSectionFragmentDoc}
`;

/**
 * __useGetCourseForSwapQuery__
 *
 * To run a query within a React component, call `useGetCourseForSwapQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCourseForSwapQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCourseForSwapQuery({
 *   variables: {
 *      code: // value for 'code'
 *      termId: // value for 'termId'
 *   },
 * });
 */
export function useGetCourseForSwapQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCourseForSwapQuery,
    GetCourseForSwapQueryVariables
  > &
    (
      | { variables: GetCourseForSwapQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCourseForSwapQuery, GetCourseForSwapQueryVariables>(
    GetCourseForSwapDocument,
    options,
  );
}
export function useGetCourseForSwapLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCourseForSwapQuery,
    GetCourseForSwapQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCourseForSwapQuery,
    GetCourseForSwapQueryVariables
  >(GetCourseForSwapDocument, options);
}
// @ts-ignore
export function useGetCourseForSwapSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCourseForSwapQuery,
    GetCourseForSwapQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetCourseForSwapQuery,
  GetCourseForSwapQueryVariables
>;
export function useGetCourseForSwapSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCourseForSwapQuery,
        GetCourseForSwapQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetCourseForSwapQuery | undefined,
  GetCourseForSwapQueryVariables
>;
export function useGetCourseForSwapSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCourseForSwapQuery,
        GetCourseForSwapQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCourseForSwapQuery,
    GetCourseForSwapQueryVariables
  >(GetCourseForSwapDocument, options);
}
export type GetCourseForSwapQueryHookResult = ReturnType<
  typeof useGetCourseForSwapQuery
>;
export type GetCourseForSwapLazyQueryHookResult = ReturnType<
  typeof useGetCourseForSwapLazyQuery
>;
export type GetCourseForSwapSuspenseQueryHookResult = ReturnType<
  typeof useGetCourseForSwapSuspenseQuery
>;
export type GetCourseForSwapQueryResult = Apollo.QueryResult<
  GetCourseForSwapQuery,
  GetCourseForSwapQueryVariables
>;
export const CourseDropdownByTermDocument = gql`
  query courseDropdownByTerm($termId: Int!) {
    course(
      where: { sections: { term_id: { _eq: $termId } } }
      order_by: { code: asc }
    ) {
      code
      name
    }
  }
`;

/**
 * __useCourseDropdownByTermQuery__
 *
 * To run a query within a React component, call `useCourseDropdownByTermQuery` and pass it any options that fit your needs.
 * When your component renders, `useCourseDropdownByTermQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCourseDropdownByTermQuery({
 *   variables: {
 *      termId: // value for 'termId'
 *   },
 * });
 */
export function useCourseDropdownByTermQuery(
  baseOptions: Apollo.QueryHookOptions<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  > &
    (
      | { variables: CourseDropdownByTermQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >(CourseDropdownByTermDocument, options);
}
export function useCourseDropdownByTermLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >(CourseDropdownByTermDocument, options);
}
// @ts-ignore
export function useCourseDropdownByTermSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  CourseDropdownByTermQuery,
  CourseDropdownByTermQueryVariables
>;
export function useCourseDropdownByTermSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseDropdownByTermQuery,
        CourseDropdownByTermQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  CourseDropdownByTermQuery | undefined,
  CourseDropdownByTermQueryVariables
>;
export function useCourseDropdownByTermSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        CourseDropdownByTermQuery,
        CourseDropdownByTermQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CourseDropdownByTermQuery,
    CourseDropdownByTermQueryVariables
  >(CourseDropdownByTermDocument, options);
}
export type CourseDropdownByTermQueryHookResult = ReturnType<
  typeof useCourseDropdownByTermQuery
>;
export type CourseDropdownByTermLazyQueryHookResult = ReturnType<
  typeof useCourseDropdownByTermLazyQuery
>;
export type CourseDropdownByTermSuspenseQueryHookResult = ReturnType<
  typeof useCourseDropdownByTermSuspenseQuery
>;
export type CourseDropdownByTermQueryResult = Apollo.QueryResult<
  CourseDropdownByTermQuery,
  CourseDropdownByTermQueryVariables
>;
export const ExploreAllDocument = gql`
  query exploreAll {
    course_search_index {
      ...CourseSearch
    }
    prof_search_index {
      ...ProfSearch
    }
  }
  ${CourseSearchFragmentDoc}
  ${ProfSearchFragmentDoc}
`;

/**
 * __useExploreAllQuery__
 *
 * To run a query within a React component, call `useExploreAllQuery` and pass it any options that fit your needs.
 * When your component renders, `useExploreAllQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExploreAllQuery({
 *   variables: {
 *   },
 * });
 */
export function useExploreAllQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ExploreAllQuery,
    ExploreAllQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ExploreAllQuery, ExploreAllQueryVariables>(
    ExploreAllDocument,
    options,
  );
}
export function useExploreAllLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ExploreAllQuery,
    ExploreAllQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ExploreAllQuery, ExploreAllQueryVariables>(
    ExploreAllDocument,
    options,
  );
}
// @ts-ignore
export function useExploreAllSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ExploreAllQuery,
    ExploreAllQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<ExploreAllQuery, ExploreAllQueryVariables>;
export function useExploreAllSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ExploreAllQuery,
        ExploreAllQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  ExploreAllQuery | undefined,
  ExploreAllQueryVariables
>;
export function useExploreAllSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ExploreAllQuery,
        ExploreAllQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ExploreAllQuery, ExploreAllQueryVariables>(
    ExploreAllDocument,
    options,
  );
}
export type ExploreAllQueryHookResult = ReturnType<typeof useExploreAllQuery>;
export type ExploreAllLazyQueryHookResult = ReturnType<
  typeof useExploreAllLazyQuery
>;
export type ExploreAllSuspenseQueryHookResult = ReturnType<
  typeof useExploreAllSuspenseQuery
>;
export type ExploreAllQueryResult = Apollo.QueryResult<
  ExploreAllQuery,
  ExploreAllQueryVariables
>;
export const ExploreDocument = gql`
  query explore($query: String, $code_only: Boolean) {
    search_courses(args: { query: $query, code_only: $code_only }) {
      ...CourseSearch
    }
    search_profs(args: { query: $query, code_only: $code_only }) {
      ...ProfSearch
    }
  }
  ${CourseSearchFragmentDoc}
  ${ProfSearchFragmentDoc}
`;

/**
 * __useExploreQuery__
 *
 * To run a query within a React component, call `useExploreQuery` and pass it any options that fit your needs.
 * When your component renders, `useExploreQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useExploreQuery({
 *   variables: {
 *      query: // value for 'query'
 *      code_only: // value for 'code_only'
 *   },
 * });
 */
export function useExploreQuery(
  baseOptions?: Apollo.QueryHookOptions<ExploreQuery, ExploreQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ExploreQuery, ExploreQueryVariables>(
    ExploreDocument,
    options,
  );
}
export function useExploreLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ExploreQuery,
    ExploreQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ExploreQuery, ExploreQueryVariables>(
    ExploreDocument,
    options,
  );
}
// @ts-ignore
export function useExploreSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ExploreQuery,
    ExploreQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<ExploreQuery, ExploreQueryVariables>;
export function useExploreSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<ExploreQuery, ExploreQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  ExploreQuery | undefined,
  ExploreQueryVariables
>;
export function useExploreSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<ExploreQuery, ExploreQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ExploreQuery, ExploreQueryVariables>(
    ExploreDocument,
    options,
  );
}
export type ExploreQueryHookResult = ReturnType<typeof useExploreQuery>;
export type ExploreLazyQueryHookResult = ReturnType<typeof useExploreLazyQuery>;
export type ExploreSuspenseQueryHookResult = ReturnType<
  typeof useExploreSuspenseQuery
>;
export type ExploreQueryResult = Apollo.QueryResult<
  ExploreQuery,
  ExploreQueryVariables
>;
export const GetProfDocument = gql`
  query getProf($code: String) {
    prof(where: { code: { _eq: $code } }) {
      ...ProfInfo
      ...ProfCoursesTaught
      ...ProfRating
      ...ProfReviewDistribution
    }
  }
  ${ProfInfoFragmentDoc}
  ${ProfCoursesTaughtFragmentDoc}
  ${ProfRatingFragmentDoc}
  ${ProfReviewDistributionFragmentDoc}
`;

/**
 * __useGetProfQuery__
 *
 * To run a query within a React component, call `useGetProfQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProfQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProfQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useGetProfQuery(
  baseOptions?: Apollo.QueryHookOptions<GetProfQuery, GetProfQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProfQuery, GetProfQueryVariables>(
    GetProfDocument,
    options,
  );
}
export function useGetProfLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProfQuery,
    GetProfQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProfQuery, GetProfQueryVariables>(
    GetProfDocument,
    options,
  );
}
// @ts-ignore
export function useGetProfSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetProfQuery,
    GetProfQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetProfQuery, GetProfQueryVariables>;
export function useGetProfSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetProfQuery, GetProfQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  GetProfQuery | undefined,
  GetProfQueryVariables
>;
export function useGetProfSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetProfQuery, GetProfQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetProfQuery, GetProfQueryVariables>(
    GetProfDocument,
    options,
  );
}
export type GetProfQueryHookResult = ReturnType<typeof useGetProfQuery>;
export type GetProfLazyQueryHookResult = ReturnType<typeof useGetProfLazyQuery>;
export type GetProfSuspenseQueryHookResult = ReturnType<
  typeof useGetProfSuspenseQuery
>;
export type GetProfQueryResult = Apollo.QueryResult<
  GetProfQuery,
  GetProfQueryVariables
>;
export const ProfReviewsDocument = gql`
  query profReviews($id: Int) {
    review(
      where: { prof_id: { _eq: $id }, prof_comment: { _is_null: false } }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
    }
  }
  ${ReviewInfoFragmentDoc}
  ${ReviewVoteCountsFragmentDoc}
`;

/**
 * __useProfReviewsQuery__
 *
 * To run a query within a React component, call `useProfReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfReviewsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProfReviewsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ProfReviewsQuery,
    ProfReviewsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ProfReviewsQuery, ProfReviewsQueryVariables>(
    ProfReviewsDocument,
    options,
  );
}
export function useProfReviewsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ProfReviewsQuery,
    ProfReviewsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ProfReviewsQuery, ProfReviewsQueryVariables>(
    ProfReviewsDocument,
    options,
  );
}
// @ts-ignore
export function useProfReviewsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ProfReviewsQuery,
    ProfReviewsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<ProfReviewsQuery, ProfReviewsQueryVariables>;
export function useProfReviewsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ProfReviewsQuery,
        ProfReviewsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  ProfReviewsQuery | undefined,
  ProfReviewsQueryVariables
>;
export function useProfReviewsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ProfReviewsQuery,
        ProfReviewsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ProfReviewsQuery, ProfReviewsQueryVariables>(
    ProfReviewsDocument,
    options,
  );
}
export type ProfReviewsQueryHookResult = ReturnType<typeof useProfReviewsQuery>;
export type ProfReviewsLazyQueryHookResult = ReturnType<
  typeof useProfReviewsLazyQuery
>;
export type ProfReviewsSuspenseQueryHookResult = ReturnType<
  typeof useProfReviewsSuspenseQuery
>;
export type ProfReviewsQueryResult = Apollo.QueryResult<
  ProfReviewsQuery,
  ProfReviewsQueryVariables
>;
export const ProfReviewsWithUserDataDocument = gql`
  query profReviewsWithUserData($id: Int) {
    review(
      where: { prof_id: { _eq: $id }, prof_comment: { _is_null: false } }
    ) {
      ...ReviewInfo
      ...ReviewVoteCounts
      ...UserReviewFields
    }
  }
  ${ReviewInfoFragmentDoc}
  ${ReviewVoteCountsFragmentDoc}
  ${UserReviewFieldsFragmentDoc}
`;

/**
 * __useProfReviewsWithUserDataQuery__
 *
 * To run a query within a React component, call `useProfReviewsWithUserDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useProfReviewsWithUserDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProfReviewsWithUserDataQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProfReviewsWithUserDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    ProfReviewsWithUserDataQuery,
    ProfReviewsWithUserDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    ProfReviewsWithUserDataQuery,
    ProfReviewsWithUserDataQueryVariables
  >(ProfReviewsWithUserDataDocument, options);
}
export function useProfReviewsWithUserDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ProfReviewsWithUserDataQuery,
    ProfReviewsWithUserDataQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    ProfReviewsWithUserDataQuery,
    ProfReviewsWithUserDataQueryVariables
  >(ProfReviewsWithUserDataDocument, options);
}
// @ts-ignore
export function useProfReviewsWithUserDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ProfReviewsWithUserDataQuery,
    ProfReviewsWithUserDataQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  ProfReviewsWithUserDataQuery,
  ProfReviewsWithUserDataQueryVariables
>;
export function useProfReviewsWithUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ProfReviewsWithUserDataQuery,
        ProfReviewsWithUserDataQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  ProfReviewsWithUserDataQuery | undefined,
  ProfReviewsWithUserDataQueryVariables
>;
export function useProfReviewsWithUserDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        ProfReviewsWithUserDataQuery,
        ProfReviewsWithUserDataQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    ProfReviewsWithUserDataQuery,
    ProfReviewsWithUserDataQueryVariables
  >(ProfReviewsWithUserDataDocument, options);
}
export type ProfReviewsWithUserDataQueryHookResult = ReturnType<
  typeof useProfReviewsWithUserDataQuery
>;
export type ProfReviewsWithUserDataLazyQueryHookResult = ReturnType<
  typeof useProfReviewsWithUserDataLazyQuery
>;
export type ProfReviewsWithUserDataSuspenseQueryHookResult = ReturnType<
  typeof useProfReviewsWithUserDataSuspenseQuery
>;
export type ProfReviewsWithUserDataQueryResult = Apollo.QueryResult<
  ProfReviewsWithUserDataQuery,
  ProfReviewsWithUserDataQueryVariables
>;
export const Refetch_Prof_Review_UpvoteDocument = gql`
  query REFETCH_PROF_REVIEW_UPVOTE($review_id: Int) {
    review(where: { id: { _eq: $review_id } }) {
      ...ReviewVoteCounts
    }
  }
  ${ReviewVoteCountsFragmentDoc}
`;

/**
 * __useRefetch_Prof_Review_UpvoteQuery__
 *
 * To run a query within a React component, call `useRefetch_Prof_Review_UpvoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetch_Prof_Review_UpvoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetch_Prof_Review_UpvoteQuery({
 *   variables: {
 *      review_id: // value for 'review_id'
 *   },
 * });
 */
export function useRefetch_Prof_Review_UpvoteQuery(
  baseOptions?: Apollo.QueryHookOptions<
    Refetch_Prof_Review_UpvoteQuery,
    Refetch_Prof_Review_UpvoteQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    Refetch_Prof_Review_UpvoteQuery,
    Refetch_Prof_Review_UpvoteQueryVariables
  >(Refetch_Prof_Review_UpvoteDocument, options);
}
export function useRefetch_Prof_Review_UpvoteLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    Refetch_Prof_Review_UpvoteQuery,
    Refetch_Prof_Review_UpvoteQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    Refetch_Prof_Review_UpvoteQuery,
    Refetch_Prof_Review_UpvoteQueryVariables
  >(Refetch_Prof_Review_UpvoteDocument, options);
}
// @ts-ignore
export function useRefetch_Prof_Review_UpvoteSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    Refetch_Prof_Review_UpvoteQuery,
    Refetch_Prof_Review_UpvoteQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  Refetch_Prof_Review_UpvoteQuery,
  Refetch_Prof_Review_UpvoteQueryVariables
>;
export function useRefetch_Prof_Review_UpvoteSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        Refetch_Prof_Review_UpvoteQuery,
        Refetch_Prof_Review_UpvoteQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  Refetch_Prof_Review_UpvoteQuery | undefined,
  Refetch_Prof_Review_UpvoteQueryVariables
>;
export function useRefetch_Prof_Review_UpvoteSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        Refetch_Prof_Review_UpvoteQuery,
        Refetch_Prof_Review_UpvoteQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    Refetch_Prof_Review_UpvoteQuery,
    Refetch_Prof_Review_UpvoteQueryVariables
  >(Refetch_Prof_Review_UpvoteDocument, options);
}
export type Refetch_Prof_Review_UpvoteQueryHookResult = ReturnType<
  typeof useRefetch_Prof_Review_UpvoteQuery
>;
export type Refetch_Prof_Review_UpvoteLazyQueryHookResult = ReturnType<
  typeof useRefetch_Prof_Review_UpvoteLazyQuery
>;
export type Refetch_Prof_Review_UpvoteSuspenseQueryHookResult = ReturnType<
  typeof useRefetch_Prof_Review_UpvoteSuspenseQuery
>;
export type Refetch_Prof_Review_UpvoteQueryResult = Apollo.QueryResult<
  Refetch_Prof_Review_UpvoteQuery,
  Refetch_Prof_Review_UpvoteQueryVariables
>;
export const GetScheduleSwapsDocument = gql`
  query getScheduleSwaps($userId: Int!, $termIds: [Int!]!) {
    user_schedule_swap(
      where: {
        user_id: { _eq: $userId }
        source_schedule: { section: { term_id: { _in: $termIds } } }
      }
    ) {
      user_id
      source_section_id
      replacement_section_id
      source_schedule {
        user_id
        section {
          id
          term_id
        }
      }
      replacement_section {
        ...SwapCourseSection
      }
    }
  }
  ${SwapCourseSectionFragmentDoc}
`;

/**
 * __useGetScheduleSwapsQuery__
 *
 * To run a query within a React component, call `useGetScheduleSwapsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScheduleSwapsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScheduleSwapsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      termIds: // value for 'termIds'
 *   },
 * });
 */
export function useGetScheduleSwapsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetScheduleSwapsQuery,
    GetScheduleSwapsQueryVariables
  > &
    (
      | { variables: GetScheduleSwapsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetScheduleSwapsQuery, GetScheduleSwapsQueryVariables>(
    GetScheduleSwapsDocument,
    options,
  );
}
export function useGetScheduleSwapsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetScheduleSwapsQuery,
    GetScheduleSwapsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetScheduleSwapsQuery,
    GetScheduleSwapsQueryVariables
  >(GetScheduleSwapsDocument, options);
}
// @ts-ignore
export function useGetScheduleSwapsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetScheduleSwapsQuery,
    GetScheduleSwapsQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  GetScheduleSwapsQuery,
  GetScheduleSwapsQueryVariables
>;
export function useGetScheduleSwapsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetScheduleSwapsQuery,
        GetScheduleSwapsQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  GetScheduleSwapsQuery | undefined,
  GetScheduleSwapsQueryVariables
>;
export function useGetScheduleSwapsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetScheduleSwapsQuery,
        GetScheduleSwapsQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetScheduleSwapsQuery,
    GetScheduleSwapsQueryVariables
  >(GetScheduleSwapsDocument, options);
}
export type GetScheduleSwapsQueryHookResult = ReturnType<
  typeof useGetScheduleSwapsQuery
>;
export type GetScheduleSwapsLazyQueryHookResult = ReturnType<
  typeof useGetScheduleSwapsLazyQuery
>;
export type GetScheduleSwapsSuspenseQueryHookResult = ReturnType<
  typeof useGetScheduleSwapsSuspenseQuery
>;
export type GetScheduleSwapsQueryResult = Apollo.QueryResult<
  GetScheduleSwapsQuery,
  GetScheduleSwapsQueryVariables
>;
export const GetUserDocument = gql`
  query getUser($id: Int) {
    user(where: { id: { _eq: $id } }) {
      ...UserInfo
      ...UserShortlist
      ...UserSchedule
    }
    user_course_taken(where: { user_id: { _eq: $id } }) {
      ...UserCoursesTaken
    }
    review(where: { user: { user_id: { _eq: $id } } }) {
      ...ReviewInfo
    }
  }
  ${UserInfoFragmentDoc}
  ${UserShortlistFragmentDoc}
  ${UserScheduleFragmentDoc}
  ${UserCoursesTakenFragmentDoc}
  ${ReviewInfoFragmentDoc}
`;

/**
 * __useGetUserQuery__
 *
 * To run a query within a React component, call `useGetUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetUserQuery(
  baseOptions?: Apollo.QueryHookOptions<GetUserQuery, GetUserQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export function useGetUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
// @ts-ignore
export function useGetUserSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserQuery,
    GetUserQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<GetUserQuery, GetUserQueryVariables>;
export function useGetUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>,
): Apollo.UseSuspenseQueryResult<
  GetUserQuery | undefined,
  GetUserQueryVariables
>;
export function useGetUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetUserQuery, GetUserQueryVariables>,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetUserQuery, GetUserQueryVariables>(
    GetUserDocument,
    options,
  );
}
export type GetUserQueryHookResult = ReturnType<typeof useGetUserQuery>;
export type GetUserLazyQueryHookResult = ReturnType<typeof useGetUserLazyQuery>;
export type GetUserSuspenseQueryHookResult = ReturnType<
  typeof useGetUserSuspenseQuery
>;
export type GetUserQueryResult = Apollo.QueryResult<
  GetUserQuery,
  GetUserQueryVariables
>;
export const RefetchUserShortlistDocument = gql`
  query refetchUserShortlist($id: Int) {
    user(where: { id: { _eq: $id } }) {
      id
      ...UserShortlist
    }
  }
  ${UserShortlistFragmentDoc}
`;

/**
 * __useRefetchUserShortlistQuery__
 *
 * To run a query within a React component, call `useRefetchUserShortlistQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchUserShortlistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchUserShortlistQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRefetchUserShortlistQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchUserShortlistQuery,
    RefetchUserShortlistQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RefetchUserShortlistQuery,
    RefetchUserShortlistQueryVariables
  >(RefetchUserShortlistDocument, options);
}
export function useRefetchUserShortlistLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchUserShortlistQuery,
    RefetchUserShortlistQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RefetchUserShortlistQuery,
    RefetchUserShortlistQueryVariables
  >(RefetchUserShortlistDocument, options);
}
// @ts-ignore
export function useRefetchUserShortlistSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchUserShortlistQuery,
    RefetchUserShortlistQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchUserShortlistQuery,
  RefetchUserShortlistQueryVariables
>;
export function useRefetchUserShortlistSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchUserShortlistQuery,
        RefetchUserShortlistQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchUserShortlistQuery | undefined,
  RefetchUserShortlistQueryVariables
>;
export function useRefetchUserShortlistSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchUserShortlistQuery,
        RefetchUserShortlistQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchUserShortlistQuery,
    RefetchUserShortlistQueryVariables
  >(RefetchUserShortlistDocument, options);
}
export type RefetchUserShortlistQueryHookResult = ReturnType<
  typeof useRefetchUserShortlistQuery
>;
export type RefetchUserShortlistLazyQueryHookResult = ReturnType<
  typeof useRefetchUserShortlistLazyQuery
>;
export type RefetchUserShortlistSuspenseQueryHookResult = ReturnType<
  typeof useRefetchUserShortlistSuspenseQuery
>;
export type RefetchUserShortlistQueryResult = Apollo.QueryResult<
  RefetchUserShortlistQuery,
  RefetchUserShortlistQueryVariables
>;
export const RefetchUserReviewDocument = gql`
  query refetchUserReview($id: Int) {
    review(where: { user: { user_id: { _eq: $id } } }) {
      ...ReviewInfo
    }
  }
  ${ReviewInfoFragmentDoc}
`;

/**
 * __useRefetchUserReviewQuery__
 *
 * To run a query within a React component, call `useRefetchUserReviewQuery` and pass it any options that fit your needs.
 * When your component renders, `useRefetchUserReviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRefetchUserReviewQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRefetchUserReviewQuery(
  baseOptions?: Apollo.QueryHookOptions<
    RefetchUserReviewQuery,
    RefetchUserReviewQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    RefetchUserReviewQuery,
    RefetchUserReviewQueryVariables
  >(RefetchUserReviewDocument, options);
}
export function useRefetchUserReviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    RefetchUserReviewQuery,
    RefetchUserReviewQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    RefetchUserReviewQuery,
    RefetchUserReviewQueryVariables
  >(RefetchUserReviewDocument, options);
}
// @ts-ignore
export function useRefetchUserReviewSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    RefetchUserReviewQuery,
    RefetchUserReviewQueryVariables
  >,
): Apollo.UseSuspenseQueryResult<
  RefetchUserReviewQuery,
  RefetchUserReviewQueryVariables
>;
export function useRefetchUserReviewSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchUserReviewQuery,
        RefetchUserReviewQueryVariables
      >,
): Apollo.UseSuspenseQueryResult<
  RefetchUserReviewQuery | undefined,
  RefetchUserReviewQueryVariables
>;
export function useRefetchUserReviewSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        RefetchUserReviewQuery,
        RefetchUserReviewQueryVariables
      >,
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    RefetchUserReviewQuery,
    RefetchUserReviewQueryVariables
  >(RefetchUserReviewDocument, options);
}
export type RefetchUserReviewQueryHookResult = ReturnType<
  typeof useRefetchUserReviewQuery
>;
export type RefetchUserReviewLazyQueryHookResult = ReturnType<
  typeof useRefetchUserReviewLazyQuery
>;
export type RefetchUserReviewSuspenseQueryHookResult = ReturnType<
  typeof useRefetchUserReviewSuspenseQuery
>;
export type RefetchUserReviewQueryResult = Apollo.QueryResult<
  RefetchUserReviewQuery,
  RefetchUserReviewQueryVariables
>;
