import Typography from '@suid/material/Typography'
import Box from '@suid/material/Box'
import Button from '@suid/material/Button'
import Table from '@suid/material/Table'
import TableBody from '@suid/material/TableBody'
import TableCell from '@suid/material/TableCell'
import TableContainer from '@suid/material/TableContainer'
import TableHead from '@suid/material/TableHead'
import TableRow from '@suid/material/TableRow'
import StorageIcon from '@suid/icons-material/Storage'
import AddIcon from '@suid/icons-material/Add'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import { Show, createSignal, mapArray, onMount } from 'solid-js'
import { useNavigate } from '@solidjs/router'

import API from '../../api'
import { convertSize } from '../../common/size_converter'

const Storages = () => {
    const [storages, setStorages] = createSignal([])
    const navigate = useNavigate()

    onMount(async () => {
        const storagesSchema = await API.storages.listStorages()
        setStorages(storagesSchema.storages)
    })

    return (
        <Box sx={{ animation: 'fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1) both' }}>
            {/* Page header */}
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
                        Storages
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary) !important',
                        mt: 0.5,
                    }}>
                        Manage your Telegram-backed file storages
                    </Typography>
                </Box>

                <Button
                    onClick={() => navigate('/storages/register')}
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    sx={{ px: 2.5 }}
                >
                    Register storage
                </Button>
            </Box>

            {/* Table */}
            <Show
                when={storages().length}
                fallback={
                    <Box sx={{
                        textAlign: 'center',
                        py: 10,
                        border: '1px dashed var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        bgcolor: 'var(--bg-paper)',
                    }}>
                        <StorageIcon sx={{ fontSize: 40, color: 'var(--text-muted)', mb: 2 }} />
                        <Typography sx={{ color: 'var(--text-secondary) !important', mb: 1, fontWeight: 500 }}>
                            No storages yet
                        </Typography>
                        <Typography sx={{ color: 'var(--text-muted) !important', fontSize: '0.85rem', mb: 3 }}>
                            Register your first Telegram storage to get started
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/storages/register')}
                            size="small"
                        >
                            Register storage
                        </Button>
                    </Box>
                }
            >
                <TableContainer>
                    <Table sx={{ minWidth: 600 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Chat ID</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Files</TableCell>
                                <TableCell align="right"></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {mapArray(storages, (storage) => (
                                <TableRow
                                    onClick={() => navigate(`/storages/${storage.id}/files`)}
                                    sx={{
                                        cursor: 'pointer',
                                        '&:last-child td, &:last-child th': { border: 0 },
                                    }}
                                >
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: '8px',
                                                bgcolor: 'var(--accent-dim)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <StorageIcon sx={{ fontSize: '1rem', color: 'var(--accent-light) !important' }} />
                                            </Box>
                                            <Typography sx={{
                                                fontWeight: '600 !important',
                                                color: 'var(--text-primary) !important',
                                                fontSize: '0.9rem',
                                            }}>
                                                {storage.name}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{
                                            fontFamily: 'JetBrains Mono, monospace !important',
                                            fontSize: '0.78rem !important',
                                            color: 'var(--text-secondary) !important',
                                            bgcolor: 'var(--bg-elevated)',
                                            px: 1,
                                            py: 0.25,
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                        }}>
                                            {storage.chat_id}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography sx={{
                                            color: 'var(--text-primary) !important',
                                            fontWeight: '500 !important',
                                            fontSize: '0.875rem',
                                        }}>
                                            {convertSize(storage.size)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            bgcolor: 'var(--accent-dim)',
                                            color: 'var(--accent-light)',
                                            px: 1.25,
                                            py: 0.25,
                                            borderRadius: '20px',
                                            fontSize: '0.78rem',
                                            fontWeight: 600,
                                        }}>
                                            {storage.files_amount} files
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <ChevronRightIcon sx={{ fontSize: '1.1rem', color: 'var(--text-muted)' }} />
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

export default Storages
