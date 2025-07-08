import {defineField, defineType} from 'sanity'
import UsageList from '../../components/UsageList'

export const customerVariant = defineType({
  name: 'customerVariant',
  title: 'Customer Variant',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
      description: 'The name of the customer (e.g., Disney, Google, Nike)',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
      description: 'A unique identifier for this customer variant',
    }),
    defineField({
      name: 'isDefault',
      title: 'Is Default Variant',
      type: 'boolean',
      description: 'Set to true if this is the default variant used when no specific customer is selected',
      initialValue: false,
    }),
    defineField({
      name: 'replacements',
      title: 'Term Replacements',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'originalTerm',
              title: 'Original Term',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'The term to be replaced (e.g., "employee")',
            }),
            defineField({
              name: 'replacementTerm',
              title: 'Replacement Term',
              type: 'string',
              validation: (Rule) => Rule.required(),
              description: 'The term to use instead (e.g., "cast member")',
            }),
          ],
        },
      ],
      description: 'List of terms that should be replaced for this customer variant.',
    }),
    {
      name: 'usage',
      title: 'Usage',
      type: 'string',
      components: {
        input: UsageList,
      },
      readOnly: true,
      description: 'Documents where this variant\'s terms are used',
    },
  ],
  preview: {
    select: {
      title: 'name',
      isDefault: 'isDefault',
    },
    prepare({title, isDefault}) {
      return {
        title: `${title}${isDefault ? ' (Default)' : ''}`,
        subtitle: 'Customer Variant',
      }
    },
  },
}) 