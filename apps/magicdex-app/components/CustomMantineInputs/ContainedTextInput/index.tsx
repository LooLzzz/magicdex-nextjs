import {
  Autocomplete,
  AutocompleteProps,
  PasswordInput,
  PasswordInputProps,
  Select,
  SelectProps,
  TextInput,
  TextInputProps
} from '@mantine/core'
import useStyles from './styles'


export default function ContainedTextInput({
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

export function ContainedAutocomplete({ ...inputProps }: AutocompleteProps) {
  const { classes } = useStyles()

  return (
    <Autocomplete
      {...inputProps}
      classNames={classes}
    />
  )
}
