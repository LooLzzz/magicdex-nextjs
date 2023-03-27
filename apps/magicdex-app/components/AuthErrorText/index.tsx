import { Text, TextProps } from '@mantine/core'


export type AuthErrorType = (
  'OAuthSignin'
  | 'OAuthCallback'
  | 'OAuthCreateAccount'
  | 'EmailCreateAccount'
  | 'Callback'
  | 'OAuthAccountNotLinked'
  | 'EmailSignin'
  | 'CredentialsSignin'
  | 'SessionRequired'
  | 'Default'
)

export function AuthErrorMapper(errorType: string) {
  switch (errorType) {
    case 'OAuthSignin':
      return 'Error in constructing an authorization URL'

    case 'OAuthCallback':
      return 'Error in handling the response from the OAuth provider'

    case 'OAuthCreateAccount':
      return 'Could not create OAuth provider user in the database'

    case 'EmailCreateAccount':
      return 'Could not create email provider user in the database'

    case 'Callback':
      return 'Error in the OAuth callback handler route'

    case 'OAuthAccountNotLinked':
      return 'Account is already linked, but not with this OAuth account'

    case 'EmailSignin':
      return 'Sending the e-mail with the verification token failed'

    case 'CredentialsSignin':
    case 'SessionRequired':
    case 'Default':
      return 'Error signing in'

    default:
      return errorType
  }
}

export default function AuthErrorText({
  errorType,
  ...props
}: { errorType: AuthErrorType } & TextProps
) {
  return (
    <Text {...props}>
      {AuthErrorMapper(errorType)}
    </Text>
  )
}
