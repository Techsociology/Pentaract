import { alertStore } from '../components/AlertStack'
import { setUploadProgress } from '../common/uploadProgress'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

/**
 * @typedef {'get' | 'post' | 'patch' | 'delete'} Method
 */

const apiRequest = async (
    path,
    method,
    auth_token,
    body,
    return_response = false
) => {
    const { addAlert } = alertStore

    const fullpath = `${API_BASE}${path}`

    const headers = new Headers()
    headers.append('Content-Type', 'application/json')
    if (auth_token) {
        headers.append('Authorization', auth_token)
    }

    try {
        const response = await fetch(fullpath, {
            method,
            body: JSON.stringify(body),
            headers,
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        if (return_response) {
            return response
        }

        try {
            return await response.json()
        } catch {}
    } catch (err) {
        addAlert(err.message, 'error')
        throw err
    }
}

/**
 * Multipart upload with real XHR progress tracking
 */
export const apiMultipartRequest = (path, auth_token, form) => {
    const { addAlert } = alertStore
    const fullpath = `${API_BASE}${path}`

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100)
                setUploadProgress(pct)
            }
        })

        xhr.upload.addEventListener('loadstart', () => {
            setUploadProgress(0)
        })

        xhr.upload.addEventListener('load', () => {
            // Keep at 100 briefly while server responds
            setUploadProgress(100)
        })

        xhr.addEventListener('load', () => {
            setUploadProgress(null)

            if (xhr.status < 200 || xhr.status >= 300) {
                const msg = xhr.responseText || `Upload failed (${xhr.status})`
                addAlert(msg, 'error')
                return reject(new Error(msg))
            }

            try {
                resolve(JSON.parse(xhr.responseText))
            } catch {
                resolve()
            }
        })

        xhr.addEventListener('error', () => {
            setUploadProgress(null)
            const msg = 'Network error during upload'
            addAlert(msg, 'error')
            reject(new Error(msg))
        })

        xhr.addEventListener('abort', () => {
            setUploadProgress(null)
            reject(new Error('Upload aborted'))
        })

        xhr.open('POST', fullpath)
        if (auth_token) {
            xhr.setRequestHeader('Authorization', auth_token)
        }
        xhr.send(form)
    })
}

export default apiRequest
