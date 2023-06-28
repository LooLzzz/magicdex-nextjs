import { UserCardData } from '@/types/supabase'
import { roundPrecision, toTitleCase } from '@/utils'
import { Box, Flex, FlexProps, Text, TextProps, Tooltip, clsx } from '@mantine/core'
import React from 'react'


const SCRYFALL_SYMBOL_TO_MANA_FONT = {
  't': 'tap',
}

function matchAndReplace({
  value,
  regexp,
  replacer
}: {
  value: React.ReactNode | React.ReactNode[],
  regexp: RegExp,
  replacer: (match: RegExpMatchArray) => React.ReactNode
}
) {
  if (typeof value === 'string') {
    const matches = value.matchAll(regexp)
    const res = []
    let lastIndex = 0

    for (const match of matches) {
      res.push(
        <span key={lastIndex}>{value.slice(lastIndex, match.index)}</span>,
        replacer(match)
      )
      lastIndex = match.index + match[0].length
    }
    res.push(
      <span key={lastIndex}>{value.slice(lastIndex)}</span>
    )
    return res
  }

  if (Array.isArray(value))
    return value.map(item => (
      matchAndReplace({
        value: item,
        regexp,
        replacer
      })
    ))

  if (typeof value === 'object' && value?.['props']?.['children']) {
    return {
      ...value,
      props: {
        ...value['props'],
        children: matchAndReplace({
          value: value['props']['children'],
          regexp,
          replacer
        })
      }
    }
  }

  return value
}

function CardTextComponent({
  phyrexian = false,
  containsManaSymbols = false,
  containsLoyaltySymbols = false,
  manaSymbolSize = 'inherit',
  oracleText = false,
  flavorText = false,
  replaceHyphen = false,
  children: value = '',
  ...rest
}:
  Omit<TextProps, 'children'> & {
    title?: string,
    phyrexian?: boolean,
    containsManaSymbols?: boolean,
    containsLoyaltySymbols?: boolean,
    manaSymbolSize?: string | number,
    oracleText?: boolean,
    flavorText?: boolean,
    replaceHyphen?: boolean,
    children?: React.ReactNode | React.ReactNode[]
  }
) {
  value = value ?? ''

  if (replaceHyphen) {
    value = matchAndReplace({
      value: value as string,
      regexp: /—/g,
      replacer: () => '-'
    })
  }

  if (flavorText) {
    rest.ff = rest.ff ?? 'Georgia, fangsong, "Times New Roman"'
    if (phyrexian) {
      rest.ff = rest.ff ? `PhyrexianHorizontal, ${rest.ff}` : 'PhyrexianHorizontal'
      rest.style = {
        lineHeight: 1,
        wordBreak: 'break-word',
        ...rest.style
      }
    }

    rest.italic = rest.italic ?? true

    value = matchAndReplace({
      value: value as string,
      regexp: /\*(.*)\*/g,
      replacer: match => (
        <span
          key={match.index}
          style={{ fontStyle: 'normal' }}
        >
          {match[1]}
        </span>
      )
    })
  }

  if (oracleText) {
    value = matchAndReplace({
      value: value as string,
      regexp: /\(([^()]*)\)/g,
      replacer: match => (
        <span
          key={match.index}
          style={{ fontStyle: 'italic', fontSize: '0.75rem' }}
        >
          {match[0]}
        </span>
      )
    })
  }

  if (containsManaSymbols) {
    value = matchAndReplace({
      value: value as string,
      regexp: /\{([^{}]*)\}/g,
      replacer: match => {
        const symbolName = match[1].replace(/[/]/g, '').toLowerCase()
        return (
          <span
            style={{ fontSize: manaSymbolSize }}
            key={[symbolName, match.index].join(' ')}
            className={clsx([
              'ms',
              'ms-shadow',
              'ms-cost',
              `ms-${SCRYFALL_SYMBOL_TO_MANA_FONT[symbolName] || symbolName}`,
            ])}
          />
        )
      }
    })
  }

  if (containsLoyaltySymbols) {
    value = matchAndReplace({
      value: value as string,
      regexp: /^([+−-]?)([\dXx]+):/gm,
      replacer: match => {
        const classes = [
          match.index,
          `ms-loyalty-${match[2] === '0' ? 'zero' : match[1] === '+' ? 'up' : 'down'}`,
          `ms-loyalty-${match[2].toLowerCase()}`,
        ]
        return (
          <React.Fragment key={classes.join(' ')}>
            <span
              className={clsx([
                'ms',
                'ms-shadow',
                ...classes,
              ])}
            />
            :
          </React.Fragment>
        )
      }
    })
  }

  return (
    <Text
      {...rest}
      style={{
        whiteSpace: 'pre-wrap',
        cursor: 'text',
        ...rest?.style
      }}
    >
      {
        Array.isArray(value)
          ? value.map((item, idx) => (
            <React.Fragment key={idx}>
              {item}
            </React.Fragment>
          ))
          : value
      }
    </Text>
  )
}


export const CardTextSet = React.memo(
  function CardTextSet({
    data: {
      rarity,
      set,
      set_name
    },
    fontSize,
    classes = [],
    disableTitle = false,
    ...rest
  }: TextProps & {
    data: UserCardData,
    fontSize?: TextProps['style']['fontSize'],
    classes?: string[],
    disableTitle?: boolean
  }) {
    return (
      <Text
        {...rest}
        title={!disableTitle ? `${set_name} - ${toTitleCase(rarity)}` : undefined}
        style={{
          fontSize,
          lineHeight: '1.5rem',
          ...rest?.style
        }}
        className={clsx([
          'ss',
          'ss-fw',
          // 'ss-2x',
          `ss-${rarity.toLowerCase()}`,
          `ss-${set.toLowerCase()}`,
          ...classes
        ])}
      />
    )
  }
)

export const CardTextArtist = React.memo(
  function Artist({
    data: {
      artist,
    },
    fontSize = '1.25rem',
    classes = [],
    ...rest
  }: FlexProps & {
    data: UserCardData,
    fontSize?: TextProps['style']['fontSize'],
    classes?: string[],
  }) {
    return (
      <Flex
        gap={3}
        align='center'
        {...rest}
      >
        <span
          className={clsx([
            'ms',
            'ms-shadow',
            'ms-artist-nib',
            ...classes
          ])}
        />
        <CardTextComponent
          weight={400}
          ff='monospace'
          tt='uppercase'
        >
          {artist}
        </CardTextComponent>
      </Flex>
    )
  }
)

export const CardTextPowerToughness = React.memo(
  function PowerToughness({
    data: {
      power,
      toughness,
      loyalty,
    },
    fontSize = '1.25rem',
    ...rest
  }: TextProps & {
    data: UserCardData,
    fontSize?: TextProps['style']['fontSize'],
  }) {
    const nullValues = [null, undefined]
    if (nullValues.includes(power) && nullValues.includes(toughness) && nullValues.includes(loyalty))
      return undefined

    if (loyalty)
      return (
        <Box {...rest}>
          <Text
            style={{ fontSize: '2.25rem' }}
            className={clsx([
              'ms',
              'ms-shadow',
              'ms-loyalty-start',
              `ms-loyalty-${loyalty.toLowerCase()}`,
            ])}
          />
        </Box>
      )

    return (
      <Text
        ff='monospace'
        {...rest}
        style={{
          fontSize,
          ...rest?.style
        }}
      >
        {power}/{toughness}
      </Text>
    )
  }
)

export const CardTextPrice = React.memo(
  function CardPrice({
    openTooltipToSides = false,
    data: {
      amount,
      price_usd,
      foil,
      prices,
    } = {} as undefined,
    ...rest
  }: TextProps & {
    openTooltipToSides?: boolean,
    data?: UserCardData
  }) {
    if (typeof price_usd === 'undefined') {
      price_usd = Number(
        foil
          ? prices?.usd_foil
          : prices?.usd
      )

      if (!price_usd)
        price_usd = undefined
    }

    return (
      <Text
        align='center'
        {...rest}
      >
        {
          typeof price_usd === 'number'
            ? (amount ?? 1) === 1
              ? `$${price_usd}`
              : <>
                <Tooltip
                  events={{ hover: true, focus: true, touch: true }}
                  label='Price for x1'
                  {...(
                    !openTooltipToSides
                      ? {}
                      : {
                        position: 'left',
                        transitionProps: { transition: 'fade' }
                      }
                  )}
                >
                  <span>${price_usd}</span>
                </Tooltip>
                {' / '}
                <Tooltip
                  events={{ hover: true, focus: true, touch: true }}
                  label={`Price for x${amount}`}
                  {...(
                    !openTooltipToSides
                      ? {}
                      : {
                        position: 'right',
                        transitionProps: { transition: 'fade' }
                      }
                  )}
                >
                  <span>${roundPrecision(price_usd * amount, 2)}</span>
                </Tooltip>
              </>
            : <Text italic>N/A</Text>
        }
      </Text>
    )
  }
)


export const CardTextColorIndicator = React.memo(
  function CardTextSet({
    data: { color_indicator },
    fontSize,
    classes = [],
    disableTitle = false,
    ...rest
  }: TextProps & {
    data: UserCardData,
    fontSize?: TextProps['style']['fontSize'],
    classes?: string[],
    disableTitle?: boolean
  }) {
    if (!(color_indicator?.length > 0))
      return <></>

    return (
      <Text
        {...rest}
        title={!disableTitle ? color_indicator.join('') : undefined}
        style={{
          marginTop: '0.25rem',
          paddingTop: 1,
          fontSize,
          ...rest?.style
        }}
        className={clsx([
          'ms',
          'ms-ci',
          `ms-ci-${color_indicator.length}`,
          `ms-ci-${color_indicator.join('').toLowerCase()}`,
          ...classes
        ])}
      />
    )
  }
)

const CardText = React.memo(CardTextComponent)
export default CardText
