import {
    FormControl,
    HStack,
    Heading,
    Radio,
    RadioGroup,
    Stack,
    Text,
} from '@chakra-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { type onboardDfspForm, onboardDfspSchema } from '@/lib/validations/onboardDfsp';
import { useMojaloopDfsps } from '@/api/hooks/mojaloopDfsps';
import { useOnboardDfsp } from '@/api/hooks/dfsps';
import { CustomButton } from '@/components/ui';
import { FormInput, FormSelect } from '@/components/form';
import GridShell from './GridBox';

const OnboardDfsp = () => {
    const {
        register,
        control,
        formState: { errors },
        handleSubmit,
        reset,
    } = useForm<onboardDfspForm>({
        resolver: zodResolver(onboardDfspSchema),
    });

    const mojaloopDfsps = useMojaloopDfsps();
    const onboardDfsp = useOnboardDfsp();

    let dfspNamesOptions = [];
    let dfspTypesOptions = [
        { label: 'Bank and Credit Union', value: 'Bank and Credit Union' },
        { label: 'Mobile Money Operator', value: 'Mobile Money Operator' },
        { label: 'Payment Service Provider', value: 'Payment Service Provider' },
        { label: 'Electronic Money Issuer', value: 'Electronic Money Issuer' },
        { label: 'Microfinance Institution', value: 'Microfinance Institution' },
        { label: 'Other', value: 'Other' },
    ];

    if (mojaloopDfsps.isSuccess) {
        const dfspArray = Array.isArray(mojaloopDfsps.data) ? mojaloopDfsps.data : [];
        dfspNamesOptions = dfspArray.map((dfsp) => ({ label: dfsp.dfsp_name, value: dfsp.dfsp_name }));
    }

    const onSubmit = async (values: onboardDfspForm) => {
        await onboardDfsp.mutateAsync(values);
        reset();
    };

    return (
              <>
                    {dfspNamesOptions && (
                        <Stack as='form'  onSubmit={handleSubmit(onSubmit)} minH='full' maxW='full' minW='full'>
                            <Heading size='md' mb={4} mt={7} ml={9} >
                                DFSP Onboarding
                            </Heading>
                            <GridShell
                            >
                                    <FormSelect
                                        name='name'
                                        register={register}
                                        errors={errors}
                                        label='DFSP Name'
                                        placeholder='Select Dfsp name'
                                        options={dfspNamesOptions}
                                        selectProps={{ bg: 'white' }}
                                    />
                                    <FormSelect
                                        name='type'
                                        register={register}
                                        errors={errors}
                                        label='DFSP Type'
                                        placeholder='Select Dfsp type'
                                        options={dfspTypesOptions}
                                        ml={0}
                                        selectProps={{ bg: 'white' }}
                                    />
                                    <FormInput
                                        name='license_id'
                                        register={register}
                                        errors={errors}
                                        label='DFSP Business License ID'
                                        inputProps={{ bg: 'white' }}
                                    />
                                    <FormInput
                                        name='logo'
                                        register={register}
                                        label='Business logo'
                                        inputProps={{
                                            type: 'file',
                                            onChange: (e) => {
                                                const file = e.target.files[0];
                                                if (file && file.size > 5 * 1024 * 1024) {
                                                    alert('Please select a file smaller than 5MB.');
                                                }
                                            },
                                            accept: '.jpg, .jpeg, .png, .pdf',
                                            bg: 'white',
                                        }}
                                        errors={errors}
                                        ml={0}
                                    />
                                    <FormControl>
                                        <Text mb='4' fontSize='0.9375rem'>
                                            Will this DFSP use the Mojaloop Merchant Acquiring Portal?
                                        </Text>
                                        <Controller
                                            control={control}
                                            name='will_use_portal'
                                            render={({ field }) => (
                                                <RadioGroup {...field} onChange={(value) => field.onChange(value)}>
                                                    <Stack>
                                                        <Radio value='yes'>Yes</Radio>
                                                        <Radio value='no'>No</Radio>
                                                    </Stack>
                                                </RadioGroup>
                                            )}
                                        />
                                    </FormControl>
                                <HStack>
                                    <CustomButton type='submit' mt={40} ml={30}>
                                        Submit
                                    </CustomButton>
                                </HStack>
                            </GridShell>
                        </Stack>
                    )}
               </>
    );
};

export default OnboardDfsp;
