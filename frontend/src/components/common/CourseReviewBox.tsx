import React, { useCallback, useEffect, useState } from 'react';
import Collapsible from 'react-collapsible';
import { Trash2 } from 'react-feather';
import { toast } from 'react-toastify';
import { useMutation, useQuery } from '@apollo/client';
import {
  Course,
  CourseReviewProfsQuery,
  CourseReviewsWithUserDataQueryVariables,
  DeleteReviewMutation,
  DeleteReviewMutationVariables,
  RefetchCourseReviewsQueryVariables,
  RefetchRatingsQueryVariables,
  RefetchUserReviewQueryVariables,
  ReviewInfoFragment,
  ReviewProfsFragment,
  ReviewUpdateInfoFragment,
  UpsertReviewMutation,
  UpsertReviewMutationVariables,
} from 'generated/graphql';
import { DefaultTheme, useTheme } from 'styled-components';

import Button from 'components/input/Button';
import DiscreteSlider from 'components/input/DiscreteSlider';
import DropdownList from 'components/input/DropdownList';
import RadioButton from 'components/input/RadioButton';
import Modal from 'components/modal/Modal';
import { REVIEW_SUCCESS } from 'constants/Messages';
import {
  CLEAR_OPTIONS,
  EASY_OPTIONS,
  ENGAGING_OPTIONS,
  USEFUL_OPTIONS,
} from 'constants/Review';
import { DocumentNode } from 'graphql';
import { DELETE_REVIEW, UPSERT_REVIEW } from 'graphql/mutations/Review';
import {
  REFETCH_COURSE_REVIEWS,
  REFETCH_RATINGS,
} from 'graphql/queries/course/Course';
import {
  COURSE_REVIEW_PROFS,
  COURSE_REVIEWS_WITH_USER_DATA,
} from 'graphql/queries/course/CourseReview';
import { REFETCH_USER_REVIEW } from 'graphql/queries/user/User';
import { capture } from 'lib/analytics';
import { getUserId } from 'utils/Auth';
import { formatCourseCode } from 'utils/Misc';

import {
  CourseReviewBoxWrapper,
  DeleteConfirmButtons,
  DeleteIconWrapper,
  DeleteReviewModalWrapper,
  Footer,
  FooterQuestionWrapper,
  LightText,
  MetricQuestionText,
  MetricQuestionWrapper,
  QuestionText,
  QuestionWrapper,
  ReviewTextArea,
  SliderOptionText,
} from './styles/CourseReviewBox';

interface CourseReviewBoxContentProps extends CourseReviewBoxProps {
  teaching: Record<string, ReviewProfsFragment['prof'][] | undefined>;
  allProfs: CourseReviewProfsQuery['allProfs'] | undefined;
  cancelButton: boolean;
}
const CourseReviewBoxContent = ({
  courseReviews,
  teaching,
  allProfs,
  initialSelectedCourseIndex = 0,
  showCourseDropdown = false,
  cancelButton = true,
  onCancel = () => {},
}: CourseReviewBoxContentProps) => {
  const theme: DefaultTheme = useTheme();

  const [selectedCourseIndex, setSelectedCourseIndex] = useState<number>(
    initialSelectedCourseIndex,
  );

  useEffect(() => {
    setSelectedCourseIndex(initialSelectedCourseIndex);
  }, [initialSelectedCourseIndex]);

  interface ReviewDisplayData {
    id: number;
    liked: number;
    useful: number;
    usefulSelected: boolean;
    easy: number;
    easySelected: boolean;
    courseComment: string;
    selectedProf: number;
    clear: number;
    clearSelected: boolean;
    engaging: number;
    engagingSelected: boolean;
    profComment: string;
    selectedAnonymous: number;
    profsTeaching: ReviewProfsFragment['prof'][];
  }

  const buildDefaultReview = useCallback(
    (
      course: Course,
      userReview: ReviewInfoFragment | null,
    ): ReviewDisplayData => {
      let combinedProfs: ReviewProfsFragment['prof'][] = [];
      if (allProfs) {
        // We want to show profs from previous reviews first, then all other profs
        const reviewedProfessors = teaching[course.id];

        const ids = new Set(reviewedProfessors?.map((prof) => prof?.id));

        const remaining = allProfs?.filter((prof) => !ids.has(prof.id));

        combinedProfs = [...(teaching[course.id] || []), ...remaining];
      }

      return {
        id: course.id,
        liked: userReview
          ? userReview.liked !== null
            ? 1 - userReview.liked
            : -1
          : -1,
        useful: (userReview && userReview.course_useful) || 0,
        usefulSelected: userReview ? userReview.course_useful !== null : false,
        easy: (userReview && userReview.course_easy) || 0,
        easySelected: userReview ? userReview.course_easy !== null : false,
        courseComment: (userReview && userReview.course_comment) || '',
        selectedProf: combinedProfs?.findIndex(
          (prof) => prof && prof.id === userReview?.prof_id,
        ),
        clear: (userReview && userReview.prof_clear) || 0,
        clearSelected: userReview ? userReview.prof_clear !== null : false,
        engaging: (userReview && userReview.prof_engaging) || 0,
        engagingSelected: userReview
          ? userReview.prof_engaging !== null
          : false,
        profComment: (userReview && userReview.prof_comment) || '',
        selectedAnonymous: userReview && userReview.public ? 1 : 0,
        profsTeaching: combinedProfs || [],
      };
    },
    [allProfs, teaching],
  );

  const initialReviewStates: Record<string, ReviewDisplayData> = {};
  for (const course of courseReviews) {
    initialReviewStates[course.course.code] = buildDefaultReview(
      course.course,
      course.review,
    );
  }

  const [reviewStates, setReviewStates] =
    useState<Record<string, ReviewDisplayData>>(initialReviewStates);

  useEffect(() => {
    if (allProfs && teaching) {
      const newReviewStates: Record<string, ReviewDisplayData> = {};
      for (const course of courseReviews) {
        newReviewStates[course.course.code] = buildDefaultReview(
          course.course,
          course.review,
        );
      }
      setReviewStates(newReviewStates);
    }
  }, [allProfs, teaching, courseReviews, buildDefaultReview]);

  const [deleteReviewModalOpen, setDeleteReviewModalOpen] =
    useState<boolean>(false);
  const [reviewUpdating, setReviewUpdating] = useState<boolean>(false);
  const [reviewDeleting, setReviewDeleting] = useState<boolean>(false);

  // Course Specific Logic ---------

  const userId: number = getUserId();

  const { course, review } = courseReviews[selectedCourseIndex];

  const {
    liked,
    useful,
    usefulSelected,
    easy,
    easySelected,
    courseComment,
    selectedProf,
    clear,
    clearSelected,
    engaging,
    engagingSelected,
    profComment,
    selectedAnonymous,
    profsTeaching,
  }: ReviewDisplayData = reviewStates[course.code];

  /* Mutations */
  const refetchQueries: Array<{
    query: DocumentNode;
    variables:
      | RefetchRatingsQueryVariables
      | RefetchCourseReviewsQueryVariables
      | CourseReviewsWithUserDataQueryVariables
      | RefetchUserReviewQueryVariables;
  }> = [
    {
      query: REFETCH_RATINGS,
      variables: {
        course_id: course.id,
        prof_id: review && review.prof_id ? review.prof_id : -1,
      },
    },
    {
      query: REFETCH_COURSE_REVIEWS,
      variables: {
        code: course.code,
        user_id: userId,
      },
    },
    {
      query: COURSE_REVIEWS_WITH_USER_DATA,
      variables: {
        id: course.id,
      },
    },
    {
      query: REFETCH_USER_REVIEW,
      variables: {
        id: userId,
      },
    },
  ];

  const [upsertReview] = useMutation<
    UpsertReviewMutation,
    UpsertReviewMutationVariables
  >(UPSERT_REVIEW, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const [deleteReview] = useMutation<
    DeleteReviewMutation,
    DeleteReviewMutationVariables
  >(DELETE_REVIEW, {
    refetchQueries,
    awaitRefetchQueries: true,
  });

  const notifyDelete = () => toast(REVIEW_SUCCESS.deleted);
  const notifyInsert = () => toast(REVIEW_SUCCESS.posted);
  const notifyUpdate = () => toast(REVIEW_SUCCESS.updated);

  const profOptions: { label: string; id: number | null }[] = [
    ...profsTeaching.map((profObj: ReviewProfsFragment['prof']) => {
      if (!profObj) return { label: '', id: null };
      return {
        label: profObj.name,
        id: profObj.id,
      };
    }),
  ];

  const handlePost = () => {
    setReviewUpdating(true);

    const reviewData: UpsertReviewMutationVariables = {
      user_id: userId,
      course_id: course.id,
      prof_id: profOptions[selectedProf]?.id ?? null,
      liked: 1 - liked,
      public: selectedAnonymous !== 0,
      course_easy: easy,
      course_useful: useful,
      course_comment: courseComment !== '' ? courseComment : null,
      prof_clear: profOptions[selectedProf]?.id && clearSelected ? clear : null,
      prof_engaging:
        profOptions[selectedProf]?.id && engagingSelected ? engaging : null,
      prof_comment:
        profOptions[selectedProf]?.id && profComment !== ''
          ? profComment
          : null,
    };

    upsertReview({
      variables: reviewData,
      // Hand-built optimistic stand-in. Two casts cover impedance the generated
      // types can't express here: the spread `reviewData` are optional mutation
      // inputs being placed into a required result element (cast to the
      // fragment), and Apollo injects `__typename` at every query level at
      // runtime — required for cache writes — but codegen omits it from
      // operation types (cast the wrapper to the mutation type).
      optimisticResponse: {
        __typename: 'mutation_root',
        insert_review: {
          __typename: 'review_mutation_response',
          returning: [
            {
              __typename: 'review',
              id: review ? review.id : 0,
              ...reviewData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              public: Boolean(selectedAnonymous !== 0),
            } as ReviewUpdateInfoFragment,
          ],
        },
      } as UpsertReviewMutation,
    }).then(() => {
      if (review) {
        notifyUpdate();
      } else {
        notifyInsert();
      }
      onCancel();
      setReviewUpdating(false);
      // Fire on the side after the UI has settled — capture() defers itself, so
      // this never blocks the toast/close above.
      const aboutProf = reviewData.prof_id != null;
      capture('review_posted', {
        review_type: 'full',
        is_update: Boolean(review),
        about_prof: aboutProf,
        course_id: course.id,
        course_code: course.code,
        prof_id: reviewData.prof_id ?? null,
        liked: reviewData.liked,
        course_useful: reviewData.course_useful,
        course_easy: reviewData.course_easy,
        prof_clear: reviewData.prof_clear ?? null,
        prof_engaging: reviewData.prof_engaging ?? null,
        has_course_comment: Boolean(reviewData.course_comment),
        has_prof_comment: aboutProf && Boolean(reviewData.prof_comment),
        is_anonymous: !reviewData.public,
      });
    });
  };

  const handleDelete = () => {
    if (review) {
      setReviewDeleting(true);
      deleteReview({
        variables: { review_id: review ? review.id : null },
      }).then(() => {
        notifyDelete();
        setDeleteReviewModalOpen(false);
        onCancel();
        setReviewDeleting(false);
      });
    } else {
      setDeleteReviewModalOpen(false);
      onCancel();
    }
  };

  const setReviewValue = (
    key: keyof ReviewDisplayData,
    value: ReviewDisplayData[keyof ReviewDisplayData],
  ) => {
    setReviewStates({
      ...reviewStates,
      [course.code]: {
        ...reviewStates[course.code],
        [key]: value,
      },
    });
  };

  const setSliderValue = (
    key: keyof ReviewDisplayData,
    value: ReviewDisplayData[keyof ReviewDisplayData],
    selectedKey: keyof ReviewDisplayData,
  ) => {
    setReviewStates({
      ...reviewStates,
      [course.code]: {
        ...reviewStates[course.code],
        [key]: value,
        [selectedKey]: true,
      },
    });
  };

  return (
    <CourseReviewBoxWrapper>
      {(courseReviews.length > 1 || showCourseDropdown) && (
        <QuestionWrapper>
          <QuestionText>Review a course: </QuestionText>
          <DropdownList
            selectedIndex={selectedCourseIndex}
            placeholder="select a course"
            options={courseReviews.map((courseObj) =>
              formatCourseCode(courseObj.course.code),
            )}
            color={theme.courses}
            onChange={setSelectedCourseIndex}
            zIndex={6}
            searchable
          />
        </QuestionWrapper>
      )}

      <QuestionWrapper>
        <QuestionText>What do you think of this course?</QuestionText>
      </QuestionWrapper>
      <MetricQuestionWrapper>
        <MetricQuestionText>Useful?</MetricQuestionText>
        <DiscreteSlider
          numNodes={5}
          currentNode={useful}
          color={theme.courses}
          onSlideEnd={(value: readonly number[]) =>
            setSliderValue('useful', value[0], 'usefulSelected')
          }
          selected={usefulSelected}
          setSelected={(value: boolean) =>
            setReviewValue('usefulSelected', value)
          }
        />
        <SliderOptionText>
          {usefulSelected ? USEFUL_OPTIONS[useful] : ''}
        </SliderOptionText>
      </MetricQuestionWrapper>

      <MetricQuestionWrapper>
        <MetricQuestionText>Easy?</MetricQuestionText>
        <DiscreteSlider
          numNodes={5}
          currentNode={easy}
          color={theme.courses}
          onSlideEnd={(value: readonly number[]) =>
            setSliderValue('easy', value[0], 'easySelected')
          }
          selected={easySelected}
          setSelected={(value) => setReviewValue('easySelected', value)}
        />
        <SliderOptionText>
          {easySelected ? EASY_OPTIONS[easy] : ''}
        </SliderOptionText>
      </MetricQuestionWrapper>

      <MetricQuestionWrapper>
        <MetricQuestionText width={112 - 16}>Like it?</MetricQuestionText>
        <RadioButton
          selected={liked}
          options={['Yes', 'No']}
          color={theme.courses}
          onClick={(value) => setReviewValue('liked', value)}
        />
      </MetricQuestionWrapper>

      <ReviewTextArea
        rows={5}
        value={courseComment}
        maxLength={8192}
        onChange={(event) =>
          setReviewValue('courseComment', event.target.value)
        }
        placeholder="Add any comments or tips..."
      />

      <QuestionWrapper>
        <QuestionText>Rate your professor: </QuestionText>
        <DropdownList
          selectedIndex={selectedProf}
          placeholder="select your professor"
          options={profOptions.map((p) => p.label)}
          color={theme.professors}
          onChange={(value) => setReviewValue('selectedProf', value)}
          zIndex={5}
          maxItems={4}
          width={230}
          searchable
        />
      </QuestionWrapper>

      <Collapsible
        open={selectedProf !== -1}
        transitionTime={200}
        easing="ease-in-out"
        overflowWhenOpen="visible"
        trigger=""
        triggerDisabled={true}
      >
        <MetricQuestionWrapper>
          <MetricQuestionText>Clear?</MetricQuestionText>
          <DiscreteSlider
            numNodes={5}
            currentNode={clear}
            color={theme.professors}
            onSlideEnd={(value: readonly number[]) =>
              setSliderValue('clear', value[0], 'clearSelected')
            }
            selected={clearSelected}
            setSelected={(value: boolean) =>
              setReviewValue('clearSelected', value)
            }
            disabled={profOptions[selectedProf]?.id === null}
          />
          <SliderOptionText>
            {clearSelected && profOptions[selectedProf]?.id !== null
              ? CLEAR_OPTIONS[clear]
              : ''}
          </SliderOptionText>
        </MetricQuestionWrapper>

        <MetricQuestionWrapper>
          <MetricQuestionText>Engaging?</MetricQuestionText>
          <DiscreteSlider
            numNodes={5}
            currentNode={engaging}
            color={theme.professors}
            onSlideEnd={(value: readonly number[]) =>
              setSliderValue('engaging', value[0], 'engagingSelected')
            }
            selected={engagingSelected}
            setSelected={(value: boolean) =>
              setReviewValue('engagingSelected', value)
            }
            disabled={profOptions[selectedProf]?.id === null}
          />
          <SliderOptionText>
            {engagingSelected && profOptions[selectedProf]?.id !== null
              ? ENGAGING_OPTIONS[engaging]
              : ''}
          </SliderOptionText>
        </MetricQuestionWrapper>

        <ReviewTextArea
          rows={5}
          value={profComment}
          maxLength={8192}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
            setReviewValue('profComment', event.target.value)
          }
          placeholder="Add any comments or tips..."
          disabled={profOptions[selectedProf]?.id === null}
        />
      </Collapsible>
      <Footer>
        <DeleteIconWrapper
          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
            e.preventDefault()
          }
        >
          <Trash2
            onClick={() => setDeleteReviewModalOpen(true)}
            color={theme.red}
          />
        </DeleteIconWrapper>
        <FooterQuestionWrapper>
          <QuestionText>Post: </QuestionText>
          <DropdownList
            selectedIndex={selectedAnonymous}
            options={['anonymously', 'as yourself']}
            color={theme.primary}
            onChange={(value: number) =>
              setReviewValue('selectedAnonymous', value)
            }
            margin="auto 16px auto auto"
            zIndex={2}
            width={140}
          />
          {cancelButton && (
            <Button
              color={theme.dark3}
              handleClick={onCancel}
              margin="auto 16px auto auto"
            >
              <LightText>Cancel</LightText>
            </Button>
          )}
          <Button
            type="submit"
            handleClick={handlePost}
            loading={reviewUpdating}
            disabled={!usefulSelected || !easySelected || liked === -1}
          >
            Post
          </Button>
        </FooterQuestionWrapper>
      </Footer>

      <Modal
        isOpen={deleteReviewModalOpen}
        onRequestClose={() => setDeleteReviewModalOpen(false)}
      >
        <DeleteReviewModalWrapper>
          Are you sure you want to delete this review?
          <DeleteConfirmButtons>
            <Button
              color={theme.dark3}
              margin="auto 16px auto 0"
              width="120px"
              handleClick={() => setDeleteReviewModalOpen(false)}
            >
              <LightText>Cancel</LightText>
            </Button>
            <Button
              color={theme.red}
              loading={reviewDeleting}
              width="120px"
              handleClick={handleDelete}
            >
              <LightText>Delete</LightText>
            </Button>
          </DeleteConfirmButtons>
        </DeleteReviewModalWrapper>
      </Modal>
    </CourseReviewBoxWrapper>
  );
};

export interface CourseReviewBoxProps {
  courseReviews: { course: Course; review: ReviewInfoFragment }[];
  showCourseDropdown: boolean;
  initialSelectedCourseIndex: number;
  onCancel: () => void;
  cancelButton: boolean;
}
const CourseReviewBox = ({
  courseReviews,
  showCourseDropdown,
  initialSelectedCourseIndex,
  onCancel,
  cancelButton,
}: CourseReviewBoxProps) => {
  const courseIds: number[] = courseReviews.map((c) => c.course.id);

  // Fetch all professors ordered by name
  // Fetch previous professors mentioned in reviews
  const { data } = useQuery<CourseReviewProfsQuery>(COURSE_REVIEW_PROFS, {
    variables: {
      courseIds,
    },
  });

  const allProfs = data?.allProfs;
  // Apollo Client v3 returns frozen (immutable) query results, so copy the
  // array before sorting — Array.prototype.sort() mutates in place and would
  // otherwise throw "Cannot assign to read only property '0'".
  const reviewProfs = data?.reviewProfs
    ? [...data.reviewProfs].sort((a, b) => b.id - a.id)
    : undefined;

  // eg: teaching = ['CS135': [{id: 1, code: 'john_doe', name: 'John Doe'}], 'CS136': []]
  const teaching: Record<string, ReviewProfsFragment['prof'][]> = {};

  for (const review of reviewProfs || []) {
    const courseCode = review.course_id as number;
    if (!teaching[courseCode]) {
      teaching[courseCode] = [];
    }
    teaching[courseCode].push(review.prof);
  }

  return (
    <CourseReviewBoxContent
      courseReviews={courseReviews}
      teaching={teaching}
      allProfs={allProfs}
      showCourseDropdown={showCourseDropdown}
      onCancel={onCancel}
      initialSelectedCourseIndex={initialSelectedCourseIndex}
      cancelButton={cancelButton}
    />
  );
};

export default CourseReviewBox;
