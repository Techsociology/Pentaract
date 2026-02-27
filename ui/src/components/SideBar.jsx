import List from '@suid/material/List'
import ListItemButton from '@suid/material/ListItemButton'
import Drawer from '@suid/material/Drawer'
import Divider from '@suid/material/Divider'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import LightModeIcon from '@suid/icons-material/LightMode'
import DarkModeIcon from '@suid/icons-material/DarkMode'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import { createSignal, useContext, Show } from 'solid-js'
import SideBarItem from './SideBarItem'
import { ColorModeContext } from '../ColorModeContext'

export default function SideBar() {
    const [open, setOpen] = createSignal(true)
    const { mode, toggleColorMode } = useContext(ColorModeContext)

    const toggleDrawerOpen = () => setOpen(!open())

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open() ? 248 : 68,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: open() ? 248 : 68,
                    boxSizing: 'border-box',
                    position: 'relative',
                },
            }}
        >
            {/* Header row */}
            <Box sx={{
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: open() ? 'space-between' : 'center',
                px: open() ? 2 : 1,
                borderBottom: '1px solid var(--border)',
            }}>
                <Show when={open()}>
                    <Typography sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted) !important',
                    }}>
                        Navigation
                    </Typography>
                </Show>
                <ListItemButton
                    onClick={toggleDrawerOpen}
                    sx={{
                        borderRadius: 'var(--radius-md) !important',
                        p: '6px !important',
                        minWidth: 0,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        transition: 'all 0.2s !important',
                        '&:hover': {
                            bgcolor: 'var(--bg-elevated) !important',
                            color: 'var(--text-secondary)',
                        },
                    }}
                >
                    <Show when={open()} fallback={<ChevronRightIcon sx={{ fontSize: '1rem' }} />}>
                        <ChevronLeftIcon sx={{ fontSize: '1rem' }} />
                    </Show>
                </ListItemButton>
            </Box>

            {/* Nav items */}
            <List sx={{ px: 1, pt: 1.5, flex: 1 }}>
                <Show when={open()}>
                    <Typography sx={{
                        px: 1.5,
                        pb: 0.75,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: 'var(--text-muted) !important',
                    }}>
                        Storage
                    </Typography>
                </Show>
                <SideBarItem text="Storages" link="/storages" isFull={open()}>
                    <StorageIcon />
                </SideBarItem>
                <SideBarItem text="Workers" link="/storage_workers" isFull={open()}>
                    <SmartToyIcon />
                </SideBarItem>
            </List>

            <Divider />

            {/* Theme toggle */}
            <Box sx={{
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: open() ? 'space-between' : 'center',
            }}>
                <Show when={open()}>
                    <Typography sx={{
                        px: 0.5,
                        fontSize: '0.78rem',
                        color: 'var(--text-muted) !important',
                        fontWeight: 500,
                    }}>
                        {mode() === 'dark' ? 'Dark mode' : 'Light mode'}
                    </Typography>
                </Show>
                <ListItemButton
                    onClick={toggleColorMode}
                    sx={{
                        borderRadius: 'var(--radius-md) !important',
                        p: '6px !important',
                        minWidth: 0,
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        transition: 'all 0.2s !important',
                        '&:hover': {
                            bgcolor: 'var(--bg-elevated) !important',
                            color: 'var(--accent-light)',
                        },
                    }}
                >
                    <Show when={mode() === 'dark'}
                        fallback={<DarkModeIcon sx={{ fontSize: '1rem' }} />}
                    >
                        <LightModeIcon sx={{ fontSize: '1rem' }} />
                    </Show>
                </ListItemButton>
            </Box>
        </Drawer>
    )
}
