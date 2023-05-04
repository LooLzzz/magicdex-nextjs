import {
  Autocomplete,
  AutocompleteProps,
  Box,
  BoxProps,
  CloseButton,
  Loader,
  LoaderProps,
  rem
} from '@mantine/core'
import { forwardRef, useState } from 'react'
import useStyles from './styles'


export type FloatingLabelAutocompleteProps = AutocompleteProps & {
  loading?: boolean,
  loaderProps?: LoaderProps,
  boxRootProps?: BoxProps
}

const FloatingLabelAutocomplete = forwardRef<HTMLInputElement, FloatingLabelAutocompleteProps>(
  function FloatingLabelAutocomplete(
    { loading = false, loaderProps, boxRootProps, onFocus, onBlur, onChange, classNames, ...props }: FloatingLabelAutocompleteProps,
    ref
  ) {
    const [focused, setFocused] = useState(false)
    const { classes } = useStyles({
      floating: focused || String(props?.value)?.trim().length !== 0
    })

    return (
      <Box
        pt='xs'
        {...boxRootProps}
      >
        <Autocomplete
          ref={ref}
          {...props}
          classNames={{
            ...classes,
            ...(classNames ?? {})
          }}
          onFocus={event => { setFocused(true); onFocus?.(event) }}
          onBlur={event => { setFocused(false); onBlur?.(event) }}
          onChange={onChange}
          rightSection={
            loading
              ? <Loader m={rem(7.5)} {...loaderProps} />
              : props.value
                ? <CloseButton onClick={() => onChange?.('')} />
                : undefined
          }
        />
      </Box>
    )
  }
)

export default FloatingLabelAutocomplete
