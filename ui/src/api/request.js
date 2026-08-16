import { alertStore } from '../components/AlertStack'
import { setUploadProgress } from '../common/uploadProgress'
import createLocalStore from '../../libs'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

/**
 * @typedef {'get' | 'post' | 'patch' | 'delete'} Method
 */

// Guards against multiple concurrent requests each triggering their own
// refresh call when the access token expires.
let refreshInFlight = null

const refreshAccessToken = async () => {
    const [store, setStore] = createLocalStore()
    const refresh_token = store.refresh_token

    if (!refresh_token) {
        return null
    }

    if (!refreshInFlight) {
        refreshInFlight = fetch(`${API_BASE}/auth/refresh`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token }),
        })
            .then(async (res) => {
                if (!res.ok) return null
                return await res.json()
            })
            .catch(() => null)
            .finally(() => {
                refreshInFlight = null
            })
    }

    const result = await refreshInFlight
    if (result?.access_token) {
        setStore('access_token', result.access_token)
        return result.access_token
    }

    // refresh token is invalid/expired: clear session and send the user back
    // to login, since their access token is also about to be rejected.
    setStore('access_token', undefined)
    setStore('refresh_token', undefined)
    setStore('redirect', window.location.pathname)

    const { addAlert } = alertStore
    addAlert('Your session has expired. Please log in again.', 'error')
    window.location.href = '/login'

    return null
}

const apiRequest = async (
    path,
    method,
    auth_token,
    body,
    return_response = false,
    _isRetry = false
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

        if (response.status === 401 && auth_token && !_isRetry) {
            const newAccessToken = await refreshAccessToken()
            if (newAccessToken) {
                return await apiRequest(
                    path,
                    method,
                    `Bearer ${newAccessToken}`,
                    body,
                    return_response,
                    true
                )
            }
        }

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
