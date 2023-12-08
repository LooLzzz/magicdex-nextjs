import {
  ActionIcon,
  Flex,
  FlexProps,
  MantineNumberSize,
  NumberInput,
  NumberInputHandlers,
  NumberInputProps
} from '@mantine/core'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import { forwardRef, useRef, useState } from 'react'
import useStyles from './styles'

export interface QuantityInputProps extends NumberInputProps {
  actionIconSize?: MantineNumberSize,
  flexRootProps?: FlexProps,
}

const QuantityInput = forwardRef<HTMLInputElement, QuantityInputProps>(
  function QuantityInput({
    min,
    max,
    disabled,
    onChange,
    onFocus,
    onBlur,
    value,
    actionIconSize,
    flexRootProps,
    ...props
  }: QuantityInputProps,
    ref
  ) {
    const handlers = useRef<NumberInputHandlers>(null)
    const [focused, setFocused] = useState(false)
    const { classes, cx } = useStyles({
      disabled,
      floating: focused || String(value)?.trim().length !== 0
    })

    return (
      <Flex
        wrap='nowrap'
        mt='md'
        px='8px'
        py='5px'
        align='center'
        {...flexRootProps}
        className={cx([
          classes.flexWrapper,
          flexRootProps?.className
        ])}
      >
        <ActionIcon
          size={actionIconSize}
          variant='transparent'
          onClick={() => handlers.current?.decrement()}
          disabled={value === min || disabled}
          className={classes.controls}
          onMouseDown={e => e.preventDefault()}
        >
          <IconMinus size='1rem' stroke={1.5} />
        </ActionIcon>

        <NumberInput
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          onFocus={event => { setFocused(true); onFocus?.(event) }}
          onBlur={event => { setFocused(false); onBlur?.(event) }}
          disabled={disabled}
          {...props}
          ref={ref}
          handlersRef={handlers}
          variant='unstyled'
          classNames={{
            root: classes.root,
            label: classes.label,
            required: classes.required,
            input: classes.input,
            wrapper: classes.wrapper,
          }}
        />

        <ActionIcon
          size={actionIconSize}
          variant='transparent'
          onClick={() => handlers.current?.increment()}
          disabled={value === max || disabled}
          className={classes.controls}
          onMouseDown={e => e.preventDefault()}
        >
          <IconPlus size='1rem' stroke={1.5} />
        </ActionIcon>
      </Flex>
    )
  }
)

export default QuantityInput
