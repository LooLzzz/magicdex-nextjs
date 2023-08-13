import { createContext, useEffect, useState } from 'react'
import Cv from './types'

const OpenCvContext = createContext<{ loaded: boolean, cv: typeof Cv }>(null)

const { Consumer: OpenCvConsumer, Provider } = OpenCvContext

export { OpenCvConsumer, OpenCvContext }

const scriptId = 'opencv-react'
const moduleConfig = {
  wasmBinaryFile: 'opencv_js.wasm',
  usingWasm: true
}

export const OpenCvProvider = ({
  openCvVersion = '4.8.0',
  openCvPath = '',
  children
}) => {
  const [cvInstance, setCvInstance] = useState({
    loaded: false,
    cv: null
  })

  useEffect(() => {
    if (document.getElementById(scriptId) || window?.['cv']) {
      return
    }

    // https://docs.opencv.org/3.4/dc/de6/tutorial_js_nodejs.html
    // https://medium.com/code-divoire/integrating-opencv-js-with-an-angular-application-20ae11c7e217
    // https://stackoverflow.com/questions/56671436/cv-mat-is-not-a-constructor-opencv
    moduleConfig['onRuntimeInitialized'] = () => {
      setCvInstance({ loaded: true, cv: window?.['cv'] })
    }
    window['Module'] = moduleConfig

    const generateOpenCvScriptTag = () => {
      const opencvScriptTag = document.createElement('script')
      opencvScriptTag.id = scriptId
      opencvScriptTag.src = openCvPath || `https://docs.opencv.org/${openCvVersion}/opencv.js`

      // @ts-ignore
      opencvScriptTag.nonce = true
      opencvScriptTag.defer = true
      opencvScriptTag.async = true

      return opencvScriptTag
    }

    document.body.appendChild(generateOpenCvScriptTag())
  }, [openCvPath, openCvVersion])

  return (
    <Provider value={cvInstance}>
      {children}
    </Provider>
  )
}
