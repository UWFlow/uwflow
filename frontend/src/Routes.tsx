import { Location } from 'history';
import { compile, pathToRegexp } from 'path-to-regexp';

/* Page Routes */
export const LANDING_PAGE_ROUTE = '/';
export const PROFILE_PAGE_ROUTE = '/profile';
export const SWAP_PAGE_ROUTE = '/swap';
export const COURSE_PAGE_ROUTE = '/course/:courseCode';
export const SHORT_PROF_PAGE_ROUTE = '/prof/:profCode';
export const PROF_PAGE_ROUTE = '/professor/:profCode';
export const EXPLORE_PAGE_ROUTE = '/explore';
export const ABOUT_PAGE_ROUTE = '/about';
export const PRIVACY_PAGE_ROUTE = '/privacy';
export const WELCOME_PAGE_ROUTE = '/welcome';
export const DESIGN_SYSTEM_PAGE_ROUTE = '/design-system';

/* Route Testers */
export const LANDING_PAGE_TESTER = pathToRegexp(LANDING_PAGE_ROUTE);
export const PROFILE_PAGE_TESTER = pathToRegexp(PROFILE_PAGE_ROUTE);
export const COURSE_PAGE_TESTER = pathToRegexp(COURSE_PAGE_ROUTE);
export const EXPLORE_PAGE_TESTER = pathToRegexp(EXPLORE_PAGE_ROUTE);
export const PROF_PAGE_TESTER = pathToRegexp(PROF_PAGE_ROUTE);
export const ABOUT_PAGE_TESTER = pathToRegexp(ABOUT_PAGE_ROUTE);
export const PRIVACY_PAGE_TESTER = pathToRegexp(PRIVACY_PAGE_ROUTE);
export const WELCOME_PAGE_TESTER = pathToRegexp(WELCOME_PAGE_ROUTE);
export const DESIGN_SYSTEM_PAGE_TESTER = pathToRegexp(DESIGN_SYSTEM_PAGE_ROUTE);

/* Page Testers */
export const isOnLandingPageRoute = (location: Location) =>
  LANDING_PAGE_TESTER.test(location.pathname);

export const isOnProfilePageRoute = (location: Location) =>
  PROFILE_PAGE_TESTER.test(location.pathname);

export const isOnCoursePageRoute = (location: Location) =>
  COURSE_PAGE_TESTER.test(location.pathname);

export const isOnProfPageRoute = (location: Location) =>
  PROF_PAGE_TESTER.test(location.pathname);

export const isOnExplorePageRoute = (location: Location) =>
  EXPLORE_PAGE_TESTER.test(location.pathname);

export const isOnAboutPageRoute = (location: Location) =>
  ABOUT_PAGE_TESTER.test(location.pathname);

export const isOnPrivacyPageRoute = (location: Location) =>
  PRIVACY_PAGE_TESTER.test(location.pathname);

export const isOnWelcomePageRoute = (location: Location) => {
  WELCOME_PAGE_TESTER.test(location.pathname);
};

/* Route Generators */
export const toCoursePageRoute = compile(COURSE_PAGE_ROUTE);
export const toProfPageRoute = compile(PROF_PAGE_ROUTE);

/* Route Getters */
export const getCoursePageRoute = (courseCode: string) =>
  toCoursePageRoute({ courseCode });
export const getProfPageRoute = (profCode: string) =>
  toProfPageRoute({ profCode });
