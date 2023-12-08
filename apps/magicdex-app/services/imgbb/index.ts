import axios from 'axios'
import routes from './routes'


export interface ImageBBUploadOptions {
  name?: string,
  expiration?: number,
}

export interface ImageBBUploadResponse {
  data: {
    id: string,
    title: string,
    url_viewer: string,
    url: string,
    display_url: string,
    width: string,
    height: string,
    size: string,
    time: string,
    expiration: string,
    image: {
      filename: string,
      name: string,
      mime: string,
      extension: string,
      url: string,
    },
    thumb: {
      filename: string,
      name: string,
      mime: string,
      extension: string,
      url: string,
    },
    medium: {
      filename: string,
      name: string,
      mime: string,
      extension: string,
      url: string,
    },
    delete_url: string,
  },
  success: boolean,
  status: number,
}

export const uploadImage = async (file: File, options: ImageBBUploadOptions = {}): Promise<ImageBBUploadResponse> => {
  const { name, expiration } = options
  const formData = new FormData()
  formData.append('image', file)

  const { data } = await axios.post(
    routes.upload,
    formData,
    {
      params: {
        name,
        expiration,
        key: process.env.NEXT_PUBLIC_IMGBB_API_KEY,
      },
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )

  return data
}
