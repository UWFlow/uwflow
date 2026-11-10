import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

import { makeAuthenticatedPOSTRequest } from 'utils/Api';

import MissingProfForm from './MissingProfForm';

jest.mock('utils/Api', () => ({
  makeAuthenticatedPOSTRequest: jest.fn(),
}));

const post = makeAuthenticatedPOSTRequest as jest.Mock;

describe('MissingProfForm', () => {
  let container: HTMLDivElement;
  let root: Root;

  const button = (text: string) =>
    Array.from(container.querySelectorAll('button')).find(
      (el) => el.textContent === text,
    ) as HTMLButtonElement;

  const open = () => {
    act(() => {
      button('Can’t find your professor?').click();
    });
  };

  const type = (value: string) => {
    const input = container.querySelector('input') as HTMLInputElement;
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set;
    act(() => {
      setValue?.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  };

  const submit = async () => {
    await act(async () => {
      button('Submit').click();
    });
  };

  beforeEach(() => {
    post.mockReset();
    (global as any).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root.render(<MissingProfForm courseId={42} />));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('submits the name with the course and confirms', async () => {
    post.mockResolvedValue([{}, 204]);
    open();
    type('Jane Doe');
    await submit();

    expect(post.mock.calls[0][0]).toContain('/prof/submit');
    expect(post.mock.calls[0][1]).toEqual({ name: 'Jane Doe', course_id: 42 });
    expect(container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('shows the server’s reason when a submission is rejected', async () => {
    post.mockResolvedValue([{ error: 'prof_already_exists' }, 409]);
    open();
    type('Jane Doe');
    await submit();

    expect(container.querySelector('[role="alert"]')?.textContent).toContain(
      'already on Flow',
    );
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('keeps submit disabled until a name is entered', () => {
    open();
    expect(button('Submit').disabled).toBe(true);
    type('Jane Doe');
    expect(button('Submit').disabled).toBe(false);
  });
});
