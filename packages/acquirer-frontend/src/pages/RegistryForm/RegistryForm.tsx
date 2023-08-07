import { useLocation } from 'react-router-dom'
import {
  Box,
  Heading,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react'

import type { DraftData } from '@/types/form'
import BusinessInfoForm from './BusinessInfoForm'
import LocationInfoForm from './LocationInfoForm'
import OwnerInfoForm from './OwnerInfoForm'
import ContactPersonForm from './ContactPersonForm'

const STEPS = [
  'Business Information',
  'Location Information',
  'Owner Information',
  'Contact Person',
]

const RegistryForm = () => {
  const location = useLocation()
  const state = location.state as DraftData | null

  const { activeStep, setActiveStep } = useSteps({
    index: 1,
    count: STEPS.length,
  })

  return (
    <Box>
      <Heading size='md' mb='10' textAlign='center'>
        Merchant Acquiring System &gt; Merchant Registry Form
      </Heading>

      <Box
        w='90vw'
        maxW={{ sm: '600px', md: '700px', lg: '800px', xl: '900px' }}
        mx='auto'
      >
        <Stepper index={activeStep} size='sm'>
          {STEPS.map(step => (
            <Step key={step}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box position='absolute' top='8' left='-14' minW='36' textAlign='center'>
                <StepTitle>{step}</StepTitle>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>

        {activeStep === 1 && (
          <BusinessInfoForm draftData={state} setActiveStep={setActiveStep} />
        )}
        {activeStep === 2 && (
          <LocationInfoForm draftData={state} setActiveStep={setActiveStep} />
        )}
        {activeStep === 3 && (
          <OwnerInfoForm draftData={state} setActiveStep={setActiveStep} />
        )}
        {activeStep === 4 && (
          <ContactPersonForm draftData={state} setActiveStep={setActiveStep} />
        )}
      </Box>
    </Box>
  )
}

export default RegistryForm
