import { For, createMemo } from 'solid-js'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'

import { convertSize } from '../common/size_converter'

const PALETTE = [
    '#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#f472b6',
    '#a78bfa', '#fb923c', '#4ade80', '#f87171', '#22d3ee',
]

// Aggregate totals + a relative (percentage-of-total) breakdown bar across
// all storages. Purely a client-side aggregation of size/files_amount
// fields the API already returns for each storage.
const StorageOverview = (props) => {
    const totalSize = createMemo(() => props.storages.reduce((sum, s) => sum + (s.size || 0), 0))
    const totalFiles = createMemo(() => props.storages.reduce((sum, s) => sum + (s.files_amount || 0), 0))

    const segments = createMemo(() => {
        const total = totalSize()
        return props.storages
            .map((storage, i) => ({
                name: storage.name,
                size: storage.size || 0,
                pct: total > 0 ? ((storage.size || 0) / total) * 100 : 0,
                color: PALETTE[i % PALETTE.length],
            }))
            .filter((seg) => seg.size > 0)
    })

    return (
        <Box sx={{
            bgcolor: 'var(--bg-paper)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            p: 2.5,
            mb: 3,
        }}>
            <Box sx={{ display: 'flex', gap: 4, mb: 2, flexWrap: 'wrap' }}>
                <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted) !important', mb: 0.25 }}>
                        Total storage used
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary) !important' }}>
                        {convertSize(totalSize())}
                    </Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted) !important', mb: 0.25 }}>
                        Total files
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary) !important' }}>
                        {totalFiles()}
                    </Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-muted) !important', mb: 0.25 }}>
                        Storages
                    </Typography>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary) !important' }}>
                        {props.storages.length}
                    </Typography>
                </Box>
            </Box>

            {/* Relative breakdown bar */}
            <Box sx={{
                display: 'flex',
                width: '100%',
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                bgcolor: 'var(--bg-elevated)',
                mb: segments().length ? 1.25 : 0,
            }}>
                <For each={segments()}>
                    {(seg) => (
                        <Box
                            title={`${seg.name}: ${convertSize(seg.size)}`}
                            sx={{
                                width: `${seg.pct}%`,
                                bgcolor: seg.color,
                                minWidth: seg.pct > 0 ? '2px' : 0,
                                transition: 'width 0.3s ease',
                            }}
                        />
                    )}
                </For>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <For each={segments()}>
                    {(seg) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '2px', bgcolor: seg.color }} />
                            <Typography sx={{ fontSize: '0.75rem', color: 'var(--text-secondary) !important' }}>
                                {seg.name} · {convertSize(seg.size)}
                            </Typography>
                        </Box>
                    )}
                </For>
            </Box>
        </Box>
    )
}

export default StorageOverview
