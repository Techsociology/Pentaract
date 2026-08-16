import { For, Show } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import Breadcrumbs from '@suid/material/Breadcrumbs'
import Link from '@suid/material/Link'
import Typography from '@suid/material/Typography'
import HomeIcon from '@suid/icons-material/HomeOutlined'
import NavigateNextIcon from '@suid/icons-material/NavigateNext'

// Renders "Home / segment / segment / ..." for the current storage path.
// Every segment (including Home) is clickable and jumps straight to that
// folder level, instead of only being able to go up one level at a time.
const PathBreadcrumbs = (props) => {
    const navigate = useNavigate()

    const segments = () => (props.path ? props.path.split('/').filter(Boolean) : [])

    const goTo = (index) => {
        // index === -1 means Home (root)
        const target = segments().slice(0, index + 1).join('/')
        navigate(`${props.basePath}/${target}`)
    }

    return (
        <Breadcrumbs
            separator={<NavigateNextIcon sx={{ fontSize: '1rem', color: 'var(--text-muted)' }} />}
            sx={{ mb: 2 }}
        >
            <Link
                component="button"
                underline="hover"
                onClick={() => goTo(-1)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    color: segments().length
                        ? 'var(--text-secondary) !important'
                        : 'var(--text-primary) !important',
                    cursor: 'pointer',
                }}
            >
                <HomeIcon sx={{ fontSize: '1rem' }} />
                Home
            </Link>

            <For each={segments()}>
                {(segment, index) => (
                    <Show
                        when={index() < segments().length - 1}
                        fallback={
                            <Typography sx={{
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                color: 'var(--text-primary) !important',
                            }}>
                                {segment}
                            </Typography>
                        }
                    >
                        <Link
                            component="button"
                            underline="hover"
                            onClick={() => goTo(index())}
                            sx={{
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                color: 'var(--text-secondary) !important',
                                cursor: 'pointer',
                            }}
                        >
                            {segment}
                        </Link>
                    </Show>
                )}
            </For>
        </Breadcrumbs>
    )
}

export default PathBreadcrumbs
