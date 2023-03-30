import { CardData } from '@/types/firestore'
import { Code, JsonInput, Text, Title } from '@mantine/core'
import React from 'react'


export default function CardsTable({
  cards,
  isLoading,
  error,
}: {
  cards: CardData[],
  isLoading: boolean,
  error?: Error,
}) {
  return (
    <Text>
      {
        error
          ? `Error loading cards: ${error}`
          : isLoading
            ? 'Loading...'
            : cards?.length === 0
              ? <Title order={3}>No cards found</Title>
              : <ul>
                {cards.map(card => (
                  <li key={card.id}>
                    {Object.keys(card).sort().map(key => (
                      <React.Fragment key={key}>
                        {key + ': '}
                        {
                          typeof card[key] === 'object'
                            ? <JsonInput sx={{ width: 800 }} autosize value={JSON.stringify(card[key])} />
                            : <Code>{card[key]}</Code>
                        }
                        <br />
                      </React.Fragment>
                    ))}
                  </li>
                ))}
              </ul>
      }
    </Text>
  )
}
