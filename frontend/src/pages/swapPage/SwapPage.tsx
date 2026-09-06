import React, { useEffect } from 'react';
import { Lock } from 'react-feather';
import { Helmet } from 'react-helmet';
import { useSelector } from 'react-redux';
import { useQuery } from '@apollo/client';
import { GetUserQuery, GetUserQueryVariables } from 'generated/graphql';

import LoadingSpinner from 'components/display/LoadingSpinner';
import ScheduleUploadModalContent from 'components/upload/ScheduleUploadModalContent';
import { AUTH_MODAL, SWAP_TOUR_MODAL } from 'constants/Modal';
import { RootState } from 'data/reducers/RootReducer';
import { GET_USER } from 'graphql/queries/user/User';
import useModal from 'hooks/useModal';
import { cn } from 'lib/utils';

import DEMO_SCHEDULE from './demoSchedule';
import { getDisplayedTermPresence } from './displayedTerms';
import SwapCalendar from './SwapCalendar';

const SWAP_TOUR_DISMISSED_KEY = 'swap_tour_dismissed';

// PageWrapper mixin (min-height accounts for FOOTER_HEIGHT 70px +
// FOOTER_MARGIN_TOP 32px) on the app's light1 background. The fade-in lives on
// the SwapCalendar content (like the app's other pages wrap content in
// <FadeIn>), not here: a transform on this wrapper would re-anchor the always-
// mounted fixed login/upload overlay below.
const swapPageWrapperClasses =
  'relative flex min-h-[calc(100vh-102px)] w-screen flex-col bg-light1 pb-8';

const SwapPage = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const [openModal, closeModal] = useModal();

  const { loading, data, refetch } = useQuery<
    GetUserQuery,
    GetUserQueryVariables
  >(GET_USER, {
    variables: { id: Number(localStorage.getItem('user_id')) },
    skip: !isLoggedIn,
  });

  const user = isLoggedIn ? data?.user[0] : null;
  const schedule = isLoggedIn ? user?.schedule ?? [] : [];
  // The calendar only shows the current + next term, so prompt for a Quest
  // import whenever neither of those terms has classes — not merely when the
  // schedule is empty (e.g. a returning user whose schedule is all past terms).
  const { thisHasData, nextHasData } = getDisplayedTermPresence(schedule);
  const hasDisplayedTermClasses = thisHasData || nextHasData;
  // Logged-out visitors see a non-interactive sample schedule behind the
  // login lock card instead of an empty grid.
  const isDemo = !isLoggedIn && !hasDisplayedTermClasses;
  const displayedSchedule = isDemo ? DEMO_SCHEDULE : schedule;
  const scheduleSectionKey = displayedSchedule
    .map(({ section }) => section.id)
    .sort((a, b) => a - b)
    .join(',');
  const swapCalendarKey = `${
    isDemo ? 'demo' : user?.id ?? 'anonymous'
  }:${scheduleSectionKey}`;

  useEffect(() => {
    if (!hasDisplayedTermClasses) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [hasDisplayedTermClasses]);

  // First visit with a loaded schedule: walk through the 3-step tour once.
  // Any dismissal (Skip, X, backdrop, or Done) persists the flag.
  useEffect(() => {
    if (
      hasDisplayedTermClasses &&
      !localStorage.getItem(SWAP_TOUR_DISMISSED_KEY)
    ) {
      openModal(SWAP_TOUR_MODAL, {
        onRequestClose: () => {
          localStorage.setItem(SWAP_TOUR_DISMISSED_KEY, '1');
          closeModal(SWAP_TOUR_MODAL);
        },
      });
    }
  }, [hasDisplayedTermClasses, openModal, closeModal]);

  if (isLoggedIn && (loading || !data)) {
    return (
      <div className={swapPageWrapperClasses}>
        <Helmet>
          <title>Swap Class - UW Flow</title>
        </Helmet>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={swapPageWrapperClasses}>
      <Helmet>
        <title>Swap Class - UW Flow</title>
        {hasDisplayedTermClasses && (
          <meta
            name="description"
            content="Simulate UW course section swaps to check they're possible before making the change in Quest."
          />
        )}
      </Helmet>
      <SwapCalendar
        // Drop ephemeral selection/hover state when the user or their imported
        // base schedule changes. The backend foreign key removes any saved
        // swap whose source schedule row no longer exists.
        key={swapCalendarKey}
        schedule={displayedSchedule}
        demoMode={isDemo}
        userId={user?.id ?? null}
      />
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div
          className={cn(
            'fixed inset-0 z-10 box-border flex items-start justify-center overflow-y-auto bg-white/55 backdrop-blur [transition:opacity_0.4s_ease]',
            !hasDisplayedTermClasses
              ? 'pointer-events-auto opacity-100'
              : 'pointer-events-none opacity-0',
          )}
        >
          <div className="mt-[150px] flex justify-center">
            {isLoggedIn ? (
              <ScheduleUploadModalContent
                onAfterUploadSuccess={() =>
                  refetch({ id: Number(localStorage.getItem('user_id')) })
                }
                showSkipStepButton={false}
              />
            ) : (
              <div className="flex max-w-[400px] flex-col items-center gap-3 rounded bg-white px-12 py-10 text-center shadow-[0_8px_32px_rgba(23,43,77,0.16)]">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-light2 text-dark2">
                  <Lock size={24} />
                </div>
                <h2 className="mb-0 mt-1 text-xl font-bold text-dark1">
                  Upload your schedule to plan swaps
                </h2>
                <p className="m-0 text-sm leading-normal text-dark2">
                  Log in and paste your courses from Quest to simulate section
                  swaps and see which ones are possible. You make the actual
                  swap in Quest.
                </p>
                <button
                  className="mt-2 cursor-pointer rounded border-none bg-accent px-7 py-3 text-[15px] font-semibold text-dark1 transition-[filter] duration-100 ease-in hover:brightness-95"
                  onClick={() => openModal(AUTH_MODAL)}
                  type="button"
                >
                  Log in to continue
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
