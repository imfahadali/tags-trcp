/**
 * This file contains the root router of your tRPC-backend
 */
import { z } from 'zod'
import { prisma } from '../prisma'
import { t } from '../trpc'
import { healthRouter } from './health'
import { postRouter } from './post'
import { defaultTagSelect, tagRouter } from './tag'

export const appRouter = t.router({
  post: postRouter,
  health: healthRouter,
  tag: tagRouter,
  test: t.procedure
    .input(
      z.object({
        text: z.string().nullish()
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? 'world'}`
      }
    })
})

export type   AppRouter = typeof appRouter
