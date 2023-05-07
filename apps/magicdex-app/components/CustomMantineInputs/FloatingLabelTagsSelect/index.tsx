import { FloatingLabelMultiSelect } from '@/components'
import { FloatingLabelMultiSelectProps } from '@/components/CustomMantineInputs'
import { useListState } from '@mantine/hooks'
import { forwardRef, useEffect } from 'react'


export type FloatingLabelTagsSelectProps = Omit<FloatingLabelMultiSelectProps, 'data' | 'searchable' | 'creatable'>

const FloatingLabelTagsSelect = forwardRef<HTMLInputElement, FloatingLabelTagsSelectProps>(
  function FloatingLabelTagsSelect(
    {
      value,
      onChange,
      ...props
    },
    ref
  ) {
    const [data, dataHandlers] = useListState([])

    useEffect(() => {
      console.log({ value })
    }, [value])

    return (
      <FloatingLabelMultiSelect
        searchable
        creatable
        clearSearchOnBlur
        ref={ref}
        data={data}
        value={value}
        onChange={onChange}
        getCreateLabel={item => `[+] Create "${item}"`}
        onCreate={item => {
          dataHandlers.append(item)
          return item
        }}
        {...props}
      />
    )
  }
)

export default FloatingLabelTagsSelect
