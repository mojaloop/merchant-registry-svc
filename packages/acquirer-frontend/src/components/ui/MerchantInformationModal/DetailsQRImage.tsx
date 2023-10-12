import { Grid, GridItem, Image } from '@chakra-ui/react'

interface DetailsQRImageProps {
  label: string
  qrImageUrl: string
}

export const DetailsQRImage = ({ label, qrImageUrl }: DetailsQRImageProps) => {
  return (
    <Grid templateColumns='170px 1fr' gap={{ base: '1', sm: '2' }} fontSize='sm'>
      <GridItem as='p'>{label}:</GridItem>
      <GridItem>
        {qrImageUrl === '' ? (
          <GridItem>N/A</GridItem>
        ) : (
          <Image
            src={qrImageUrl}
            alt='QR Code Image'
            width={{ base: '100px', sm: '150px' }}
          />
        )}
      </GridItem>
    </Grid>
  )
}
