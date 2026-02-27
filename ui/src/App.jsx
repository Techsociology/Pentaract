import { Routes, Route, Navigate } from '@solidjs/router'
import { ThemeProvider, createTheme } from '@suid/material'
import { createSignal, createEffect, createMemo, Show } from "solid-js";
import { ColorModeContext } from "./ColorModeContext";

import Login from './pages/Login'
import BasicLayout from './layouts/Basic'
import Storages from './pages/Storages'
import StorageCreateForm from './pages/Storages/StorageCreateForm'
import AlertStack from './components/AlertStack'
import StorageWorkers from './pages/StorageWorkers'
import StorageWorkerCreateForm from './pages/StorageWorkers/StorageWorkerCreateForm'
import Files from './pages/Files'
import UploadFileTo from './pages/Files/UploadFileTo'
import Register from './pages/Register'
import NotFound from './pages/404'

const App = () => {
    const [mode, setMode] = createSignal(localStorage.getItem('theme') || 'dark');

    createEffect(() => {
        const currentMode = mode();
        document.body.className = currentMode;
        localStorage.setItem('theme', currentMode);
    });

    const colorMode = {
        mode: mode,
        toggleColorMode: () => {
            setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
        },
    };

    const theme = createMemo(() =>
        createTheme({
            palette: {
                mode: mode(),
                primary: {
                    main: '#3b82f6',
                },
                secondary: {
                    main: '#3b82f6',
                },
                background: {
                    default: mode() === 'light' ? '#f0f4f8' : '#07090f',
                    paper: mode() === 'light' ? '#ffffff' : '#101828',
                },
                text: {
                    primary: mode() === 'light' ? '#0f172a' : '#e2e8f0',
                    secondary: mode() === 'light' ? '#475569' : '#64748b',
                },
                action: {
                    active: mode() === 'light' ? '#0f172a' : '#e2e8f0',
                },
                divider: mode() === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)',
            },
            typography: {
                fontFamily: "'Outfit', sans-serif",
            },
            shape: {
                borderRadius: 10,
            },
        })
    );

    return (
        <ColorModeContext.Provider value={colorMode}>
            <Show when={mode()}>
                <ThemeProvider theme={theme()}>
                    <Routes>
                        <Route path="/login" component={Login} />
                        <Route path="/register" component={Register} />
                        <Route path="/" component={BasicLayout}>
                            <Route path="/" element={<Navigate href="/storages" />} />
                            <Route path="/storages" component={Storages} />
                            <Route path="/storages/register" component={StorageCreateForm} />
                            <Route path="/storages/:id/files/*path" component={Files} />
                            <Route path="/storages/:id/upload_to" component={UploadFileTo} />
                            <Route path="/storage_workers" component={StorageWorkers} />
                            <Route path="/storage_workers/register" component={StorageWorkerCreateForm} />
                            <Route path="*404" component={NotFound} />
                        </Route>
                    </Routes>
                    <AlertStack />
                </ThemeProvider>
            </Show>
        </ColorModeContext.Provider>
    )
}

export default App;
