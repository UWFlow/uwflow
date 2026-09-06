import { BREAKPOINT_WIDTH, PAGE_CONTENT_WIDTH } from './PageConstants';

export default {
  /* Colours */
  primary: '#0052cc',
  primaryDark: '#0747a6',
  primaryExtraDark: '#042049',
  courses: '#ff8b00',
  professors: '#36b37e',
  accent: '#ffc400',
  accentDark: '#e8b300',

  dark1: '#172b4d',
  dark2: '#505f79',
  dark3: '#97a0af',

  light1: '#f4f5f7',
  light2: '#ebecf0',
  light3: '#dfe1e5',
  light4: '#c6c9c9',

  lecture: '#b3d4ff',
  lab: '#b3f3ff',
  tutorial: '#c0b6f2',

  white: '#ffffff',
  red: '#ff5630',
  darkRed: '#de350b',

  google: '#4285f4',
  facebook: '#3c5a99',

  transparent: 'rgba(0,0,0,0)',

  breakpoints: {
    zero: 0,
    mobileLarge: 600,
    tablet: BREAKPOINT_WIDTH,
    desktop: PAGE_CONTENT_WIDTH,
  },
};
