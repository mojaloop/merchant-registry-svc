import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  type FormControlProps,
  type SelectProps,
} from '@chakra-ui/react'
import type { FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'

interface Option {
  value: string | number
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
  selectProps?: SelectProps
}

const FormSelect = <T extends FieldValues>({
  name,
  register,
  errors,
  label,
  placeholder,
  options,
  errorMsg,
  selectProps,
  ...props
}: FormSelectProps<T>) => {
  return (
    <FormControl isInvalid={!!errors[name]} maxW={{ md: '20rem' }} {...props}>
      <FormLabel fontSize='sm'>{label}</FormLabel>
      <Select {...register(name)} defaultValue='' {...selectProps}>
        <option value='' disabled>
          {placeholder}
        </option>
        {options.map(({ value, label }, index) => (
          <option key={`${value}-${index}`} value={value}>
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
