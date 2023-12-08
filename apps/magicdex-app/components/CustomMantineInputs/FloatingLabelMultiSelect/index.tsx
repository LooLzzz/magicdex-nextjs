import { Box, BoxProps, MultiSelect, MultiSelectProps } from '@mantine/core'
import { forwardRef, useState } from 'react'
import useStyles from './styles'


export type FloatingLabelMultiSelectProps = { boxRootProps?: BoxProps } & MultiSelectProps

const FloatingLabelMultiSelect = forwardRef<HTMLInputElement, FloatingLabelMultiSelectProps>(
  function FloatingLabelAutocomplete(
    { boxRootProps, onFocus, onBlur, classNames, ...props }: FloatingLabelMultiSelectProps,
    ref
  ) {
    const [focused, setFocused] = useState(false)
    const { classes } = useStyles({
      floating: focused || String(props?.value)?.trim().length !== 0
    })

    return (
      <Box
        pt='md'
        {...boxRootProps}
      >
        <MultiSelect
          ref={ref}
          {...props}
          classNames={{
            ...classes,
            ...(classNames ?? {})
          }}
          onFocus={event => { setFocused(true); onFocus?.(event) }}
          onBlur={event => { setFocused(false); onBlur?.(event) }}
        />
      </Box>
    )
  }
)

export default FloatingLabelMultiSelect
