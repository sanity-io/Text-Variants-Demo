import {PortableText} from '@portabletext/react'
import {PortableTextBlock} from '@portabletext/types'
import {useEffect, useState} from 'react'

interface CustomerVariant {
  _id: string
  name: string
  isDefault: boolean
  replacements: {
    originalTerm: string
    replacementTerm: string
  }[]
}

interface VariantTextProps {
  value: PortableTextBlock[]
  customerVariantId?: string
}

export default function VariantText({value, customerVariantId}: VariantTextProps) {
  const [variant, setVariant] = useState<CustomerVariant | null>(null)

  useEffect(() => {
    async function fetchVariant() {
      try {
        const query = customerVariantId
          ? `*[_type == "customerVariant" && _id == $id][0]`
          : `*[_type == "customerVariant" && isDefault == true][0]`
        
        const params = customerVariantId ? {id: customerVariantId} : {}
        
        const response = await fetch(
          `/api/sanity?query=${encodeURIComponent(query)}&params=${encodeURIComponent(JSON.stringify(params))}`
        )
        const data = await response.json()
        setVariant(data)
      } catch (error) {
        console.error('Error fetching customer variant:', error)
      }
    }

    fetchVariant()
  }, [customerVariantId])

  // Extract the text and mark from the block
  const text = value[0]?.children?.[0]?.text || ''
  const mark = value[0]?.markDefs?.[0]

  if (!mark || !variant) {
    return <span>{text}</span>
  }

  const {originalTerm} = mark
  const replacement = variant.replacements.find(
    (r) => r.originalTerm === originalTerm
  )

  return <span>{replacement ? replacement.replacementTerm : text}</span>
} 