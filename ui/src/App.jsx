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
    const [mode, setMode] = createSignal(localStorage.getItem('theme') || 'light');

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
                    main: mode() === 'light' ? '#0D1821' : '#90caf9' 
                },
                background: {
                    default: mode() === 'light' ? '#ffffff' : '#121212',
                    paper: mode() === 'light' ? '#ffffff' : '#1e1e1e',
                },
                text: {
                    primary: mode() === 'light' ? '#0D1821' : '#f8fafc',
                    secondary: mode() === 'light' ? '#475569' : '#94a3b8',
                },
                action: {
                    active: mode() === 'light' ? '#0D1821' : '#ffffff',
                }
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