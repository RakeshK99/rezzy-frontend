'use client'

import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm',
  {
    variants: {
      variant: {
        default: 'bg-white text-black hover:bg-neutral-100',
        outline: 'border border-white text-white hover:bg-white hover:text-black',
        ghost: 'bg-transparent text-white hover:bg-neutral-800',
        premium: 'bg-gradient-to-r from-[#6EE7B7] to-[#3B82F6] text-white hover:opacity-90',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-9 px-4',
        lg: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
