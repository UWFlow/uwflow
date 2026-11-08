import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MemoryRouter, Route, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';

import ProfPage from './ProfPage';

jest.mock('@apollo/client', () => ({
  ...(jest.requireActual('@apollo/client') as object),
  useQuery: jest.fn(),
}));
jest.mock('pages/profPage/ProfInfoHeader', () => () => <div>prof header</div>);
jest.mock('pages/profPage/ProfReviews', () => () => <div>prof reviews</div>);

const mockUseQuery = useQuery as jest.Mock;

const prof = {
  id: 3837,
  name: 'Josh Neufeld',
  code: 'josh_neufeld',
  prof_clear_buckets: [],
  prof_engaging_buckets: [],
};

const LocationProbe = () => <output>{useLocation().pathname}</output>;

describe('ProfPage', () => {
  let container: HTMLDivElement;
  let root: Root;

  const renderAt = (path: string) =>
    act(() => {
      root.render(
        <MemoryRouter initialEntries={[path]}>
          <Route path="/professor/:profCode" component={ProfPage} />
          <LocationProbe />
        </MemoryRouter>,
      );
    });

  beforeAll(() => {
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    container = document.createElement('div');
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  it('shows the kept prof at a merged code without changing the URL', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      data: {
        prof: [],
        prof_alias: [{ prof: { ...prof, id: 8358, name: 'Josh D. Neufeld' } }],
      },
    });

    renderAt('/professor/josh_neufeld');

    expect(container.querySelector('output')?.textContent).toBe(
      '/professor/josh_neufeld',
    );
    expect(container.textContent).toContain('prof header');
    expect(container.textContent).not.toContain('not found');
  });

  it('shows a prof at its own code', () => {
    mockUseQuery.mockReturnValue({
      loading: false,
      data: { prof: [prof], prof_alias: [] },
    });

    renderAt('/professor/josh_neufeld');

    expect(container.querySelector('output')?.textContent).toBe(
      '/professor/josh_neufeld',
    );
    expect(container.textContent).toContain('prof header');
  });
});
