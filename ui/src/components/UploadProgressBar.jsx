import { Show } from 'solid-js'
import Box from '@suid/material/Box'
import LinearProgress from '@suid/material/LinearProgress'
import Typography from '@suid/material/Typography'

import { uploadProgress } from '../common/uploadProgress'

// Slim bar fixed under the header, visible only while a file is uploading.
// Reads the existing global uploadProgress signal (0-100, or null when idle).
const UploadProgressBar = () => {
    return (
        <Show when={uploadProgress() !== null}>
            <Box
                sx={{
                    position: 'fixed',
                    top: '60px',
                    left: 0,
                    right: 0,
                    zIndex: 1201,
                    bgcolor: 'var(--bg-paper)',
                    borderBottom: '1px solid var(--border)',
                    px: 2,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    boxShadow: 'var(--shadow-sm)',
                }}
            >
                <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary) !important', whiteSpace: 'nowrap' }}>
                    Uploading… {uploadProgress()}%
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={uploadProgress()}
                    sx={{
                        flexGrow: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'var(--bg-elevated)',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            bgcolor: 'var(--accent-light)',
                        },
                    }}
                />
            </Box>
        </Show>
    )
}

export default UploadProgressBar
