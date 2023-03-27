import {
  IconBrandDiscord,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandGoogle,
  IconBrandLinkedin,
  IconBrandTwitter,
  IconKey,
  TablerIconsProps
} from '@tabler/icons-react'


export default function AuthProviderIcon({
  providerId,
  ...props
}: { providerId: string } & TablerIconsProps
) {
  switch (providerId) {
    case 'github':
      return <IconBrandGithub {...props} />

    case 'gitlab':
      return <IconBrandGitlab {...props} />

    case 'linkedin':
      return <IconBrandLinkedin {...props} />

    case 'facebook':
      return <IconBrandFacebook {...props} />

    case 'twitter':
      return <IconBrandTwitter {...props} />

    case 'google':
      return <IconBrandGoogle {...props} />

    case 'discord':
      return <IconBrandDiscord {...props} />

    default:
      return <IconKey {...props} />
  }
}
