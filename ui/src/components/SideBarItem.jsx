import { A, useLocation } from '@solidjs/router'
import Box from '@suid/material/Box'
import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import { children, createMemo, Show } from 'solid-js'

/**
 * @typedef {Object} SideBarItemProps
 * @property {string} text
 * @property {boolean} isFull
 * @property {string} link
 * @property {import("solid-js").JSXElement[]} children
 */

/**
 * @param {SideBarItemProps} props
 */
const SideBarItem = (props) => {
    const c = children(() => props.children)
    const location = useLocation()
    const isActive = createMemo(() => location.pathname.startsWith(props.link))

    return (
        <ListItem key={props.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
            <A href={props.link}>
                <ListItemButton
                    sx={{
                        minHeight: 44,
                        justifyContent: props.isFull ? 'initial' : 'center',
                        px: props.isFull ? 1.5 : 1,
                        py: 1,
                        borderRadius: 'var(--radius-md)',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: isActive() ? 'var(--accent-dim) !important' : 'transparent',
                        '&:hover': {
                            bgcolor: isActive() ? 'var(--accent-dim) !important' : 'var(--bg-elevated) !important',
                        },
                    }}
                >
                    {/* Active left border indicator */}
                    <Show when={isActive()}>
                        <Box
                            component="span"
                            sx={{
                                position: 'absolute',
                                left: 0,
                                top: '20%',
                                height: '60%',
                                width: '3px',
                                borderRadius: '0 3px 3px 0',
                                bgcolor: 'var(--accent)',
                            }}
                        />
                    </Show>
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: props.isFull ? 1.5 : 'auto',
                            justifyContent: 'center',
                            color: isActive()
                                ? 'var(--accent-light) !important'
                                : 'var(--text-secondary) !important',
                            transition: 'color 0.2s',
                            '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
                        }}
                    >
                        {c()}
                    </ListItemIcon>
                    <ListItemText
                        primary={props.text}
                        sx={{
                            display: props.isFull ? 'block' : 'none',
                            '& .MuiListItemText-primary': {
                                fontSize: '0.875rem',
                                fontWeight: isActive() ? 600 : 500,
                                color: isActive()
                                    ? 'var(--accent-light) !important'
                                    : 'var(--text-secondary) !important',
                                transition: 'color 0.2s',
                            },
                        }}
                    />
                </ListItemButton>
            </A>
        </ListItem>
    )
}

export default SideBarItem
