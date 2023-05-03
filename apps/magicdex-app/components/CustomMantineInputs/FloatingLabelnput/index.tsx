import {
  Box,
  BoxProps,
  NumberInput,
  NumberInputProps,
  PasswordInput,
  PasswordInputProps,
  TextInput,
  TextInputProps
} from '@mantine/core'
import { forwardRef, useState } from 'react'
import useStyles from './styles'


export type FloatingLabelTextInputProps = { boxRootProps?: BoxProps } & TextInputProps
export type FloatingLabelNumberInputProps = { boxRootProps?: BoxProps } & NumberInputProps
export type FloatingLabelPasswordInputProps = { boxRootProps?: BoxProps } & PasswordInputProps

const FloatingLabelTextInput = forwardRef<HTMLInputElement, FloatingLabelTextInputProps>(
  function FloatingLabelTextInput(
    { boxRootProps, onFocus, onBlur, classNames, ...props }: FloatingLabelTextInputProps,
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
        <TextInput
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

const FloatingLabelNumberInput = forwardRef<HTMLInputElement, FloatingLabelNumberInputProps>(
  function FloatingLabelNumberInput(
    { boxRootProps, onFocus, onBlur, classNames, ...props }: FloatingLabelNumberInputProps,
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
        <NumberInput
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

const FloatingLabelPasswordInput = forwardRef<HTMLInputElement, FloatingLabelPasswordInputProps>(
  function FloatingLabelPasswordInput(
    { boxRootProps, onFocus, onBlur, classNames, ...props }: FloatingLabelPasswordInputProps,
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
        <PasswordInput
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

export {
  FloatingLabelTextInput,
  FloatingLabelNumberInput,
  FloatingLabelPasswordInput,
}
