export const AVAILABLE_ICONS = [
  'restaurant',
  'shopping_cart',
  'flight',
  'home',
  'fitness_center',
  'directions_car',
  'medical_services',
  'school',
  'pets',
  'spa',
  'celebration',
  'movie',
  'theater_comedy',
  'sports_esports',
  'music_note',
  'local_cafe',
  'local_grocery_store',
  'checkroom',
  'dry_cleaning',
  'wifi',
  'commute',
  'attach_money',
  'savings',
  'account_balance',
  'credit_card',
  'wallet',
  'payments',
  'receipt',
  'trending_up',
  'trending_down',
]

export interface IconStyle {
  bg: string
  border: string
  color: string
}

export function getIconStyle(icon: string): IconStyle {
  const styles: Record<string, IconStyle> = {
    restaurant: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      color: 'text-violet-400',
    },
    directions_car: {
      bg: 'bg-secondary-container/10',
      border: 'border-secondary-container/20',
      color: 'text-secondary',
    },
    theater_comedy: {
      bg: 'bg-tertiary-container/10',
      border: 'border-tertiary-container/20',
      color: 'text-tertiary',
    },
    health_and_safety: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      color: 'text-primary',
    },
    school: {
      bg: 'bg-secondary-fixed-dim/10',
      border: 'border-secondary-fixed-dim/20',
      color: 'text-secondary-fixed-dim',
    },
    shopping_cart: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      color: 'text-violet-400',
    },
    flight: {
      bg: 'bg-secondary-container/10',
      border: 'border-secondary-container/20',
      color: 'text-secondary',
    },
    fitness_center: {
      bg: 'bg-tertiary-container/10',
      border: 'border-tertiary-container/20',
      color: 'text-tertiary',
    },
    medical_services: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      color: 'text-primary',
    },
    pets: {
      bg: 'bg-secondary-fixed-dim/10',
      border: 'border-secondary-fixed-dim/20',
      color: 'text-secondary-fixed-dim',
    },
    spa: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      color: 'text-violet-400',
    },
    movie: {
      bg: 'bg-secondary-container/10',
      border: 'border-secondary-container/20',
      color: 'text-secondary',
    },
    sports_esports: {
      bg: 'bg-tertiary-container/10',
      border: 'border-tertiary-container/20',
      color: 'text-tertiary',
    },
    music_note: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      color: 'text-primary',
    },
    local_cafe: {
      bg: 'bg-secondary-fixed-dim/10',
      border: 'border-secondary-fixed-dim/20',
      color: 'text-secondary-fixed-dim',
    },
    local_grocery_store: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      color: 'text-violet-400',
    },
    checkroom: {
      bg: 'bg-secondary-container/10',
      border: 'border-secondary-container/20',
      color: 'text-secondary',
    },
    dry_cleaning: {
      bg: 'bg-tertiary-container/10',
      border: 'border-tertiary-container/20',
      color: 'text-tertiary',
    },
    wifi: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      color: 'text-primary',
    },
    commute: {
      bg: 'bg-secondary-fixed-dim/10',
      border: 'border-secondary-fixed-dim/20',
      color: 'text-secondary-fixed-dim',
    },
    attach_money: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      color: 'text-violet-400',
    },
    savings: {
      bg: 'bg-tertiary/10',
      border: 'border-tertiary/20',
      color: 'text-tertiary',
    },
    account_balance: {
      bg: 'bg-secondary/10',
      border: 'border-secondary/20',
      color: 'text-secondary',
    },
    credit_card: {
      bg: 'bg-primary/10',
      border: 'border-primary/20',
      color: 'text-primary',
    },
    wallet: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      color: 'text-violet-400',
    },
    payments: {
      bg: 'bg-secondary-container/10',
      border: 'border-secondary-container/20',
      color: 'text-secondary',
    },
    receipt: {
      bg: 'bg-tertiary-container/10',
      border: 'border-tertiary-container/20',
      color: 'text-tertiary',
    },
    trending_up: {
      bg: 'bg-tertiary/10',
      border: 'border-tertiary/20',
      color: 'text-tertiary',
    },
    trending_down: {
      bg: 'bg-error/10',
      border: 'border-error/20',
      color: 'text-error',
    },
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return styles[icon] || styles.restaurant
}
