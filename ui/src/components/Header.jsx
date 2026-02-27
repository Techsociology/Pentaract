import AppBar from '@suid/material/AppBar'
import Toolbar from '@suid/material/Toolbar'
import Typography from '@suid/material/Typography'
import IconButton from '@suid/material/IconButton'
import Box from '@suid/material/Box'
import { A, useNavigate } from '@solidjs/router'
import LogoutIcon from '@suid/icons-material/Logout'
import { Show, createEffect, createSignal } from 'solid-js'

import AppIcon from './AppIcon'
import createLocalStore from '../../libs'
import { uploadProgress } from '../common/uploadProgress'

const Header = () => {
    const [_store, setStore] = createLocalStore()
    const navigate = useNavigate()
    // Smooth displayed width — snaps to real progress but animates out on complete
    const [displayPct, setDisplayPct] = createSignal(0)
    const [visible, setVisible] = createSignal(false)

    createEffect(() => {
        const p = uploadProgress()
        if (p === null) {
            // Animate to 100% then fade out
            setDisplayPct(100)
            setTimeout(() => setVisible(false), 400)
        } else {
            setVisible(true)
            setDisplayPct(p)
        }
    })

    const logout = (_) => {
        setStore('access_token')
        setStore('redirect', '/')
        navigate('/login')
    }

    return (
        <AppBar position="fixed" elevation={0}>
            <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
                <A href="/">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 12px rgba(59,130,246,0.4)',
                        }}>
                            <AppIcon sx={{ fontSize: 18, color: '#fff' }} />
                        </Box>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                letterSpacing: '-0.03em',
                                background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Pentaract
                        </Typography>
                    </Box>
                </A>

                <IconButton
                    onClick={logout}
                    title="Logout"
                    sx={{
                        color: 'var(--text-secondary)',
                        '&:hover': {
                            color: '#f43f5e',
                            bgcolor: 'rgba(244,63,94,0.1)',
                        },
                    }}
                >
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Toolbar>

            {/* Upload progress bar — sits flush at bottom of AppBar */}
            <Show when={visible()}>
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    overflow: 'hidden',
                }}>
                    {/* Filled portion */}
                    <Box sx={{
                        height: '100%',
                        width: `${displayPct()}%`,
                        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                        transition: 'width 0.25s ease, opacity 0.4s ease',
                        opacity: uploadProgress() === null ? 0 : 1,
                        boxShadow: '0 0 8px rgba(96,165,250,0.8)',
                        borderRadius: '0 2px 2px 0',
                        position: 'relative',
                    }}>
                        {/* Shimmer gleam */}
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: 60,
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                            animation: 'shimmer 1.2s infinite',
                            '@keyframes shimmer': {
                                '0%':   { transform: 'translateX(-60px)' },
                                '100%': { transform: 'translateX(60px)' },
                            },
                        }} />
                    </Box>
                </Box>
            </Show>
        </AppBar>
    )
}

export default Header
