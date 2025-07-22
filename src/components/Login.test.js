import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';

test('renders login form and submits credentials', async () => {
  const onLogin = jest.fn(() => Promise.resolve());
  render(<Login onLogin={onLogin} />);

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/contraseña/i);
  const submitButton = screen.getByRole('button', { name: /ingresar/i });

  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.type(passwordInput, 'secret');
  await userEvent.click(submitButton);

  expect(onLogin).toHaveBeenCalledWith('test@example.com', 'secret');
});
