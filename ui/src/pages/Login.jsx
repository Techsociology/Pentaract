import { onMount } from 'solid-js'
import Box from '@suid/material/Box'
import TextField from '@suid/material/TextField'
import Button from '@suid/material/Button'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import createLocalStore from '../../libs'
import { A, useNavigate } from '@solidjs/router'

import API from '../api'

const Login = () => {
    const [store, setStore] = createLocalStore()
    const navigate = useNavigate()

    onMount(() => {
        if (store.access_token) {
            navigate('/')
        }
    })

    const handleSubmit = async (event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const email = data.get('email')
        const password = data.get('password')

        const tokenData = await API.auth.login(email, password)

        setStore('access_token', tokenData.access_token)
        setStore('user', { email })

        const redirect_url = store.redirect || '/'
        navigate(redirect_url)
    }

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `
                radial-gradient(ellipse 80% 50% at 50% -10%, rgba(59,130,246,0.12), transparent),
                var(--bg-base)
            `,
            p: 2,
        }}>
            {/* Decorative orbs */}
            <Box sx={{
                position: 'fixed',
                top: '20%',
                right: '15%',
                width: 300,
                height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <Box sx={{
                position: 'fixed',
                bottom: '15%',
                left: '10%',
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <Box sx={{
                width: '100%',
                maxWidth: 420,
                bgcolor: 'var(--bg-paper)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-lg)',
                p: { xs: 3.5, sm: 5 },
                position: 'relative',
                animation: 'fadeInUp 0.4s cubic-bezier(0.4,0,0.2,1) both',
            }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 52,
                        height: 52,
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2.5,
                        boxShadow: '0 8px 24px rgba(59,130,246,0.35)',
                        fontSize: '1.5rem',
                    }}>
                        🔷
                    </Box>
                    <Typography variant="h5" sx={{
                        fontWeight: '700 !important',
                        fontSize: '1.5rem !important',
                        letterSpacing: '-0.03em !important',
                        color: 'var(--text-primary) !important',
                        mb: 0.5,
                    }}>
                        Welcome back
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary) !important',
                    }}>
                        Sign in to your Pentaract account
                    </Typography>
                </Box>

                {/* Form */}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                >
                    <TextField
                        name="email"
                        label="Email address"
                        variant="outlined"
                        type="email"
                        required
                        fullWidth
                        size="small"
                    />
                    <TextField
                        name="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        required
                        fullWidth
                        size="small"
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                            py: 1.2,
                            mt: 0.5,
                            fontSize: '0.9rem !important',
                        }}
                    >
                        Sign in
                    </Button>
                </Box>

                <Divider sx={{ my: 3, borderColor: 'var(--border) !important' }} />

                <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.875rem', color: 'var(--text-secondary) !important' }}>
                        Don't have an account?{' '}
                        <A class="default-link" href="/register" style={{ fontWeight: 600 }}>
                            Create one
                        </A>
                    </Typography>
                </Box>
            </Box>
        </Box>
    )
}

export default Login
