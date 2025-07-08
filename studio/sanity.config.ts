/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig, defineField} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'
import {fieldLevelExperiments} from '@sanity/personalization-plugin'
import {customerVariants} from './src/config/variants'
import {useClient} from 'sanity'
import {workflow} from 'sanity-plugin-workflow'
import type {DocumentActionProps, DocumentActionComponent} from 'sanity'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Define the home location for the presentation tool
const homeLocation = {
  title: 'Home',
  href: '/',
} satisfies DocumentLocation

// resolveHref() is a convenience function that resolves the URL
// path for different document types and used in the presentation tool.
function resolveHref(documentType?: string, slug?: string): string | undefined {
  switch (documentType) {
    case 'post':
      return slug ? `/posts/${slug}` : undefined
    case 'page':
      return slug ? `/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Clean Next.js + Sanity',

  projectId,
  dataset,

  plugins: [
    // Presentation tool configuration for Visual Editing
    presentationTool({
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        // The Main Document Resolver API provides a method of resolving a main document from a given route or route pattern. https://www.sanity.io/docs/presentation-resolver-api#57720a5678d9
        mainDocuments: defineDocuments([
          {
            route: '/:slug',
            filter: `_type == "page" && slug.current == $slug || _id == $slug`,
          },
          {
            route: '/posts/:slug',
            filter: `_type == "post" && slug.current == $slug || _id == $slug`,
          },
        ]),
        // Locations Resolver API allows you to define where data is being used in your application. https://www.sanity.io/docs/presentation-resolver-api#8d8bca7bfcd7
        locations: {
          settings: defineLocations({
            locations: [homeLocation],
            message: 'This document is used on all pages',
            tone: 'positive',
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug)!,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('post', doc?.slug)!,
                },
                {
                  title: 'Home',
                  href: '/',
                } satisfies DocumentLocation,
              ].filter(Boolean) as DocumentLocation[],
            }),
          }),
        },
      },
    }),
    structureTool({
      structure, // Custom studio structure configuration, imported from ./src/structure.ts
    }),
    // Additional plugins for enhanced functionality
    unsplashImageAsset(),
    assist(),
    visionTool(),
    fieldLevelExperiments({
      fields: ['string', 'blockContent'],
      experiments: [customerVariants],
    }),
    workflow({
      schemaTypes: ['page', 'post'],
      states: [
        {
          id: 'draft',
          title: 'Draft',
          color: 'warning',
          transitions: ['inReview', 'published']
        },
        {
          id: 'inReview',
          title: 'In Review',
          color: 'primary',
          transitions: ['published']
        },
        {
          id: 'published',
          title: 'Published',
          color: 'success',
          transitions: ['archived']
        },
        {
          id: 'archived',
          title: 'Archived',
          color: 'danger',
          transitions: []
        }
      ]
    }),
  ],

  document: {
    actions: (prev, context) => {
      // Add our custom actions
      return [
        ...prev,
        (props: DocumentActionProps) => {
          const client = useClient({apiVersion: '2023-10-01'})
          
          return {
            label: 'Set Initial State',
            onHandle: async () => {
              const docType = props.type
              const initialState = docType === 'post' ? 'inReview' : 'draft'
              
              try {
                await client
                  .patch(props.id)
                  .set({workflowState: initialState})
                  .commit()

                return {
                  message: `Document set to ${initialState} state`
                }
              } catch (err) {
                return {
                  message: 'Error setting workflow state',
                  tone: 'critical'
                }
              }
            }
          }
        },
        (props: DocumentActionProps) => {
          const client = useClient({apiVersion: '2023-10-01'})
          
          return {
            label: 'Change State',
            onHandle: async () => {
              const currentState = (props.draft?.workflowState || props.published?.workflowState) as string
              const docType = props.type as 'post' | 'page'

              try {
                // Define allowed transitions based on document type and current state
                const transitions: Record<'post' | 'page', Record<string, string[]>> = {
                  post: {
                    draft: ['inReview'],
                    inReview: ['published'],
                    published: []
                  },
                  page: {
                    draft: ['published'],
                    published: ['archived'],
                    archived: []
                  }
                }

                const availableTransitions = transitions[docType]?.[currentState] || []

                // Here you would typically show a UI to select the next state
                // For now, we'll just take the first available transition
                if (availableTransitions.length > 0) {
                  const nextState = availableTransitions[0]
                  await client
                    .patch(props.id)
                    .set({workflowState: nextState})
                    .commit()

                  return {
                    message: `Document moved to ${nextState} state`
                  }
                }

                return {
                  message: 'No available transitions',
                  tone: 'caution'
                }
              } catch (err) {
                return {
                  message: 'Error changing workflow state',
                  tone: 'critical'
                }
              }
            }
          }
        }
      ]
    }
  },

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
  },
})

export function SubmitForApproval(props: any) { 
  const client = useClient({apiVersion: "2023-10-01"})
  return {
    label: 'Submit for Approval',
    onHandle: async () => {
      try {
        await client
          .patch(props.id.startsWith('drafts.') ? props.id : `drafts.${props.id}`)
          .commit()
        window.alert('This post has been submitted for review')
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        window.alert('Error submitting for review: ' + message)
      }
    }    
  } 
}
