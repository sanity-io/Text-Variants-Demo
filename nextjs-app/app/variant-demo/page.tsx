'use client'

import {useState} from 'react'
import VariantSelector from '../components/VariantSelector'
import VariantText from '../components/VariantText'

const demoContent = [
  {
    _type: 'block',
    children: [
      {
        _type: 'span',
        text: 'Welcome to our company! Our ',
      },
      {
        _type: 'span',
        text: 'employees',
        marks: ['variant'],
        markDefs: [
          {
            _type: 'variant',
            originalTerm: 'employees',
            isPlural: true,
          },
        ],
      },
      {
        _type: 'span',
        text: ' are our greatest asset. Each ',
      },
      {
        _type: 'span',
        text: 'employee',
        marks: ['variant'],
        markDefs: [
          {
            _type: 'variant',
            originalTerm: 'employee',
            isPlural: false,
          },
        ],
      },
      {
        _type: 'span',
        text: ' contributes to our success.',
      },
    ],
  },
]

export default function VariantDemo() {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Variant Text Demo</h1>
      
      <VariantSelector
        selectedVariantId={selectedVariantId || undefined}
        onSelect={setSelectedVariantId}
      />

      <div className="prose max-w-none">
        <VariantText value={demoContent} customerVariantId={selectedVariantId || undefined} />
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">How it works:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Select a customer variant from the dropdown above</li>
          <li>The text will automatically update to use the appropriate terms</li>
          <li>If no variant is selected, it will use the default terms</li>
        </ol>
      </div>
    </div>
  )
} 