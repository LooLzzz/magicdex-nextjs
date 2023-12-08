import { Box, BoxProps, Loader, LoaderProps, Select, SelectProps, rem } from '@mantine/core'
import { forwardRef, useState } from 'react'
import useStyles from './styles'


export type FloatingLabelSelectProps = SelectProps & {
  loading?: boolean,
  loaderProps?: LoaderProps,
  boxRootProps?: BoxProps
}

const FloatingLabelSelect = forwardRef<HTMLInputElement, FloatingLabelSelectProps>(
  function FloatingLabelSelect(
    { loading = false, loaderProps, boxRootProps, onFocus, onBlur, classNames, ...props }: FloatingLabelSelectProps,
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
        <Select
          ref={ref}
          {...props}
          classNames={{
            ...classes,
            ...(classNames ?? {})
          }}
          onFocus={event => { setFocused(true); onFocus?.(event) }}
          onBlur={event => { setFocused(false); onBlur?.(event) }}
          rightSection={loading ? <Loader m={rem(7.5)} {...loaderProps} /> : undefined}
        />
      </Box>
    )
  }
)

export default FloatingLabelSelect
