import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '@/components/ui/Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders page buttons', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 3')).toBeInTheDocument();
  });

  it('calls onPageChange when clicking next', () => {
    const handleChange = vi.fn();
    render(<Pagination page={2} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Next page'));
    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it('calls onPageChange when clicking previous', () => {
    const handleChange = vi.fn();
    render(<Pagination page={3} totalPages={5} onPageChange={handleChange} />);
    fireEvent.click(screen.getByLabelText('Previous page'));
    expect(handleChange).toHaveBeenCalledWith(2);
  });

  it('disables previous button on first page', () => {
    render(<Pagination page={1} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination page={5} totalPages={5} onPageChange={() => {}} />);
    expect(screen.getByLabelText('Next page')).toBeDisabled();
  });
});
