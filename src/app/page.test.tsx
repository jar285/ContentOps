import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import Page from './page';

test('renders the placeholder page component', () => {
  render(<Page />);
  const heading = screen.getByRole('heading', {
    name: /ContentOps Foundation/i,
  });
  expect(heading).toBeInTheDocument();

  const text = screen.getByText(/Placeholder Page/i);
  expect(text).toBeInTheDocument();
});
