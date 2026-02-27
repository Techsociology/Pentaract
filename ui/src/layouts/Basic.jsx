import { onMount } from 'solid-js'
import { Outlet } from '@solidjs/router'
import Header from '../components/Header'
import SideBar from '../components/SideBar'
import Box from '@suid/material/Box'
import Container from '@suid/material/Container'
import CssBaseline from '@suid/material/CssBaseline'
import Toolbar from '@suid/material/Toolbar'

import { checkAuth } from '../common/auth_guard'

const BasicLayout = () => {
    onMount(checkAuth)

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <CssBaseline />
            <Header />
            <Toolbar sx={{ minHeight: '60px !important', height: '60px' }} />

            <Box sx={{ display: 'flex', flexGrow: 1 }}>
                <SideBar />

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        minHeight: 'calc(100vh - 60px)',
                    }}
                >
                    <Container
                        maxWidth={false}
                        sx={{ pt: 4, px: 4, pb: 4 }}
                    >
                        <Outlet />
                    </Container>
                </Box>
            </Box>
        </Box>
    )
}

export default BasicLayout
