import {createClient} from 'next-sanity'
import {NextResponse} from 'next/server'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-19',
  useCdn: false,
})

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url)
  const query = searchParams.get('query')
  const params = JSON.parse(searchParams.get('params') || '{}')

  if (!query) {
    return NextResponse.json({error: 'Query parameter is required'}, {status: 400})
  }

  try {
    const data = await client.fetch(query, params)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching from Sanity:', error)
    return NextResponse.json({error: 'Failed to fetch data'}, {status: 500})
  }
} 