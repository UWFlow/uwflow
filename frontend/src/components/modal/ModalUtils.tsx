import React, { ReactNode } from 'react';

import AuthModalContent, {
  AuthModalContentProps,
} from 'components/auth/AuthModalContent';
import ResetPasswordModalContent, {
  ResetPasswordModalContentProps,
} from 'components/auth/ResetPasswordModalContent';
import CourseReviewBox, {
  CourseReviewBoxProps,
} from 'components/common/CourseReviewBox';
import DeleteAccountModalContent, {
  DeleteAccountModalContentProps,
} from 'components/delete/DeleteAccountModalContent';
import EditEmailModalContent, {
  EditEmailModalContentProps,
} from 'components/email/EditEmailModalContent';
import NotificationEmailModalContent, {
  NotificationEmailModalContentProps,
} from 'components/email/NotificationEmailModalContent';
import SwapTourModalContent, {
  SwapTourModalContentProps,
} from 'components/tour/SwapTourModalContent';
import ScheduleUploadModalContent, {
  ScheduleUploadModalContentProps,
} from 'components/upload/ScheduleUploadModalContent';
import TranscriptUploadModalContent, {
  TranscriptUploadModalContentProps,
} from 'components/upload/TranscriptUploadModalContent';
import {
  AUTH_MODAL,
  COURSE_REVIEW_COURSE_MODAL,
  DELETE_ACCOUNT_MODAL,
  EDIT_EMAIL_MODAL,
  ModalName,
  NOTIFICATION_EMAIL_MODAL,
  RESET_PASSWORD_MODAL,
  SCHEDULE_UPLOAD_MODAL,
  SWAP_TOUR_MODAL,
  TRANSCRIPT_UPLOAD_MODAL,
} from 'constants/Modal';

/* Modal Render Functions */
const AuthModal = (props: AuthModalContentProps) => (
  <AuthModalContent {...props} />
);

const ScheduleUploadModal = (props: ScheduleUploadModalContentProps) => (
  <ScheduleUploadModalContent {...props} />
);

const TranscriptUploadModal = (props: TranscriptUploadModalContentProps) => (
  <TranscriptUploadModalContent {...props} />
);

const CourseReviewCourseModal = (props: CourseReviewBoxProps) => (
  <CourseReviewBox {...props} />
);

const NotificationEmailModal = (props: NotificationEmailModalContentProps) => (
  <NotificationEmailModalContent {...props} />
);

const EditEmailModal = (props: EditEmailModalContentProps) => (
  <EditEmailModalContent {...props} />
);

const ResetPasswordModal = (props: ResetPasswordModalContentProps) => (
  <ResetPasswordModalContent {...props} />
);

const DeleteAccountModal = (props: DeleteAccountModalContentProps) => (
  <DeleteAccountModalContent {...props} />
);

const SwapTourModal = (props: SwapTourModalContentProps) => (
  <SwapTourModalContent {...props} />
);

type NameModalMap = {
  [key in ModalName]: (props: any) => ReactNode;
};

export const modalNameToModal: NameModalMap = {
  [AUTH_MODAL]: AuthModal,
  [SCHEDULE_UPLOAD_MODAL]: ScheduleUploadModal,
  [TRANSCRIPT_UPLOAD_MODAL]: TranscriptUploadModal,
  [COURSE_REVIEW_COURSE_MODAL]: CourseReviewCourseModal,
  [NOTIFICATION_EMAIL_MODAL]: NotificationEmailModal,
  [EDIT_EMAIL_MODAL]: EditEmailModal,
  [RESET_PASSWORD_MODAL]: ResetPasswordModal,
  [DELETE_ACCOUNT_MODAL]: DeleteAccountModal,
  [SWAP_TOUR_MODAL]: SwapTourModal,
};
