/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { t } from '../trpc'
import { Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { string, z } from 'zod'
import { prisma } from '../prisma'
import { TagSharp } from '@mui/icons-material'

/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @see https://github.com/prisma/prisma/issues/9353
 */
const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  text: true,
  createdAt: true,
  updatedAt: true
})

export const postRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish()
      })
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 50
      const { cursor } = input

      const items = await prisma.post.findMany({
        include: { tags: { include: { tag: true } } },
        take: limit + 1,
        where: {},
        cursor: cursor
          ? {
              id: cursor
            }
          : undefined,
        orderBy: {
          createdAt: 'desc'
        }
      })
      let nextCursor: typeof cursor | undefined = undefined
      if (items.length > limit) {
        // Remove the last item and use it as next cursor

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const nextItem = items.pop()!
        nextCursor = nextItem.id
      }

      return {
        items: items.reverse(),
        nextCursor
      }
    }),
  byId: t.procedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .query(async ({ input }) => {
      const { id } = input
      const post = await prisma.post.findUnique({
        where: { id },
        include: { tags: { include: { tag: true } } }
      })
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`
        })
      }
      return post
    }),
  add: t.procedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().min(1).max(32),
        tags: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            custom: z.boolean().optional()
          })
        ),
        text: z.string().min(1)
      })
    )
    .mutation(async ({ input }) => {
      const formattedtTagsForPrismaCreate = input.tags.map((item) => ({
        tag: {
          create: item.custom
            ? { name: item.value }
            : { name: item.value, id: item.label }
        }
      }))

      const post = await prisma.post.create({
        data: {
          title: input.title,
          text: input.text,
          tags: {
            create: formattedtTagsForPrismaCreate
          }
        },
        select: defaultPostSelect
      })
      return post
    })
})
