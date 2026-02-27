import { useBeforeLeave, useNavigate, useParams } from '@solidjs/router'
import { Show, createSignal, mapArray, onCleanup, onMount } from 'solid-js'
import List from '@suid/material/List'
import MenuItem from '@suid/material/MenuItem'
import ListItemIcon from '@suid/material/ListItemIcon'
import ListItemText from '@suid/material/ListItemText'
import UploadFileIcon from '@suid/icons-material/UploadFile'
import UploadFolderIcon from '@suid/icons-material/DriveFolderUpload'
import FolderOpenIcon from '@suid/icons-material/FolderOpen'
import LockIcon from '@suid/icons-material/Lock'
import Box from '@suid/material/Box'
import Typography from '@suid/material/Typography'
import Divider from '@suid/material/Divider'
import Button from '@suid/material/Button'
import ToggleButton from '@suid/material/ToggleButton'
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup'
import AddIcon from '@suid/icons-material/Add'

import API from '../../api'
import FSListItem from '../../components/FSListItem'
import Menu from '../../components/Menu'
import CreateFolderDialog from '../../components/CreateFolderDialog'
import { alertStore } from '../../components/AlertStack'
import Access from '../../components/Access'
import GrantAccess from '../../components/GrantAccess'

const Files = () => {
    const { addAlert } = alertStore
    const [fsLayer, setFsLayer] = createSignal([])
    const [storage, setStorage] = createSignal()
    const [isAccessPage, setIsAccessPage] = createSignal(false)
    const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = createSignal(false)
    const [isGrantAccessButtonVisible, setIsGrantButtonAccessVisible] = createSignal(false)
    const [isGrantAccessVisible, setIsGrantAccessVisible] = createSignal(false)
    const [users, setUsers] = createSignal([])
    const navigate = useNavigate()
    const params = useParams()
    const basePath = `/storages/${params.id}/files`

    let uploadFileInputElement

    const fetchUsersWithAccess = async () => {
        try {
            const users = await API.access.listUsersWithAccess(params.id)
            setUsers(users)
            setIsGrantButtonAccessVisible(true)
        } catch (err) {
            addAlert('You do not have permissions to manage access', 'error')
            setIsGrantButtonAccessVisible(false)
        }
    }

    const fetchStorage = async () => {
        const storage = await API.storages.getStorage(params.id)
        setStorage(storage)
    }

    const fetchFSLayer = async (path = params.path) => {
        const fsLayerRes = await API.files.getFSLayer(params.id, path)
        if (path.length) {
            const parentPath = path.split('/').slice(0, -1).join('/')
            const backToParent = { is_file: false, name: '..', path: parentPath }
            fsLayerRes.splice(0, 0, backToParent)
        }
        setFsLayer(fsLayerRes)
    }

    const reload = async () => {
        if (window.location.pathname.startsWith(basePath)) {
            await fetchFSLayer()
        }
    }

    onMount(() => {
        Promise.all([fetchStorage(), fetchFSLayer()]).then()
        window.addEventListener('popstate', reload, false)
    })

    onCleanup(() => window.removeEventListener('popstate', reload, false))

    useBeforeLeave(async (e) => {
        if (e.to.startsWith(basePath)) {
            let newPath = e.to.slice(basePath.length)
            if (newPath.startsWith('/')) newPath = newPath.slice(1)
            await fetchFSLayer(newPath)
        }
    })

    const openCreateFolderDialog = () => setIsCreateFolderDialogOpen(true)
    const closeCreateFolderDialog = () => setIsCreateFolderDialogOpen(false)

    const createFolder = async (folderName) => {
        const basePath = params.path.endsWith('/') ? params.path.slice(0, -1) : params.path
        await API.files.createFolder(params.id, basePath, folderName)
        addAlert(`Created folder "${folderName}"`, 'success')
        await fetchFSLayer()
    }

    const uploadFileClickHandler = () => uploadFileInputElement.click()

    const uploadFile = async (event) => {
        const file = event.target.files[0]
        if (file === undefined) return
        event.target.value = null
        await API.files.uploadFile(params.id, params.path, file)
        addAlert(`Uploaded file "${file.name}"`, 'success')
        await fetchFSLayer()
    }

    return (
        <Box sx={{ animation: 'fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1) both' }}>
            {/* Page header */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
                flexWrap: 'wrap',
                gap: 2,
            }}>
                <Box>
                    <Typography variant="h4" sx={{
                        fontSize: '1.6rem !important',
                        fontWeight: '700 !important',
                        letterSpacing: '-0.03em !important',
                        color: 'var(--text-primary) !important',
                        lineHeight: 1.2,
                    }}>
                        {storage()?.name || 'Files'}
                    </Typography>
                    <Typography sx={{
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary) !important',
                        mt: 0.5,
                    }}>
                        Browse and manage your files
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <ToggleButtonGroup
                        exclusive
                        value={isAccessPage()}
                        color="primary"
                        onChange={(_, val) => setIsAccessPage(val)}
                    >
                        <ToggleButton value={false}>
                            <FolderOpenIcon sx={{ fontSize: '0.95rem', mr: 0.75 }} />
                            Files
                        </ToggleButton>
                        <ToggleButton value={true}>
                            <LockIcon sx={{ fontSize: '0.95rem', mr: 0.75 }} />
                            Access
                        </ToggleButton>
                    </ToggleButtonGroup>

                    <Show
                        when={!isAccessPage()}
                        fallback={
                            <Show when={isGrantAccessButtonVisible()}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<AddIcon />}
                                    onClick={() => setIsGrantAccessVisible(true)}
                                    size="small"
                                    sx={{ px: 2 }}
                                >
                                    Grant access
                                </Button>
                                <GrantAccess
                                    isVisible={isGrantAccessVisible()}
                                    afterGrant={fetchUsersWithAccess}
                                    onClose={() => setIsGrantAccessVisible(false)}
                                />
                            </Show>
                        }
                    >
                        <Menu button_title="Create">
                            <MenuItem onClick={openCreateFolderDialog}>
                                <ListItemIcon><UploadFolderIcon /></ListItemIcon>
                                <ListItemText>Create folder</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={uploadFileClickHandler}>
                                <ListItemIcon><UploadFileIcon /></ListItemIcon>
                                <ListItemText>Upload file</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => navigate(`/storages/${params.id}/upload_to`)}>
                                <ListItemIcon><UploadFileIcon /></ListItemIcon>
                                <ListItemText>Upload file to</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Show>
                </Box>
            </Box>

            {/* Content */}
            <Show
                when={!isAccessPage()}
                fallback={
                    <Access
                        setIsGrantAccessVisible={setIsGrantAccessVisible}
                        users={users()}
                        onMount={fetchUsersWithAccess}
                        refetchUsers={fetchUsersWithAccess}
                    />
                }
            >
                <Box sx={{
                    bgcolor: 'var(--bg-paper)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)',
                    minWidth: 320,
                    maxWidth: 680,
                }}>
                    <Show
                        when={fsLayer().length}
                        fallback={
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography sx={{ color: 'var(--text-muted) !important', fontSize: '0.875rem' }}>
                                    This folder is empty
                                </Typography>
                            </Box>
                        }
                    >
                        <List sx={{ p: 1 }}>
                            {mapArray(fsLayer, (fsElement) => (
                                <FSListItem
                                    fsElement={fsElement}
                                    storageId={params.id}
                                    onDelete={fetchFSLayer}
                                />
                            ))}
                        </List>
                    </Show>
                </Box>

                <CreateFolderDialog
                    isOpened={isCreateFolderDialogOpen()}
                    onCreate={createFolder}
                    onClose={closeCreateFolderDialog}
                />
                <input
                    ref={uploadFileInputElement}
                    type="file"
                    style="display: none"
                    onChange={uploadFile}
                />
            </Show>
        </Box>
    )
}

export default Files
