import { OpenCvProvider, useOpenCv } from '@/services/opencv'
import { List } from '@mantine/core'


export default function OpencvTestPage() {
  return (
    <OpenCvProvider>
      <OpenCvTestComponent />
    </OpenCvProvider>
  )
}

export function OpenCvTestComponent() {
  const { loaded, cv } = useOpenCv()

  return (
    !loaded
      ? <>Loading...</>
      : (
        <List>
          {
            Object
              .keys(cv)
              .map(key => (
                <List.Item key={key}>
                  {key}
                </List.Item>
              ))
          }
        </List>
      )
  )
}
