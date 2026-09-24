import React from 'react';
import FadeIn from 'react-fade-in';
import { GitHub } from 'react-feather';
import { Link, useLocation } from 'react-router-dom';
import {
  ABOUT_PAGE_ROUTE,
  isOnLandingPageRoute,
  LANDING_PAGE_ROUTE,
  PRIVACY_PAGE_ROUTE,
} from 'Routes';

// Shared footer link styling (replaces the old Body + Hover styled mixins).
const linkClasses =
  'text-body text-light2 no-underline whitespace-nowrap ' +
  'cursor-pointer transition-all duration-hover ease-hover ' +
  'hover:brightness-hover focus:brightness-hover';

// margin: 16px 16px 0 0 on the smallest screens, matching the old layout.
const rightLinkClasses = `${linkClasses} ml-xl mobileDown:mt-md mobileDown:mr-md mobileDown:ml-0`;

const Footer = () => {
  const location = useLocation();
  const onLanding = isOnLandingPageRoute(location);

  return (
    <FadeIn delay={1000} className="relative z-0 w-screen [&>div]:flex">
      <div
        className={`flex w-full items-center bg-primaryExtraDark h-fit min-h-[70px] ${
          onLanding ? 'mt-0' : 'mt-xl'
        }`}
      >
        <div className="flex w-full justify-between mx-auto px-xl tabletDown:p-md mobileDown:flex-col">
          <div className="flex items-center">
            <Link to={LANDING_PAGE_ROUTE} className={`${linkClasses} mr-xl`}>
              Home
            </Link>
            <Link to={ABOUT_PAGE_ROUTE} className={`${linkClasses} mr-xl`}>
              About
            </Link>
            <Link to={PRIVACY_PAGE_ROUTE} className={`${linkClasses} mr-xl`}>
              Privacy Policy
            </Link>
          </div>
          <div className="flex items-center">
            <a
              href="https://github.com/UWFlow/uwflow/releases/tag/v1.0.0"
              target="_blank"
              rel="noopener noreferrer"
              className={`${rightLinkClasses} inline-flex items-center gap-sm`}
            >
              <GitHub size={16} />
              We&apos;re open source!
            </a>
            <a
              href="https://www.fb.com/planyourflow"
              target="_blank"
              rel="noopener noreferrer"
              className={rightLinkClasses}
            >
              Facebook
            </a>
            <a
              href="mailto:info@uwflow.com"
              target="_blank"
              rel="noopener noreferrer"
              className={rightLinkClasses}
            >
              Email
            </a>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default Footer;
