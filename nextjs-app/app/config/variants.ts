export const customerVariants = {
  id: 'customerVariants',
  label: 'Customer Variants',
  variants: [
    {
      id: 'disney',
      label: 'Disney',
    },
    {
      id: 'google',
      label: 'Google',
    },
    {
      id: 'nike',
      label: 'Nike',
    },
  ],
} as const;

export type CustomerVariant = typeof customerVariants.variants[number]; 