import { FloatingLabelMultiSelect } from '@/components'
import { FloatingLabelMultiSelectProps } from '@/components/CustomMantineInputs'
import { useListState } from '@mantine/hooks'
import { forwardRef, useCallback } from 'react'


export type FloatingLabelTagsSelectProps = Omit<FloatingLabelMultiSelectProps, 'data' | 'searchable' | 'creatable'> & {
  initialDataValue?: string[],
}

const FloatingLabelTagsSelect = forwardRef<HTMLInputElement, FloatingLabelTagsSelectProps>(
  function FloatingLabelTagsSelect(
    {
      value,
      onChange,
      initialDataValue,
      ...props
    },
    ref
  ) {
    const [data, dataHandlers] = useListState(initialDataValue ?? [])

    const handleOnChange = useCallback((value: string[]) => {
      dataHandlers.setState(value)
      onChange?.(value)
    }, [dataHandlers, onChange])

    return (
      <FloatingLabelMultiSelect
        searchable
        creatable
        clearSearchOnBlur
        ref={ref}
        data={data}
        value={value}
        onChange={handleOnChange}
        getCreateLabel={item => `[+] Create "${item.toLowerCase()}"`}
        onCreate={item => {
          item = item.toLowerCase()
          dataHandlers.append(item)
          return item
        }}
        {...props}
      />
    )
  }
)

export default FloatingLabelTagsSelect
