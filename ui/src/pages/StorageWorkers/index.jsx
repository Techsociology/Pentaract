import Typography from '@suid/material/Typography'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import Table from '@suid/material/Table'
import TableBody from '@suid/material/TableBody'
import TableCell from '@suid/material/TableCell'
import TableContainer from '@suid/material/TableContainer'
import TableHead from '@suid/material/TableHead'
import TableRow from '@suid/material/TableRow'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import AddIcon from '@suid/icons-material/Add'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'

const StorageWorkers = () => {
    const [storageWorkers, setStorageWorkers] = createSignal([])
    const navigate = useNavigate()

    onMount(async () => {
        const storageWorkers = await API.storageWorkers.listStorageWorkers()
        setStorageWorkers(storageWorkers)
    })

    return (
        <Box sx={{ animation: 'fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1) both' }}>
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
            }}>
                <Box>
                    <Typography variant="h4" sx={{
                        fontSize: '1.6rem !important',
                        fontWeight: '700 !important',
                        letterSpacing: '-0.03em !important',
                        color: 'var(--text-primary) !important',
                        lineHeight: 1.2,
                    }}>
                        Storage Workers
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary) !important',
                        mt: 0.5,
                    }}>
                        Manage Telegram bot workers for your storages
                    </Typography>
                </Box>

                <Button
                    onClick={() => navigate('/storage_workers/register')}
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ px: 2.5 }}
                >
                    Register worker
                </Button>
            </Box>

            <Show
                when={storageWorkers().length}
                fallback={
                    <Box sx={{
                        textAlign: 'center',
                        py: 10,
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        bgcolor: 'var(--bg-paper)',
                    }}>
                        <SmartToyIcon sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 2 }} />
                        <Typography sx={{ color: 'var(--text-secondary) !important', mb: 1, fontWeight: 500 }}>
                            No workers registered
                        </Typography>
                        <Typography sx={{ color: 'var(--text-muted) !important', fontSize: '0.85rem', mb: 3 }}>
                            Register a Telegram bot as a storage worker
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/storage_workers/register')}
                            size="small"
                        >
                            Register worker
                        </Button>
                    </Box>
                }
            >
                <TableContainer>
                    <Table sx={{ minWidth: 600 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Storage ID</TableCell>
                                <TableCell>Token</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mapArray(storageWorkers, (sw) => (
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 32, height: 32, borderRadius: '8px',
                                                bgcolor: 'var(--accent-dim)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                <SmartToyIcon sx={{ fontSize: '1rem', color: 'var(--accent-light) !important' }} />
                                            </Box>
                                            <Typography sx={{ fontWeight: '600 !important', color: 'var(--text-primary) !important', fontSize: '0.9rem' }}>
                                                {sw.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{
                                            fontFamily: 'JetBrains Mono, monospace !important',
                                            fontSize: '0.78rem !important',
                                            color: 'var(--text-secondary) !important',
                                            bgcolor: 'var(--bg-elevated)',
                                            px: 1, py: 0.25, borderRadius: '4px', display: 'inline-block',
                                        }}>
                                            {sw.storage_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{
                                            fontFamily: 'JetBrains Mono, monospace !important',
                                            fontSize: '0.78rem !important',
                                            color: 'var(--text-muted) !important',
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            display: 'block',
                                        }}>
                                            {sw.token}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Show>
        </Box>
    )
}

export default StorageWorkers
