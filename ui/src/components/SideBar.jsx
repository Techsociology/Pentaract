import { 
    IconButton, List, ListItem, ListItemButton, 
    Drawer, Divider, Switch, Box 
} from '@suid/material'
import ChevronLeftIcon from '@suid/icons-material/ChevronLeft'
import ChevronRightIcon from '@suid/icons-material/ChevronRight'
import StorageIcon from '@suid/icons-material/Storage'
import SmartToyIcon from '@suid/icons-material/SmartToy'
import LightModeIcon from '@suid/icons-material/LightMode'
import DarkModeIcon from '@suid/icons-material/DarkMode'
import { createSignal, useContext, Show } from 'solid-js'
import SideBarItem from './SideBarItem'
import { ColorModeContext } from '../ColorModeContext' 

export default function SideBar() {
    const [open, setOpen] = createSignal(true)
    const { mode, toggleColorMode } = useContext(ColorModeContext);

    const toggleDrawerOpen = () => {
        setOpen(!open())
    }

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open() ? 240 : 70, 
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: open() ? 240 : 70, 
                    boxSizing: 'border-box',
                    position: 'relative' 
                },
            }}
        >
            <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        sx={{
                            justifyContent: open() ? 'end' : 'center',
                            py: 0.5,
                            px: 1,
                        }}
                        onClick={toggleDrawerOpen}
                    >
                        <IconButton>
                            {open() ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                    </ListItemButton>
                </ListItem>
            </List>
            <Divider />
            <List>
                <SideBarItem text="Storages" link="/storages" isFull={open()}>
                    <StorageIcon />
                </SideBarItem>
                <SideBarItem text="Storage workers" link="/storage_workers" isFull={open()}>
                    <SmartToyIcon />
                </SideBarItem>
            </List>

            <Divider />
            
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexDirection: open() ? 'row' : 'column',
                gap: 1,
                py: 2 
            }}>
                <Show when={open()} fallback={
                    <IconButton onClick={toggleColorMode} size="small">
                        {mode() === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                    </IconButton>
                }>
                    <LightModeIcon sx={{ 
                        fontSize: 20, 
                        color: mode() === 'light' ? '#ff9800' : 'text.disabled' 
                    }} />
                    
                    <Switch 
                        checked={mode() === 'dark'} 
                        onChange={toggleColorMode}
                        size="small"
                    />
                    
                    <DarkModeIcon sx={{ 
                        fontSize: 20, 
                        color: mode() === 'dark' ? '#90caf9' : 'text.disabled' 
                    }} />
                </Show>
            </Box>
        </Drawer>
    )
}