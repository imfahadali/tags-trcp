import { trpc } from '../utils/trpc'

import { inferProcedureInput } from '@trpc/server'
import { Heading, Input, Textarea } from '@chakra-ui/react'
import { Box, ChakraProvider } from '@chakra-ui/react'

import { AppRouter } from '~/server/routers/_app'
import { useRouter } from 'next/router'

import React, { useEffect } from 'react'
import { CUIAutoComplete } from 'chakra-ui-autocomplete'

export interface Item {
  label: string
  value: string
  custom?: boolean
}
type Input = inferProcedureInput<AppRouter['post']['add']>

const defaultArray = [{ value: '', label: '' }]

const AddPost = () => {
  const [pickerItems, setPickerItems] = React.useState<Item[]>([])
  const [selectedItems, setSelectedItems] = React.useState<Item[]>([])
  console.log({ pickerItems })
  console.log({selectedItems})

  const handleCreateItem = (item: Item) => {
    setPickerItems((curr) => [...curr, { ...item, custom: true }])
    setSelectedItems((curr) => [...curr, { ...item, custom: true }])
  }

  const handleSelectedItemsChange = (selectedItems?: Item[]) => {
    if (selectedItems) {
      setSelectedItems(selectedItems)
    }
  }

  const handleSubmission = async (e: any) => {
    e.preventDefault()
    const $form = e.currentTarget
    const values = Object.fromEntries(new FormData($form))
    console.log({ values })
    //    ^?
    const input: Input = {
      title: values.title as string,
      text: values.text as string,
      tags: selectedItems as Item[]
    }
    try {
      await addPost.mutateAsync(input)

      $form.reset()
      router.push('/')
    } catch (cause) {
      console.error({ cause }, 'Failed to add post')
    }
  }

  const utils = trpc.useContext()

  const tagQuery = trpc.tag.list.useQuery({})
  const { data } = tagQuery
  console.log({ data })

  const addPost = trpc.post.add.useMutation({
    async onSuccess() {
      await utils.post.list.invalidate()
    }
  })

  const router = useRouter()
  console.log(tagQuery.isLoading)

  useEffect(() => {
    const fetchedTags = tagQuery.data?.map((item) => ({
      label: item.name,
      value: item.id
    }))
    setPickerItems(fetchedTags as any)
  }, [tagQuery.isLoading])

  return (
    <div style={{ width: '50%', margin: 'auto' }}>
      <Heading size="lg">Add a Post</Heading>

      <form onSubmit={handleSubmission}>
        <label htmlFor="title">Title:</label>
        <br />
        <Input
          id="title"
          name="title"
          type="text"
          disabled={addPost.isLoading}
        />
        <label htmlFor="tag">tag:</label>
        <br />

        <ChakraProvider>
          <Box px={8} py={4}>
            <CUIAutoComplete
              label="Choose preferred work locations"
              placeholder="Type a Country"
              onCreateItem={handleCreateItem}
              items={pickerItems ?? defaultArray}
              selectedItems={selectedItems}
              onSelectedItemsChange={(changes) =>
                handleSelectedItemsChange(changes.selectedItems)
              }
            />
          </Box>
        </ChakraProvider>

        <br />
        <label htmlFor="text">Text:</label>
        <br />
        <Textarea id="text" name="text" disabled={addPost.isLoading} />
        <br />
        <Input type="submit" disabled={addPost.isLoading} />
        {addPost.error && (
          <p style={{ color: 'red' }}>{addPost.error.message}</p>
        )}
      </form>
    </div>
  )
}

export default AddPost
