import Image from 'next/image'

const LOGO_DARK = '/images/logo.png'
const LOGO_LIGHT = '/images/logo-white.png'
const NATIVE_W = 723
const NATIVE_H = 786

type LogoProps = {
  /** `light` = white logo (use on dark backgrounds). `dark` = colour logo (use on white). */
  variant?: 'light' | 'dark'
  /**
   * Tailwind classes controlling the rendered size — typically `h-X w-auto` so
   * the image keeps its intrinsic 723:786 ratio. Use responsive variants
   * (`h-12 md:h-16`) for breakpoint-aware sizing.
   */
  className?: string
  priority?: boolean
}

export function Logo({
  variant = 'light',
  className = 'h-11 w-auto',
  priority = false,
}: LogoProps) {
  const src = variant === 'light' ? LOGO_LIGHT : LOGO_DARK
  return (
    <Image
      src={src}
      alt="Fizam Table Water"
      width={NATIVE_W}
      height={NATIVE_H}
      sizes="(min-width: 1024px) 140px, (min-width: 768px) 110px, 80px"
      priority={priority}
      className={className}
    />
  )
}
