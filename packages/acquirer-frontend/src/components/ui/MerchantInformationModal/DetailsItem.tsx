import { Grid, GridItem } from '@chakra-ui/react'

interface DetailsItemProps {
  label: string
  value: string | React.ReactNode
}

export const DetailsItem = ({ label, value }: DetailsItemProps) => {
  return (
    <Grid templateColumns='170px 1fr' gap={{ base: '1', sm: '2' }} fontSize='sm'>
      <GridItem as='p'>{label}:</GridItem>
      {typeof value === 'string' ? (
        <GridItem as='p' wordBreak='break-word'>
          {value}
        </GridItem>
      ) : (
        <GridItem>{value}</GridItem>
      )}
    </Grid>
  )
}
