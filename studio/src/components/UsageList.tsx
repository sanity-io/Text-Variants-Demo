import React, {useEffect, useState} from 'react'
import {useClient, useFormValue} from 'sanity'

interface UsageItem {
  _id: string
  title: string
  _type: string
  originalTerms: string[]
}

export default function UsageList(props: any) {
  const client = useClient()
  const document = useFormValue([]) as any
  const [usages, setUsages] = useState<UsageItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsages() {
      if (!document?.replacements?.length) {
        setLoading(false)
        return
      }

      try {
        const originalTerms = document.replacements.map((r: any) => r.originalTerm)
        
        const query = `
          *[_type in ["post", "page"]] {
            _id,
            title,
            _type,
            content
          }
        `
        
        const documents = await client.fetch(query)
        const documentMap = new Map<string, UsageItem>()
        
        documents.forEach((doc: any) => {
          if (doc.content) {
            // Handle different content structures
            let contentToProcess = doc.content
            
            // Check if it's experimentBlockContent
            if (doc.content._type === 'experimentBlockContent' && doc.content.default) {
              contentToProcess = doc.content.default
            }
            
            if (Array.isArray(contentToProcess)) {
              const foundTerms: string[] = []
              
              // Collect all variant terms from all blocks in this document
              contentToProcess.forEach((block: any) => {
                if (block._type === 'block' && block.markDefs) {
                  block.markDefs.forEach((mark: any) => {
                    if (mark._type === 'variant' && originalTerms.includes(mark.originalTerm)) {
                      if (!foundTerms.includes(mark.originalTerm)) {
                        foundTerms.push(mark.originalTerm)
                      }
                    }
                  })
                }
              })
              
              // Only add the document if any terms were found
              if (foundTerms.length > 0) {
                documentMap.set(doc._id, {
                  _id: doc._id,
                  title: doc.title || 'Untitled',
                  _type: doc._type,
                  originalTerms: foundTerms
                })
              }
            }
          }
        })
        
        const matchingDocs = Array.from(documentMap.values())
        
        setUsages(matchingDocs)
      } catch (error) {
        console.error('Error fetching variant usages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsages()
  }, [document?.replacements, client])

  if (loading) {
    return (
      <div style={{padding: '16px', fontSize: '14px', color: '#666'}}>
        Loading usage information...
      </div>
    )
  }

  if (!usages.length) {
    return (
      <div style={{padding: '16px', fontSize: '14px', color: '#666'}}>
        No documents found using these variant terms.
        <br />
        <small>Note: Only documents with variant annotations (🔄) will appear here.</small>
      </div>
    )
  }

  return (
    <div style={{border: '1px solid #e1e3e6', borderRadius: '6px', padding: '16px', backgroundColor: '#f9f9fb'}}>
      <h4 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600, color: '#101112'}}>
        Used in {usages.length} document{usages.length !== 1 ? 's' : ''}:
      </h4>
      <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
        {usages.map((usage) => (
          <a
            key={usage._id}
            href={`/desk/${usage._type};${usage._id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: '#2276fc',
              fontSize: '13px',
              padding: '8px 12px',
              border: '1px solid #e1e3e6',
              borderRadius: '4px',
              backgroundColor: '#ffffff',
              transition: 'background-color 0.1s ease'
            }}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f6f7f8'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
            }}
          >
            <span style={{marginRight: '8px', fontSize: '16px'}}>
              {usage._type === 'post' ? '📝' : '📄'}
            </span>
            <div style={{flex: 1}}>
              <div style={{fontWeight: 500}}>{usage.title}</div>
              <div style={{fontSize: '11px', color: '#666', marginTop: '2px'}}>
                Uses: {usage.originalTerms.map((term, index) => (
                  <span key={term}>
                    <span style={{fontWeight: 500, color: '#2276fc'}}>{term}</span>
                    {index < usage.originalTerms.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
            <span style={{color: '#666', textTransform: 'capitalize', fontSize: '12px'}}>
              ({usage._type})
            </span>
          </a>
        ))}
      </div>
    </div>
  )
} 