import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    }
  },
}))

describe('Home', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByText(/Solopreneurship/i)
    expect(heading).toBeInTheDocument()
  })
}) 