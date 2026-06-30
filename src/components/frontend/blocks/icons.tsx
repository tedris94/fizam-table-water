import {
  Droplets,
  FlaskConical,
  Award,
  FileCheck,
  CheckCircle,
  Shield,
  Sparkles,
  Store,
  Warehouse,
  Factory,
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Heart,
  Package,
  Users,
  Leaf,
  Zap,
  Globe,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  droplets: Droplets,
  flask: FlaskConical,
  award: Award,
  fileCheck: FileCheck,
  checkCircle: CheckCircle,
  shield: Shield,
  sparkles: Sparkles,
  store: Store,
  warehouse: Warehouse,
  factory: Factory,
  truck: Truck,
  phone: Phone,
  mail: Mail,
  mapPin: MapPin,
  clock: Clock,
  star: Star,
  heart: Heart,
  package: Package,
  users: Users,
  leaf: Leaf,
  zap: Zap,
  globe: Globe,
}

/** Resolve a stored icon name to a lucide component, falling back to a sensible default. */
export function getIcon(name: string | null | undefined, fallback: LucideIcon = CheckCircle): LucideIcon {
  if (!name) return fallback
  return ICONS[name] ?? fallback
}
