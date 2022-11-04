/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { t } from '../trpc'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { prisma } from '../prisma'

/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
export const defaultTagSelect = Prisma.validator<Prisma.TagSelect>()({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true
})

export const tagRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish()
      })
    )
    .query(async () => {
      const items = await prisma.tag.findMany()

      return items
    }),
  byId: t.procedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input }) => {
      const { id } = input
      const tag = await prisma.tag.findUnique({
        where: { id },
        select: defaultTagSelect
      })
      if (!tag) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No tag with id '${id}'`
        })
      }
      return tag
    })
})
