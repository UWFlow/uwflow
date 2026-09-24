import React, { useState } from 'react';
import { Bell } from 'react-feather';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useMutation } from '@apollo/client';

import Tooltip from 'components/display/Tooltip';
import {
  SUBSCRIPTION_ERROR,
  SUBSCRIPTION_SUCCESS,
  SUBSCRIPTION_TOOLTIP,
} from 'constants/Messages';
import { AUTH_MODAL, NOTIFICATION_EMAIL_MODAL } from 'constants/Modal';
import { RootState } from 'data/reducers/RootReducer';
import {
  DELETE_SECTION_SUBSCRIPTION,
  INSERT_SECTION_SUBSCRIPTION,
} from 'graphql/mutations/SectionSubscription';
import { REFETCH_SECTION_SUBSCRIPTIONS } from 'graphql/queries/course/Course';
import useModal from 'hooks/useModal';

import { NotificationBellWrapper } from './styles/ScheduleNotificationBell';

type ScheduleNotificationBellProps = {
  sectionId: number;
  courseId: number;
  initialState?: boolean;
  userEmail?: string | null;
};

const ScheduleNotificationBell = ({
  sectionId,
  courseId,
  initialState = false,
  userEmail = null,
}: ScheduleNotificationBellProps) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const [openModal] = useModal();

  const userId = localStorage.getItem('user_id');

  const refetchQueries = [
    {
      query: REFETCH_SECTION_SUBSCRIPTIONS,
      variables: { course_id: courseId, user_id: userId },
    },
  ];

  const [selected, setSelected] = useState(initialState);
  const [insertSubscription] = useMutation(INSERT_SECTION_SUBSCRIPTION, {
    refetchQueries,
  });
  const [deleteSubscription] = useMutation(DELETE_SECTION_SUBSCRIPTION, {
    refetchQueries,
  });

  const notifyDelete = () => toast(SUBSCRIPTION_SUCCESS.unsubscribed);
  const notifyInsert = () => toast(SUBSCRIPTION_SUCCESS.subscribed);
  const emailModalProps = {
    onSuccess: () =>
      insertSubscription({
        variables: { user_id: userId, section_id: sectionId },
      })
        .then(() => {
          notifyInsert();
          setSelected(true);
        })
        .catch(() => {
          toast(SUBSCRIPTION_ERROR);
        }),
  };

  const toggleOnClick = () => {
    if (!isLoggedIn) {
      openModal(AUTH_MODAL);
      return;
    }

    if (!sectionId) {
      return;
    }

    if (selected) {
      deleteSubscription({ variables: { section_id: sectionId } })
        .then(() => notifyDelete())
        .catch(() => {
          toast(SUBSCRIPTION_ERROR);
        });
      setSelected(false);
    } else if (
      userEmail === '' ||
      userEmail === null ||
      userEmail === undefined
    ) {
      // Assume user data will be loaded by the time a notification bell is clicked
      // TODO: chain insertSubscription and setSelected to fire after user has entered email
      // dispatch(courseNotificationEmailModalOpen()); this is rekt rn we can't pass callbacks to the modal
      // TODO: Find way to pass callbacks to top level modal
      openModal(NOTIFICATION_EMAIL_MODAL, emailModalProps);
    } else {
      insertSubscription({
        variables: { user_id: userId, section_id: sectionId },
      })
        .then(() => {
          notifyInsert();
          setSelected(true);
        })
        .catch(() => {
          toast(SUBSCRIPTION_ERROR);
        });
    }
  };

  return (
    <Tooltip
      content={
        selected
          ? SUBSCRIPTION_TOOLTIP.unsubscribe
          : SUBSCRIPTION_TOOLTIP.subscribe
      }
    >
      <NotificationBellWrapper
        selected={selected}
        onClick={toggleOnClick}
        onMouseDown={(e) => e.preventDefault()}
      >
        <Bell size={16} strokeWidth={3} />
      </NotificationBellWrapper>
    </Tooltip>
  );
};

export default ScheduleNotificationBell;
