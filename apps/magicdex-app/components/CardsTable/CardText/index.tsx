import { UserCardData } from '@/types/supabase'
import { roundPrecision, toTitleCase } from '@/utils'
import { Flex, FlexProps, Text, TextProps, Tooltip, clsx } from '@mantine/core'
import React from 'react'


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

export default function CardText({
  containsManaSymbols = false,
  manaSymbolSize = 'inherit',
  oracleText = false,
  flavorText = false,
  replaceHyphen = false,
  children: value = '',
  ...rest
}:
  Omit<TextProps, 'children'> & {
    title?: string,
    containsManaSymbols?: boolean,
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
      replacer: match => (
        <span
          style={{ fontSize: manaSymbolSize }}
          key={match.index}
          className={clsx([
            'ms',
            'ms-shadow',
            'ms-cost',
            `ms-${match[1].replace(/[/]/g, '').toLowerCase()}`,
          ])}
        />
      )
    })
  }

  return (
    <Text
      {...rest}
      style={{
        // lineHeight: '1.5rem',
        // baselineShift: 'sub',
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


CardText.Set = function CardTextSet({
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

CardText.Artist = function Artist({
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
      <CardText
        weight={400}
        ff='monospace'
        tt='uppercase'
      >
        {artist}
      </CardText>
    </Flex>
  )
}

CardText.PowerToughness = function PowerToughness({
  data: {
    power,
    toughness,
  },
  fontSize = '1.25rem',
  ...rest
}: TextProps & {
  data: UserCardData,
  fontSize?: TextProps['style']['fontSize'],
}) {
  const nullValues = [null, undefined]
  if (nullValues.includes(power) && nullValues.includes(toughness))
    return undefined

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

export function CardPrice({
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
