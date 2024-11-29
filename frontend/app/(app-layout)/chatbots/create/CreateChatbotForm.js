'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Input } from '@/app/_components/shadcn/input';
import { Button } from '@/app/_components/shadcn/button';
import { Plus, X } from 'lucide-react';
import CTAButton from '@/app/_components/CTAButton';
import Heading from '@/app/_components/Heading';
import { Label } from '@/app/_components/shadcn/label';
import { Slider } from '@/app/_components/shadcn/slider';
import MiniLoader from '@/app/_components/MiniLoader';
import { createChatbotAction } from '@/app/_actions/chatbotActions';

export default function CreateChatbotForm({ onPreviewChange }) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      chatbotName: '',
      initialMessage: '',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      chatbotBorderRadius: 0,
      fontSize: 12,
      botImage: null,
      widgetColor: '#000000',
      widgetBorderRadius: 0,
      files: [{ file: null }],
      urls: [{ url: '' }],
      trainingMethod: 'files',
      chatbotType: 'external',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'files',
  });

  const {
    fields: urlFields,
    append: appendUrl,
    remove: removeUrl,
  } = useFieldArray({
    control,
    name: 'urls',
  });

  const formValuesRef = useRef({});

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (
        [
          'chatbotName',
          'initialMessage',
          'primaryColor',
          'secondaryColor',
          'chatbotBorderRadius',
          'fontSize',
          'botImage',
          'widgetColor',
          'widgetBorderRadius',
          'chatbotType',
        ].includes(name)
      ) {
        formValuesRef.current = {
          ...formValuesRef.current,
          [name]: value[name],
        };

        onPreviewChange({
          chatbotName: formValuesRef.current.chatbotName || '',
          initialMessage: formValuesRef.current.initialMessage || '',
          primaryColor: formValuesRef.current.primaryColor || '#000000',
          secondaryColor: formValuesRef.current.secondaryColor || '#ffffff',
          chatbotBorderRadius: formValuesRef.current.chatbotBorderRadius || 0,
          fontSize: formValuesRef.current.fontSize || 12,
          botImage: formValuesRef.current.botImage?.[0]
            ? URL.createObjectURL(formValuesRef.current.botImage[0])
            : null,
          widgetColor: formValuesRef.current.widgetColor || '#000000',
          widgetBorderRadius: formValuesRef.current.widgetBorderRadius || 0,
          chatbotType: formValuesRef.current.chatbotType || 'customer-facing',
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, onPreviewChange]);

  return (
    <>
      <Heading level={1}>Create Chatbot</Heading>
      <form action={createChatbotAction} className='space-y-8 w-1/2'>
        <div className='space-y-6'>
          <Heading level={3}>Basic Information</Heading>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Chatbot Type
            </label>
            <div className='flex space-x-4 mb-4'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='external'
                  {...register('chatbotType')}
                  className='mr-2 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600'
                />
                <span className='text-sm text-gray-700'>Customer-Facing</span>
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='internal'
                  {...register('chatbotType')}
                  className='mr-2 h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-600'
                />
                <span className='text-sm text-gray-700'>
                  Internal (within company)
                </span>
              </label>
            </div>
          </div>

          <div>
            <label
              htmlFor='chatbotName'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Chatbot Name
            </label>
            <Input
              id='chatbotName'
              {...register('chatbotName', {
                required: 'Chatbot name is required',
              })}
              placeholder='Enter chatbot name'
              className='w-full'
            />
            {errors.chatbotName && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.chatbotName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='initialMessage'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Initial Message
            </label>
            <Input
              id='initialMessage'
              {...register('initialMessage', {
                required: 'Initial message is required',
              })}
              placeholder='Welcome! How can I help you today?'
              className='w-full'
            />
            {errors.initialMessage && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.initialMessage.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='botImage'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Bot Image
            </label>
            <Input
              id='botImage'
              type='file'
              accept='image/*'
              {...register('botImage')}
            />
            {errors.botImage && (
              <p className='text-red-500 text-sm mt-1'>
                {errors.botImage.message}
              </p>
            )}
          </div>
        </div>

        {watch('chatbotType') === 'external' && (
          <>
            <div className='space-y-6'>
              <Heading level={3}>Appearance</Heading>

              <div className='grid grid-cols-2 gap-4'>
                {/* Primary Color */}
                <div>
                  <Label htmlFor='primaryColor'>Primary Color</Label>
                  <div className='flex items-center gap-2'>
                    <div className='relative w-20 h-10'>
                      <input
                        type='color'
                        id='primaryColor'
                        {...register('primaryColor')}
                        className='absolute inset-0 opacity-0 cursor-pointer'
                      />
                      <div
                        className='w-16 h-8 rounded-md border border-gray-300'
                        style={{ backgroundColor: watch('primaryColor') }}
                      />
                    </div>
                    <Input
                      value={watch('primaryColor')}
                      onChange={(e) => setValue('primaryColor', e.target.value)}
                      className='w-28'
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <Label htmlFor='secondaryColor'>Secondary Color</Label>
                  <div className='flex items-center gap-2'>
                    <div className='relative w-20 h-10'>
                      <input
                        type='color'
                        id='secondaryColor'
                        {...register('secondaryColor')}
                        className='absolute inset-0 opacity-0 cursor-pointer'
                      />
                      <div
                        className='w-16 h-8 rounded-md border border-gray-300'
                        style={{ backgroundColor: watch('secondaryColor') }}
                      />
                    </div>
                    <Input
                      value={watch('secondaryColor')}
                      onChange={(e) =>
                        setValue('secondaryColor', e.target.value)
                      }
                      className='w-28'
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Border Radius</Label>
                <input type='hidden' {...register('chatbotBorderRadius')} />
                <Slider
                  defaultValue={[0]}
                  max={20}
                  step={1}
                  onValueChange={([value]) =>
                    setValue('chatbotBorderRadius', value)
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label>Font Size</Label>
                <input type='hidden' {...register('fontSize')} />
                <Slider
                  defaultValue={[12]}
                  max={18}
                  min={12}
                  step={1}
                  onValueChange={([value]) => setValue('fontSize', value)}
                />
              </div>
            </div>

            <div className='space-y-6'>
              <Heading level={3}>Widget Customization</Heading>

              {/* Widget Color */}
              <div>
                <Label htmlFor='widgetColor'>Widget Color</Label>
                <div className='flex items-center gap-2'>
                  <div className='relative w-20 h-10'>
                    <input
                      type='color'
                      id='widgetColor'
                      {...register('widgetColor')}
                      className='absolute inset-0 opacity-0 cursor-pointer'
                    />
                    <div
                      className='w-16 h-8 rounded-md border border-gray-300'
                      style={{ backgroundColor: watch('widgetColor') }}
                    />
                  </div>
                  <Input
                    value={watch('widgetColor')}
                    onChange={(e) => setValue('widgetColor', e.target.value)}
                    className='w-28'
                  />
                </div>
              </div>

              {/* Widget Border Radius */}
              <div className='space-y-2'>
                <Label>Widget Border Radius</Label>
                <input type='hidden' {...register('widgetBorderRadius')} />
                <Slider
                  defaultValue={[0]}
                  max={28}
                  step={1}
                  onValueChange={([value]) =>
                    setValue('widgetBorderRadius', value)
                  }
                />
              </div>
            </div>
          </>
        )}

        <div className='space-y-6'>
          <Heading level={3}>Train Chatbot</Heading>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Training Method
            </label>
            <div className='flex space-x-4 mb-4'>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='files'
                  {...register('trainingMethod')}
                  className='mr-2'
                />
                Train with Files
              </label>
              <label className='flex items-center'>
                <input
                  type='radio'
                  value='urls'
                  {...register('trainingMethod')}
                  className='mr-2'
                />
                Train with URL
              </label>
            </div>
            {watch('trainingMethod') === 'files' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Files
                </label>
                {fields.map((field, index) => (
                  <div key={field.id} className='mb-2'>
                    <div className='flex items-center'>
                      <Input
                        type='file'
                        {...register(`files.${index}.file`, {
                          required: 'File is required',
                        })}
                      />
                      {index !== 0 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => remove(index)}
                          className='ml-2'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    {errors.files?.[index]?.file && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.files[index].file.message}
                      </p>
                    )}
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => append({ file: null })}
                  className='mt-2'
                >
                  <Plus className='h-4 w-4 mr-2' /> Add Another File
                </Button>
              </div>
            )}
            {watch('trainingMethod') === 'urls' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  URLs
                </label>
                {urlFields.map((field, index) => (
                  <div key={field.id} className='mb-2'>
                    <div className='flex items-center'>
                      <Input
                        type='url'
                        {...register(`urls.${index}.url`, {
                          required: 'URL is required',
                        })}
                        placeholder='Enter URL'
                        className='w-full'
                      />
                      {index !== 0 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeUrl(index)}
                          className='ml-2'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                    {errors.urls?.[index]?.url && (
                      <p className='text-red-500 text-sm mt-1'>
                        {errors.urls[index].url.message}
                      </p>
                    )}
                  </div>
                ))}
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => appendUrl({ url: '' })}
                  className='mt-2'
                >
                  <Plus className='h-4 w-4 mr-2' /> Add Another URL
                </Button>
              </div>
            )}
          </div>
        </div>

        <FormButton>Create Chatbot</FormButton>
      </form>
    </>
  );
}

function FormButton({ children }) {
  const { pending } = useFormStatus();
  return (
    <CTAButton disabled={pending}>
      {pending ? <MiniLoader className='mini-loader' /> : children}
    </CTAButton>
  );
}
