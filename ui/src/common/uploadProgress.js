import { createSignal } from 'solid-js'

// Global upload progress: null = idle, 0-100 = uploading
const [uploadProgress, setUploadProgress] = createSignal(null)

export { uploadProgress, setUploadProgress }
