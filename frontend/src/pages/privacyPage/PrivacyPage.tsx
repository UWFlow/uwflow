import React from 'react';
import { Helmet } from 'react-helmet';

import { SEO_DESCRIPTIONS } from 'constants/Messages';

import {
  HeaderText,
  PageBody,
  PageBodyHeader,
  PageBodyParagraph,
  PageContentWrapper,
  PageHeader,
  PageWrapper,
} from './styles/PrivacyPage';

const PrivacyPage = () => (
  <PageWrapper>
    <Helmet>
      <title>Privacy Policy - UW Flow</title>
      <meta name="description" content={SEO_DESCRIPTIONS.privacy} />
      <meta property="og:title" content="Privacy Policy - UW Flow" />
      <meta property="og:description" content={SEO_DESCRIPTIONS.privacy} />
    </Helmet>
    <PageHeader>
      <HeaderText>Privacy Policy</HeaderText>
    </PageHeader>
    <PageContentWrapper>
      <PageBody>
        <PageBodyParagraph>
          At UW Flow, accessible from{' '}
          <a
            href="https://uwflow.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            uwflow.com
          </a>
          , one of our main priorities is the privacy of our visitors. This
          Privacy Policy document outlines information we collect and how we use
          it. If you have additional questions or require more information about
          our Privacy Policy, do not hesitate to contact us through email at{' '}
          <a href="mailto:info@uwflow.com">info@uwflow.com</a>.
        </PageBodyParagraph>
        <PageBodyHeader>Log Files</PageBodyHeader>
        <PageBodyParagraph>
          UW Flow follows a standard procedure of using log files. These files
          log visitors when they visit websites. All hosting companies do this
          as a part of hosting services&apos; analytics. The information
          collected by log files includes internet protocol (IP) addresses,
          browser type, internet service provider (ISP), date and time stamp,
          referring/exit pages, and possibly the number of clicks. These are not
          linked to any information that is personally identifiable. The purpose
          of the information is for analyzing trends, administering the site,
          tracking users&apos; movement on the website, and gathering
          demographic information. If you should choose to upload a schedule, we
          will store its associated information.
        </PageBodyParagraph>
        <PageBodyHeader>Transcripts</PageBodyHeader>
        <PageBodyParagraph>
          If you choose to upload a transcript, we store the courses you have
          taken and your program on your account. We never store your GPA or
          your marks on your account.
        </PageBodyParagraph>
        <PageBodyParagraph>
          When you upload, you can choose to share your marks anonymously to
          help us build course statistics. This is off unless you turn it on. If
          you do, we keep an anonymous record of each mark: only the course,
          term, and a range such as 80–89, which is randomly altered half of the
          time before it is saved. These records contain no name, student
          number, account, or time of upload, are mixed with records from other
          students before being saved, and cannot be connected to each other or
          to you. Because they cannot be traced back to you, they are not
          removed when you delete your account.
        </PageBodyParagraph>
        <PageBodyParagraph>
          If you have chosen to share and we cannot read your transcript, we
          send a redacted copy to our error monitoring service, Sentry, so we
          can fix the problem. It keeps only the layout, terms, course codes,
          program, and levels. Your grades, credits, GPA, averages, name,
          student number, standing, and awards are removed on our servers before
          it is sent, and it is not attached to your account.
        </PageBodyParagraph>
        <PageBodyHeader>Cookies and Web Beacons</PageBodyHeader>
        <PageBodyParagraph>
          Like any other website, UW Flow uses &apos;cookies&apos;. These
          cookies are used to store information including visitors&apos;
          preferences, and the pages on the website that the visitor accessed or
          visited. The data are used to optimize the users&apos; experience by
          customizing our web page content based on visitors&apos; browser type
          and/or other information.
        </PageBodyParagraph>
        <PageBodyHeader>Third Party Services</PageBodyHeader>
        <PageBodyParagraph>
          At UW Flow, we use a host of open source technologies and external
          libraries that process, but do not store your data. We also use third
          party authentication plugins and software from Google and Facebook.
        </PageBodyParagraph>
        <PageBodyHeader>Third Party Privacy Policies</PageBodyHeader>
        <PageBodyParagraph>
          UW Flow&apos;s Privacy Policy does not apply to other software. Thus,
          we are advising you to consult the respective Privacy Policies of
          these third parties for more detailed information. This may include
          their practices and instructions about how to opt-out of certain
          options. You may find a complete list of these Privacy Policies and
          their links here:{' '}
          <a
            href="https://facebook.com/about/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            facebook.com/about/privacy
          </a>
          ,{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            policies.google.com/privacy.
          </a>{' '}
          You can choose to disable cookies through your individual browser
          options. More detailed information regarding cookie management with
          specific web browsers can be found at the browser’s websites.
        </PageBodyParagraph>
        <PageBodyHeader>Information Regarding Children</PageBodyHeader>
        <PageBodyParagraph>
          UW Flow does not knowingly collect any Personal Identifiable
          Information from children under the age of 13. If you think that your
          child provided this kind of information on our website, we strongly
          encourage you to contact us immediately and we will do our best
          efforts to promptly remove such information from our records.
        </PageBodyParagraph>
        <PageBodyHeader>Data Deletion</PageBodyHeader>
        <PageBodyParagraph>
          Your account and associated data can be deleted from your profile
          page. For other inquiries, please email us at{' '}
          <a href="mailto:info@uwflow.com">info@uwflow.com</a>.
        </PageBodyParagraph>
        <PageBodyHeader>Online Privacy Policy Only</PageBodyHeader>
        <PageBodyParagraph>
          This Privacy Policy applies only to our online activities and is valid
          for visitors to our website with regards to the information that they
          shared and/or collect in UW Flow. This policy is not applicable to any
          information collected offline or via channels other than this website.
        </PageBodyParagraph>
        <PageBodyHeader>Consent</PageBodyHeader>
        <PageBodyParagraph>
          By using our website, you hereby consent to our Privacy Policy and
          agree to its Terms and Conditions.
        </PageBodyParagraph>
      </PageBody>
    </PageContentWrapper>
  </PageWrapper>
);

export default PrivacyPage;
