import ListItem from '@suid/material/ListItem'
import ListItemButton from '@suid/material/ListItemButton'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import MenuMUI from '@suid/material/Menu'
import MenuItem from '@suid/material/MenuItem'
import IconButton from '@suid/material/IconButton'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'
import FolderIcon from '@suid/icons-material/Folder'
import MoreVertIcon from '@suid/icons-material/MoreVert'
import DownloadIcon from '@suid/icons-material/Download'
import InfoIcon from '@suid/icons-material/Info'
import DeleteIcon from '@suid/icons-material/Delete'
import { createSignal, Show } from 'solid-js'
import { useNavigate, useParams } from '@solidjs/router'

import API from '../api'
import ActionConfirmDialog from './ActionConfirmDialog'
import FileInfoDialog from './FileInfo'

const FSListItem = (props) => {
    const [moreAnchorEl, setMoreAnchorEl] = createSignal(null)
    const [isActionConfirmDialogOpened, setIsActionConfirmDialogOpened] = createSignal(false)
    const [isInfoDialogOpened, setIsInfoDialogOpened] = createSignal(false)
    const navigate = useNavigate()
    const params = useParams()

    const openMore = () => Boolean(moreAnchorEl())
    const handleCloseMore = () => setMoreAnchorEl(null)

    const handleNavigate = () => {
        if (!props.fsElement.is_file) {
            navigate(`/storages/${props.storageId}/files/${props.fsElement.path}`)
        }
    }

    const download = async () => {
        const blob = await API.files.download(params.id, props.fsElement.path)
        const href = URL.createObjectURL(blob)
        const a = Object.assign(document.createElement('a'), {
            href,
            style: 'display: none',
            download: props.fsElement.name,
        })
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(href)
        a.remove()
    }

    const openActionConfirmDialog = () => {
        handleCloseMore()
        setIsActionConfirmDialogOpened(true)
    }
    const closeActionConfirmDialog = () => setIsActionConfirmDialogOpened(false)

    const deleteFile = async () => {
        closeActionConfirmDialog()
        await API.files.deleteFile(params.id, props.fsElement.path)
        props.onDelete()
    }

    const isBack = props.fsElement.name === '..'

    return (
        <>
            <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                    onClick={handleNavigate}
                    sx={{
                        borderRadius: 'var(--radius-md) !important',
                        py: 1,
                        px: 1.5,
                        transition: 'all 0.15s ease !important',
                        '&:hover': {
                            bgcolor: 'var(--bg-elevated) !important',
                        },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{
                            width: 32,
                            height: 32,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: props.fsElement.is_file
                                ? 'var(--bg-elevated)'
                                : 'rgba(251,191,36,0.12)',
                        }}>
                            <Show when={props.fsElement.is_file} fallback={
                                <FolderIcon sx={{
                                    fontSize: '1.05rem',
                                    color: isBack ? 'var(--text-muted) !important' : '#fbbf24 !important',
                                }} />
                            }>
                                <FileIcon sx={{ fontSize: '1.05rem', color: 'var(--accent-light) !important' }} />
                            </Show>
                        </Box>
                    </ListItemIcon>
                    <ListItemText
                        primary={props.fsElement.name}
                        sx={{
                            '& .MuiListItemText-primary': {
                                fontSize: '0.875rem',
                                fontWeight: isBack ? 400 : 500,
                                color: isBack
                                    ? 'var(--text-secondary) !important'
                                    : 'var(--text-primary) !important',
                                fontFamily: "'Outfit', sans-serif",
                            },
                        }}
                    />
                </ListItemButton>

                <Show when={!isBack}>
                    <IconButton
                        onClick={(event) => setMoreAnchorEl(event.currentTarget)}
                        size="small"
                        sx={{
                            mr: 0.5,
                            color: 'var(--text-muted)',
                            '&:hover': { color: 'var(--text-secondary)' },
                        }}
                    >
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Show>
            </ListItem>

            <MenuMUI
                anchorEl={moreAnchorEl()}
                open={openMore()}
                onClose={handleCloseMore}
                MenuListProps={{ 'aria-labelledby': 'basic-button' }}
            >
                <MenuItem onClick={() => setIsInfoDialogOpened(true)}>
                    <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Info</ListItemText>
                </MenuItem>
                <MenuItem onClick={download} disabled={!props.fsElement.is_file}>
                    <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Download</ListItemText>
                </MenuItem>
                <MenuItem onClick={openActionConfirmDialog} sx={{
                    color: '#f43f5e !important',
                    '& .MuiListItemIcon-root': { color: '#f43f5e !important' },
                }}>
                    <ListItemIcon><DeleteIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </MenuMUI>

            <ActionConfirmDialog
                action="Delete"
                entity="file"
                actionDescription={`delete file ${props.fsElement.name}`}
                isOpened={isActionConfirmDialogOpened()}
                onConfirm={deleteFile}
                onCancel={closeActionConfirmDialog}
            />

            <FileInfoDialog
                file={props.fsElement}
                isOpened={isInfoDialogOpened()}
                onClose={() => setIsInfoDialogOpened(false)}
            />
        </>
    )
}

export default FSListItem
