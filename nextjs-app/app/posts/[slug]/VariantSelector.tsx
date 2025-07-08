'use client';

import {useEffect, useState} from 'react';
import {type PortableTextBlock} from 'next-sanity';
import PortableText from '@/app/components/PortableText';

interface CustomerVariant {
  _id: string
  name: string
  isDefault: boolean
  replacements: {
    originalTerm: string
    replacementTerm: string
    isPlural: boolean
  }[]
}

type ExperimentBlockContent = {
  _type: 'experimentBlockContent'
  default?: PortableTextBlock[]
  active?: string
  experimentId?: string
  variants?: Array<{
    _key: string
    variantId?: string
    experimentId?: string
    value?: PortableTextBlock[]
  }>
}

type Props = {
  content: PortableTextBlock[] | ExperimentBlockContent;
};

function isExperimentBlockContent(content: any): content is ExperimentBlockContent {
  return content && content._type === 'experimentBlockContent';
}

function getContentValue(content: any): PortableTextBlock[] {
  if (!content) return [];
  
  if (isExperimentBlockContent(content)) {
    // Use default content
    if (content.default) {
      return content.default;
    }
  }
  
  // If it's not experiment content, return as is
  return Array.isArray(content) ? content : [];
}

export default function VariantSelector({content}: Props) {
  const [variants, setVariants] = useState<CustomerVariant[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

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
      }
    }

    fetchVariants()
  }, [])

  // Get the content value
  const contentValue = getContentValue(content)

  // Transform the content to use variantText type
  const transformedContent = contentValue.map(block => {
    if (block._type === 'block') {
      return {
        ...block,
        markDefs: block.markDefs?.map(mark => {
          if (mark._type === 'variant') {
            return {
              ...mark,
              _type: 'variantText',
              customerVariantId: selectedVariantId
            }
          }
          return mark
        })
      }
    }
    return block
  })

  // Check if we have a default variant in the data
  const hasDefaultVariant = variants.some(v => v.isDefault)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <label htmlFor="variant-select" className="text-sm font-medium text-gray-700">
          Content Variant:
        </label>
        <select
          id="variant-select"
          value={selectedVariantId || ''}
          onChange={(e) => setSelectedVariantId(e.target.value || null)}
          className="block w-48 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          {!hasDefaultVariant && <option value="">Default</option>}
          {variants.map((variant) => (
            <option key={variant._id} value={variant._id}>
              {variant.name}
            </option>
          ))}
        </select>
      </div>
      <PortableText value={transformedContent} />
    </div>
  );
} 