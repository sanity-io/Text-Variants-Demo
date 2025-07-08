import {useEffect, useState} from 'react'

interface CustomerVariant {
  _id: string
  name: string
  isDefault: boolean
}

interface VariantSelectorProps {
  onSelect: (variantId: string | null) => void
  selectedVariantId?: string
}

export default function VariantSelector({onSelect, selectedVariantId}: VariantSelectorProps) {
  const [variants, setVariants] = useState<CustomerVariant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVariants() {
      try {
        const response = await fetch(
          `/api/sanity?query=${encodeURIComponent('*[_type == "customerVariant"] | order(name asc)')}`
        )
        const data = await response.json()
        setVariants(data)
      } catch (error) {
        console.error('Error fetching variants:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVariants()
  }, [])

  if (loading) {
    return <div>Loading variants...</div>
  }

  return (
    <div className="mb-4">
      <label htmlFor="variant-select" className="block text-sm font-medium text-gray-700 mb-1">
        Select Customer Variant
      </label>
      <select
        id="variant-select"
        value={selectedVariantId || ''}
        onChange={(e) => onSelect(e.target.value || null)}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">Default</option>
        {variants.map((variant) => (
          <option key={variant._id} value={variant._id}>
            {variant.name}
          </option>
        ))}
      </select>
    </div>
  )
} 