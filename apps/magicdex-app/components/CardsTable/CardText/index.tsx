import { UserCardData } from '@/types/supabase'
import { toTitleCase } from '@/utils'
import { clsx, Text, TextProps } from '@mantine/core'
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
  oracleText = false,
  flavorText = false,
  replaceHyphen = false,
  children: value = '',
  ...rest
}:
  Omit<TextProps, 'children'> & {
    title?: string,
    containsManaSymbols?: boolean,
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
          style={{ fontSize: 'inherit', margin: '0 1px' }}
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
