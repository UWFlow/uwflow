import React from 'react';
import { Helmet } from 'react-helmet';

import {
  Badges,
  Buttons,
  Cards,
  CircularProgresses,
  DataUploads,
  Disclosure,
  Feedback,
  FilterChips,
  Inputs,
  Links,
  Overlays,
  Radios,
  Selects,
  Sliders,
  Tables,
  Textareas,
  ThumbToggles,
} from './Components';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from './Foundations';

const DesignSystemPage = () => (
  <>
    <Helmet>
      <title>Design System · UW Flow</title>
    </Helmet>
    <main className="min-h-screen bg-light1 px-md py-lg font-inter tablet:px-page">
      <div className="mx-auto grid max-w-screen-xl gap-[48px]">
        <h1 className="m-0 mb-sm font-anderson text-4xl font-extrabold text-dark1">
          Design System
        </h1>
        <Colors />
        <Typography />
        <Spacing />
        <BorderRadius />
        <Shadows />
        <Buttons />
        <Links />
        <Inputs />
        <Textareas />
        <DataUploads />
        <Radios />
        <Selects />
        <Sliders />
        <FilterChips />
        <ThumbToggles />
        <Badges />
        <CircularProgresses />
        <Cards />
        <Feedback />
        <Disclosure />
        <Overlays />
        <Tables />
      </div>
    </main>
  </>
);

export default DesignSystemPage;
