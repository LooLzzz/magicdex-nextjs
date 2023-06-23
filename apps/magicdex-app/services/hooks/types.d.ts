import { CardCondition } from '@/types/supabase'


export type UserCardMutationVariable = {
  id?: string,
  altered: boolean,
  amount: number,
  condition: CardCondition,
  foil: boolean,
  misprint: boolean,
  scryfall_id: string,
  signed: boolean,
  tags: string[],
  override_card_data: Record<string, unknown>,
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
    insertedRowCount: number,
    updatedRowCount: number,
    deletedRowCount: number,
  },
}

export type UserCardMetadata = {
  totalRowCount: number,
  allSets: Array<{
    set_name: string,
    set_id: string,
    released_at: string,
  }>,
}
