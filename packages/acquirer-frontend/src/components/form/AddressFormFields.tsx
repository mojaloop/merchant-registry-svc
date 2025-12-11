import { type FieldErrors, type FieldValues, type Path, type UseFormRegister, type UseFormSetValue } from 'react-hook-form'
import { Heading } from '@chakra-ui/react'

import { FormInput, FormSelect } from '@/components/form'
import GridShell from '@/pages/RegistryForm/GridShell'

export interface AddressFormValues {
  department?: string;
  sub_department?: string;
  street_name?: string;
  building_number?: string;
  building_name?: string;
  floor_number?: string;
  room_number?: string;
  post_box?: string;
  postal_code?: string;
  country?: string;
  country_subdivision?: string;
  district_name?: string;
  town_name?: string;
  longitude?: string;
  latitude?: string;
}

interface AddressFormFieldsProps<T extends FieldValues & AddressFormValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  setValue: UseFormSetValue<T>
  countryOptions?: Array<{ value: string; label: string }>
  subdivisionOptions?: Array<{ value: string; label: string }>
  districtOptions?: Array<{ value: string; label: string }>
  headingText?: string
}

const AddressFormFields = <T extends FieldValues & AddressFormValues>({
  register,
  errors,
  setValue,
  countryOptions,
  subdivisionOptions,
  districtOptions,
  headingText = 'Physical Address',
}: AddressFormFieldsProps<T>) => {
  return (
    <>
      {headingText && (
        <GridShell pt='2'>
          <Heading size='sm' as='h3' w='20rem' justifySelf={{ md: 'center' }}>
            {headingText}
          </Heading>
        </GridShell>
      )}

      <GridShell justifyItems='center'>
        <FormInput<T>
          name={'department' as Path<T>}
          register={register}
          errors={errors}
          label='Department'
          placeholder='Department'
        />

        <FormInput<T>
          name={'sub_department' as Path<T>}
          register={register}
          errors={errors}
          label='Sub Department'
          placeholder='Sub Department'
        />

        <FormInput<T>
          name={'street_name' as Path<T>}
          register={register}
          errors={errors}
          label='Street Name'
          placeholder='Street Name'
        />

        <FormInput<T>
          name={'building_number' as Path<T>}
          register={register}
          errors={errors}
          label='Building Number'
          placeholder='Building Number'
        />

        <FormInput<T>
          name={'building_name' as Path<T>}
          register={register}
          errors={errors}
          label='Building Name'
          placeholder='Building Name'
        />

        <FormInput<T>
          name={'floor_number' as Path<T>}
          register={register}
          errors={errors}
          label='Floor Number'
          placeholder='Floor Number'
        />

        <FormInput<T>
          name={'room_number' as Path<T>}
          register={register}
          errors={errors}
          label='Room Number'
          placeholder='Room Number'
        />

        <FormInput<T>
          name={'post_box' as Path<T>}
          register={register}
          errors={errors}
          label='Post Box'
          placeholder='Post Box'
        />

        <FormInput<T>
          name={'postal_code' as Path<T>}
          register={register}
          errors={errors}
          label='Postal Code'
          placeholder='Postal Code'
        />

        <FormSelect<T>
          name={'country' as Path<T>}
          register={register}
          errors={errors}
          label='Country'
          placeholder='Choose Country'
          options={countryOptions || []}
          onChange={() => {
            setValue('country_subdivision' as Path<T>, '' as T[Path<T>])
            setValue('district_name' as Path<T>, '' as T[Path<T>])
          }}
        />

        <FormSelect<T>
          name={'country_subdivision' as Path<T>}
          register={register}
          errors={errors}
          label='Country Subdivision (State/Divison)'
          placeholder='Choose Country Subdivision'
          options={subdivisionOptions || []}
          onChange={() => {
            setValue('district_name' as Path<T>, '' as T[Path<T>])
          }}
        />

        <FormSelect<T>
          name={'district_name' as Path<T>}
          register={register}
          errors={errors}
          label='District'
          placeholder='Choose District'
          options={districtOptions || []}
        />

        <FormInput<T>
          name={'town_name' as Path<T>}
          register={register}
          errors={errors}
          label='Township'
          placeholder='Township'
        />

        <FormInput<T>
          name={'longitude' as Path<T>}
          register={register}
          errors={errors}
          label='Longitude'
          placeholder='Longitude'
          inputProps={{ type: 'number' }}
        />

        <FormInput<T>
          name={'latitude' as Path<T>}
          register={register}
          errors={errors}
          label='Latitude'
          placeholder='Latitude'
          inputProps={{ type: 'number' }}
        />
      </GridShell>
    </>
  )
}

export default AddressFormFields
