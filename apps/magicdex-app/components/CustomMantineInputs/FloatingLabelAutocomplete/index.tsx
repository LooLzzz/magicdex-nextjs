import {
  Autocomplete,
  AutocompleteProps,
  Box,
  BoxProps,
  CloseButton,
  Loader,
  LoaderProps,
  Text,
  Tooltip,
  rem
} from '@mantine/core'
import { useHover } from '@mantine/hooks'
import { IconInfoCircle as IconInfo } from '@tabler/icons-react'
import { forwardRef, useState } from 'react'
import useStyles from './styles'


export type FloatingLabelAutocompleteProps = AutocompleteProps & {
  loading?: boolean,
  loaderProps?: LoaderProps,
  boxRootProps?: BoxProps
}

const FloatingLabelAutocomplete = forwardRef<HTMLInputElement, FloatingLabelAutocompleteProps>(
  function FloatingLabelAutocomplete(
    {
      loading = false,
      loaderProps,
      boxRootProps,
      description,
      onFocus,
      onBlur,
      onChange,
      classNames,
      ...props
    }: FloatingLabelAutocompleteProps,
    ref
  ) {
    const { hovered: descriptionHovered, ref: descriptionRef } = useHover()
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
                : description
                  ? (
                    <Tooltip
                      withArrow
                      offset={12.5}
                      events={{ hover: true, focus: true, touch: true }}
                      label={description}
                      position='top-end'
                      transitionProps={{ transition: 'pop-bottom-right' }}
                    >
                      <Text
                        ref={descriptionRef}
                        color={descriptionHovered ? 'theme' : 'dimmed'}
                      >
                        <IconInfo size='1.25em' stroke={1.5} />
                      </Text>
                    </Tooltip>
                  )
                  : undefined
          }
        />
      </Box>
    )
  }
)

export default FloatingLabelAutocomplete
