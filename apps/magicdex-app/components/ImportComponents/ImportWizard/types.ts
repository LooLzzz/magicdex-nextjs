import { ScryfallCardData } from '@/types/scryfall'
import { CardCondition } from '@/types/supabase'


export type BaseCardData = {
  name?: string,
  amount?: number,
  set?: string,
  lang?: string,
  condition?: CardCondition | '',
  tags?: string[],
  foil?: boolean,
  signed?: boolean,
  altered?: boolean,
  misprint?: boolean,
}

const placeholderFormValues = {
  empty: {
    name: '',
    amount: '' as undefined as number,
    set: '',
    lang: '',
    condition: '',
    tags: [],
    foil: false,
    signed: false,
    altered: false,
    misprint: false,
  } as BaseCardData,
  initial: ({ set, collector_number, lang }: ScryfallCardData) => ({
    amount: 1,
    set: `${set}:${collector_number}`,
    lang,
    condition: 'NM',
    tags: [],
    foil: false,
    signed: false,
    altered: false,
    misprint: false,
  } as BaseCardData),
}

export {
  placeholderFormValues,
}
