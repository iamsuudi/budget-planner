import { Link } from '@tanstack/react-router'

interface CancelButtonProps {
  to: string
}

export function CancelButton({ to }: CancelButtonProps) {
  return (
    <Link
      to={to}
      className="w-full py-3 border border-secondary text-secondary rounded-xl text-sm font-semibold hover:bg-secondary/5 transition-all active:scale-95 text-center"
    >
      Cancel
    </Link>
  )
}