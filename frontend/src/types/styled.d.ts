import theme from 'constants/GlobalTheme';

declare module 'styled-components' {
  type ThemeInterface = typeof theme;
  interface DefaultTheme extends ThemeInterface {}
}
