import { defineCollection } from 'astro:content'
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema'
import { z } from 'astro/zod'

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Free-form content type label (e.g. "Tutorial", "FAQ"). Drives the pagefind
        // `type` filter directly, so search's content-type tier picks up new values
        // automatically without any code changes.
        // For example:
        // ---
        // contentType: "Tutorial"
        // ---
        contentType: z.string().optional(),
      }),
    }),
  }),
}
