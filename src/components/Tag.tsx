import React from 'react'
import classes from './tag.module.css'
import { Tag as ChakraTag, TagLabel } from '@chakra-ui/react'
interface PropsInterface {
  tag: TagInterface
  color: string
}
interface TagInterface {
  id: string
  name: string
  updatedAt: Date
  createAt: Date
}
const Tag: React.FC<PropsInterface> = ({ tag, color }) => {
  return (
    <ChakraTag
      key={tag.id}
      borderRadius="full"
      variant="solid"
      backgroundColor={color}
      marginInline="10px"
    >
      <TagLabel>{tag.name}</TagLabel>
    </ChakraTag>
  )
}

export default Tag
