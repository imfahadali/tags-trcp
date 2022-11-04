import { Box, Code, Heading, Text } from '@chakra-ui/react'
import NextError from 'next/error'
import { useRouter } from 'next/router'
import Tag from '~/components/Tag'
import { NextPageWithLayout } from '~/pages/_app'
import { trpc } from '~/utils/trpc'

import Head from 'next/head'
import {
  Container,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon
} from '@chakra-ui/react'

const PostViewPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string
  const postQuery = trpc.post.byId.useQuery({ id })

  if (postQuery.error) {
    return (
      <NextError
        title={postQuery.error.message}
        statusCode={postQuery.error.data?.httpStatus ?? 500}
      />
    )
  }

  if (postQuery.status !== 'success') {
    return <>Loading...</>
  }
  const { data } = postQuery

  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Container maxW={'3xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
          >
            {data.title}
          </Heading>
          <Text fontSize={10} color={'gray.500'} marginBlockStart={10}>
            Created {data.createdAt.toLocaleDateString('en-us')}
          </Text>
          {/* <Text fontSize={10} color="grey" marginInlineStart="auto">Updated {data.updatedAt.toLocaleDateString('en-us')}</Text> */}

          <Text color={'gray.600'} fontSize={'32px'}>
            {data.text}
          </Text>
          <Stack
            direction={'row'}
            spacing={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <Text>Tags:</Text>
            {data.tags.map((item: any) => (
              <Tag tag={item.tag} color="teal"/>
            ))}
          </Stack>
        </Stack>
      </Container>
    </>
  )
}

export default PostViewPage

