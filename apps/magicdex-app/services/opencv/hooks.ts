import { useContext } from 'react'
import { OpenCvContext } from './providers'


export const useOpenCv = () => useContext(OpenCvContext)
