
export type VerboseOperator = 'equals' | 'notEquals' | 'fuzzy' | 'arrIncludesAny' | 'arrIncludesAll' | 'arrExcludesAny' | 'lessThanOrEqualTo' | 'greaterThanOrEqualTo' | 'lessThan' | 'greaterThan'

export type UserCardQueryProps = {
  pagination?: {
    from: number,
    to: number,
  },
  globalFilter?: string,
  filters?: {
    [key: string]: {
      value: boolean | number | string | string[],
      operator: VerboseOperator,
    },
  },
  sort?: Array<{
    id: string,
    desc: boolean,
  }>,
}

export interface UserCredentials {
  email: string,
  password: string,
}

export interface getUserOptions {
  withPassword?: boolean,
}

export interface UpdateUserOptions {
  currentPassword: string,
  newName?: string,
  newPassword?: string,
  newAvatarUrl?: string,
}
