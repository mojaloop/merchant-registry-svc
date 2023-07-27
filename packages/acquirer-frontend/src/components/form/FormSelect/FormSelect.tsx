import {
  FormControl,
  type FormControlProps,
  FormErrorMessage,
  FormLabel,
  Select,
} from '@chakra-ui/react'
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface Option {
  value: string
  label: string
}

interface FormSelectProps<T extends FieldValues> extends FormControlProps {
  name: Path<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  label: string
  placeholder: string
  options: Option[]
  errorMsg?: string
}

const FormSelect = <T extends FieldValues>({
  name,
  register,
  errors,
  label,
  placeholder,
  options,
  errorMsg,
  ...props
}: FormSelectProps<T>) => {
  return (
    <FormControl isInvalid={!!errors[name]} maxW={{ md: '20rem' }} {...props}>
      <FormLabel fontSize='sm'>{label}</FormLabel>
      <Select {...register(name)} defaultValue=''>
        <option value='' disabled>
          {placeholder}
        </option>
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <FormErrorMessage>
        {errorMsg || errors[name]?.message?.toString() || ''}
      </FormErrorMessage>
    </FormControl>
  )
}

export default FormSelect
