import {
  PasswordInput,
  PasswordInputProps,
  Select,
  SelectProps,
  TextInput,
  TextInputProps
} from '@mantine/core'
import useStyles from './styles'


export function ContainedTextInput({
  password = false,
  ...inputProps
}:
  (TextInputProps | PasswordInputProps) & { password?: boolean }
) {
  const { classes } = useStyles()

  return (
    <>
      {
        password
          ? <PasswordInput
            {...inputProps}
            classNames={classes}
          />
          : <TextInput
            {...inputProps}
            classNames={classes}
          />
      }
    </>
  )
}

export function ContainedTextSelect({ ...inputProps }: SelectProps) {
  const { classes } = useStyles()

  return (
    <Select
      {...inputProps}
      classNames={classes}
    />
  )
}
