import {
  FormControl,
  type FormControlProps,
  FormErrorMessage,
  FormLabel,
  type TextareaProps,
  Textarea,
} from '@chakra-ui/react'
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface FormTextareaProps<T extends FieldValues> extends FormControlProps {
  name: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  label: string
  placeholder: string
  errorMsg?: string
  textareaProps?: TextareaProps
}

const FormTextarea = <T extends FieldValues>({
  name,
  register,
  errors,
  label,
  placeholder,
  errorMsg,
  textareaProps,
  ...props
}: FormTextareaProps<T>) => {
  return (
    <FormControl isInvalid={!!errors[name]} maxW={{ md: '20rem' }} {...props}>
      <FormLabel fontSize='sm'>{label}</FormLabel>
      <Textarea {...register(name)} placeholder={placeholder} {...textareaProps} />
      <FormErrorMessage>
        {errorMsg || errors[name]?.message?.toString() || ''}
      </FormErrorMessage>
    </FormControl>
  )
}

export default FormTextarea
