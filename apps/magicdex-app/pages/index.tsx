import { HomePage } from '@/components'
import styled from '@emotion/styled'


const StyledLayout = styled.div`
  .page {
  }

  .header {
  }

  .main {
  }

  .footer {
  }
`

export default function Layout() {
  return (
    <StyledLayout className='page'>
      <div className='header'>
        im header
      </div>

      <div className='main'>
        <HomePage />
      </div>

      <div className='footer'>
        im footer
      </div>
    </StyledLayout>
  )
}
