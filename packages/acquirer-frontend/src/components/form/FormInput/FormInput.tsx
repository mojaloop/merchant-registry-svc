import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  type FormControlProps,
  type InputProps,
} from '@chakra-ui/react'
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface FormInputProps<T extends FieldValues> extends FormControlProps {
  name: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  label: string
  placeholder?: string
  errorMsg?: string
  inputProps?: InputProps
}

const FormInput = <T extends FieldValues>({
  name,
  register,
  errors,
  label,
  placeholder,
  errorMsg,
  inputProps,
  ...props
}: FormInputProps<T>) => {
  return (
    <FormControl isInvalid={!!errors[name]} maxW={{ md: '20rem' }} {...props}>
      <FormLabel fontSize='sm'>{label}</FormLabel>
      <Input {...register(name)} placeholder={placeholder} type='text' {...inputProps} />
      <FormErrorMessage>
        {errorMsg || errors[name]?.message?.toString() || ''}
      </FormErrorMessage>
    </FormControl>
  )
}

export default FormInput
