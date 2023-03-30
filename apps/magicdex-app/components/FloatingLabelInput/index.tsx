import { PasswordInput, PasswordInputProps, TextInput, TextInputProps } from '@mantine/core'
import { useState } from 'react'
import useStyles from './styles'


export default function FloatingLabelInput({
  password = false,
  ...inputProps
}: (TextInputProps | PasswordInputProps) & { password?: boolean }) {
  const [focused, setFocused] = useState(false)

  const { classes } = useStyles({ floating: String(inputProps?.value)?.trim().length !== 0 || focused })

  return (
    <>
      {
        password
          ? <PasswordInput
            {...inputProps}
            classNames={classes}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          : <TextInput
            {...inputProps}
            classNames={classes}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
      }
    </>
  )
}
