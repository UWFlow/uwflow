import React, { useEffect } from 'react';
import ReactGA from 'react-ga';
import { Helmet } from 'react-helmet';
import Modal from 'react-modal';
import { useSelector } from 'react-redux';
import { Redirect, Switch, useLocation } from 'react-router-dom';
import { Bounce, ToastContainer } from 'react-toastify';
import {
  LoadableAboutPage,
  LoadableCoursePage,
  LoadableDesignSystemPage,
  LoadableExplorePage,
  LoadableLandingPage,
  LoadableNotFoundPage,
  LoadablePrivacyPage,
  LoadableProfilePage,
  LoadableProfPage,
  LoadableSwapPage,
  LoadableWelcomePage,
} from 'LoadableComponents';
import {
  ABOUT_PAGE_ROUTE,
  COURSE_PAGE_ROUTE,
  DESIGN_SYSTEM_PAGE_ROUTE,
  EXPLORE_PAGE_ROUTE,
  LANDING_PAGE_ROUTE,
  PRIVACY_PAGE_ROUTE,
  PROF_PAGE_ROUTE,
  PROFILE_PAGE_ROUTE,
  SHORT_PROF_PAGE_ROUTE,
  SWAP_PAGE_ROUTE,
  WELCOME_PAGE_ROUTE,
} from 'Routes';

import AnnouncementBanner from 'components/banner/AnnouncementBanner';
import ModalMount from 'components/modal/ModalMount';
import Footer from 'components/navigation/Footer';
import Navbar from 'components/navigation/Navbar';
import {
  AUTH_REFRESH_ENDPOINT,
  BACKEND_ENDPOINT,
  GOOGLE_ANALYTICS_ID,
} from 'constants/Api';
import { SEO_DESCRIPTIONS } from 'constants/Messages';
import { RootState } from 'data/reducers/RootReducer';
import LandingPageBg from 'img/landing.svg';
import { initAnalytics } from 'lib/analytics';
import { AuthRefreshResponse } from 'types/Api';
import { makeAuthenticatedPOSTRequest } from 'utils/Api';
import { getUserId } from 'utils/Auth';

import { SentryRoute } from './sentry';

import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');
ReactGA.initialize(GOOGLE_ANALYTICS_ID);
initAnalytics();

const App = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const location = useLocation();
  const isDesignSystemPage = location.pathname === DESIGN_SYSTEM_PAGE_ROUTE;

  // Refresh auth token if logged in
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    const refreshAuth = async () => {
      const [response, status] = await makeAuthenticatedPOSTRequest<
        object,
        AuthRefreshResponse
      >(`${BACKEND_ENDPOINT}${AUTH_REFRESH_ENDPOINT}`, {});

      if (status >= 400) {
        return;
      }

      localStorage.setItem('token', response.token);
    };

    refreshAuth();
  }, [isLoggedIn]);

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, [location]);

  useEffect(() => {
    ReactGA.set({ userId: getUserId() });
  }, [isLoggedIn]);

  return (
    <>
      <ToastContainer
        position="bottom-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        transition={Bounce}
      />
      {!isDesignSystemPage && (
        <Switch>
          <SentryRoute
            exact
            path={LANDING_PAGE_ROUTE}
            component={() => <div />}
          />
          <SentryRoute path="*" component={() => <Navbar />} />
        </Switch>
      )}
      <Helmet>
        <title>UW Flow</title>
        <meta name="description" content={SEO_DESCRIPTIONS.default} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="UW Flow" />
        <meta property="og:description" content={SEO_DESCRIPTIONS.default} />
        <meta
          property="og:url"
          content={`${window.location.origin}${location.pathname}`}
        />
        <meta
          property="og:image"
          content={`${window.location.origin}${LandingPageBg}`}
        />
      </Helmet>
      {!isDesignSystemPage && <AnnouncementBanner />}
      <Switch>
        <SentryRoute
          exact
          path={LANDING_PAGE_ROUTE}
          component={() => <LoadableLandingPage />}
        />
        <SentryRoute
          exact
          path={PROFILE_PAGE_ROUTE}
          component={() => <LoadableProfilePage />}
        />
        <SentryRoute
          exact
          path={COURSE_PAGE_ROUTE}
          component={() => <LoadableCoursePage />}
        />
        <Redirect from={SHORT_PROF_PAGE_ROUTE} to={PROF_PAGE_ROUTE} />
        <SentryRoute
          exact
          path={PROF_PAGE_ROUTE}
          component={() => <LoadableProfPage />}
        />
        <SentryRoute
          path={EXPLORE_PAGE_ROUTE}
          component={() => <LoadableExplorePage />}
        />
        <SentryRoute
          exact
          path={ABOUT_PAGE_ROUTE}
          component={() => <LoadableAboutPage />}
        />
        <SentryRoute
          exact
          path={PRIVACY_PAGE_ROUTE}
          component={() => <LoadablePrivacyPage />}
        />
        <SentryRoute
          exact
          path={WELCOME_PAGE_ROUTE}
          component={() => <LoadableWelcomePage />}
        />
        <SentryRoute
          exact
          path={SWAP_PAGE_ROUTE}
          component={() => <LoadableSwapPage />}
        />
        <SentryRoute
          exact
          path={DESIGN_SYSTEM_PAGE_ROUTE}
          component={() => <LoadableDesignSystemPage />}
        />
        <SentryRoute path="*" component={() => <LoadableNotFoundPage />} />
      </Switch>
      {!isDesignSystemPage && <Footer />}
      {!isDesignSystemPage && <ModalMount />}
    </>
  );
};

export default App;
