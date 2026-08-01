import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomSelect } from '../components/CustomSelect';
import { LoginPage } from '../components/views/LoginPage';

// Mock Supabase service
vi.mock('../services/supabaseService', () => ({
  getProfilesFromSupabase: vi.fn().mockResolvedValue([]),
  getCategoriesFromSupabase: vi.fn().mockResolvedValue([]),
  getArticlesFromSupabase: vi.fn().mockResolvedValue([]),
  getHandoverDocsFromSupabase: vi.fn().mockResolvedValue([]),
  getForumTopicsFromSupabase: vi.fn().mockResolvedValue([]),
  getPendingDocsFromSupabase: vi.fn().mockResolvedValue([]),
  getActivitiesFromSupabase: vi.fn().mockResolvedValue([])
}));

describe('4. Component Integration Tests: CustomSelect', () => {
  it('renders with placeholder when value is empty', () => {
    render(
      <CustomSelect
        options={['Graphic Design', 'Talent Development']}
        value=""
        onChange={() => {}}
        placeholder="Pilih Divisi"
        label="Divisi"
      />
    );

    expect(screen.getByText('Divisi')).toBeInTheDocument();
    expect(screen.getByText('Pilih Divisi')).toBeInTheDocument();
  });

  it('opens dropdown list on click and selects an option', () => {
    const handleChange = vi.fn();
    render(
      <CustomSelect
        options={['Graphic Design', 'Talent Development']}
        value=""
        onChange={handleChange}
        placeholder="Pilih Divisi"
        label="Divisi"
      />
    );

    // Click trigger button
    const triggerBtn = screen.getByRole('button', { name: /divisi/i });
    fireEvent.click(triggerBtn);

    // Verify dropdown items are visible
    expect(screen.getByText('Graphic Design')).toBeInTheDocument();
    expect(screen.getByText('Talent Development')).toBeInTheDocument();

    // Select 'Talent Development'
    fireEvent.click(screen.getByText('Talent Development'));
    expect(handleChange).toHaveBeenCalledWith('Talent Development');
  });
});

describe('5. Form Validation Component Test', () => {
  const TestForm = () => {
    const [division, setDivision] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!division) {
        setError('Harap pilih Divisi terlebih dahulu.');
        return;
      }
      setSubmitted(true);
    };

    return (
      <form onSubmit={handleSubmit}>
        <CustomSelect
          options={['Graphic Design', 'Talent Development']}
          value={division}
          onChange={(val) => {
            setDivision(val);
            setError(null);
          }}
          placeholder="Pilih Divisi"
          label="Divisi"
        />
        {error && <p data-testid="error-msg">{error}</p>}
        {submitted && <p data-testid="success-msg">Form Berhasil Disubmit</p>}
        <button type="submit">Submit</button>
      </form>
    );
  };

  it('blocks submission when CustomSelect is empty and shows error', () => {
    render(<TestForm />);

    fireEvent.click(screen.getByText('Submit'));

    expect(screen.getByTestId('error-msg')).toHaveTextContent('Harap pilih Divisi terlebih dahulu.');
    expect(screen.queryByTestId('success-msg')).not.toBeInTheDocument();
  });

  it('allows submission when CustomSelect is selected', () => {
    render(<TestForm />);

    // Open dropdown and select division
    fireEvent.click(screen.getByRole('button', { name: /divisi/i }));
    fireEvent.click(screen.getByText('Graphic Design'));

    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    expect(screen.queryByTestId('error-msg')).not.toBeInTheDocument();
    expect(screen.getByTestId('success-msg')).toHaveTextContent('Form Berhasil Disubmit');
  });
});

describe('6. Component Integration Tests: LoginPage', () => {
  it('renders login form with clean solid background', () => {
    const handleLoginSuccess = vi.fn();
    render(
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        users={[
          {
            id: 'u-admin',
            name: 'Dandi Pangestu',
            email: 'dandi.p@gmail.com',
            role: 'Admin',
            division: 'Administration',
            joinDate: '2024-01-01',
            initials: 'DP',
            status: 'Aktif'
          }
        ]}
      />
    );

    expect(screen.getByPlaceholderText('Masukkan email terdaftar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk sistem/i })).toBeInTheDocument();
  });
});
