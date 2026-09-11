import React from 'react';
import { useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import { RootState } from 'data/reducers/RootReducer';

import {
  NavbarContent,
  NavbarPlaceholder,
  NavbarWrapper,
} from './styles/Navbar';
import FlowLogo from './FlowLogo';
import ProfileDropdown from './ProfileDropdown';
import SearchBar from './SearchBar';

const Navbar = () => {
  const width = useSelector((state: RootState) => state.browser.width);
  const theme = useTheme();

  return (
    <>
      <NavbarWrapper>
        <NavbarContent>
          {width >= theme.breakpoints.mobileLarge && <FlowLogo />}
          <SearchBar maximizeWidth />
          <ProfileDropdown />
        </NavbarContent>
      </NavbarWrapper>
      <NavbarPlaceholder />
    </>
  );
};

export default Navbar;
