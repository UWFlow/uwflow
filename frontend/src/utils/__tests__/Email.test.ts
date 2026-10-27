import { isSignupEmailAllowed } from 'utils/Email';

describe('isSignupEmailAllowed', () => {
  it.each([
    ['j2smith@uwaterloo.ca', true],
    ['  J2Smith@UWaterloo.CA ', true],
    ['someone@gmail.com', false],
    ['someone@uwaterloo.ca.evil.com', false],
    ['someone@notuwaterloo.ca', false],
    ['', false],
  ])('%s -> %s', (email, allowed) => {
    expect(isSignupEmailAllowed(email)).toBe(allowed);
  });
});
