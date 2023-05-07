import { CardCondition } from '@/types/supabase'


export type UserCardMutationVariable = {
  altered: boolean,
  amount: number,
  condition: CardCondition,
  foil: boolean,
  misprint: boolean,
  scryfall_id: string,
  signed: boolean,
  tags: string[],
  override_card_data: object,
}

/**
 * The variables sent to the mutation.
 */
export type UserCardMutationVariables = Array<UserCardMutationVariable>

/**
 * The data returned from the mutation.
 */
export type UserCardMutationData = {
  affectedRows: UserCardMutationVariables,
  metadata: {
    affectedRowCount: number,
    insertedRowCount: number,
    updatedRowCount: number,
  },
}
