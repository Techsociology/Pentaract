import ImageIcon from '@suid/icons-material/ImageOutlined'
import VideoIcon from '@suid/icons-material/MovieOutlined'
import AudioIcon from '@suid/icons-material/AudiotrackOutlined'
import ArchiveIcon from '@suid/icons-material/FolderZipOutlined'
import PdfIcon from '@suid/icons-material/PictureAsPdfOutlined'
import DocIcon from '@suid/icons-material/DescriptionOutlined'
import SheetIcon from '@suid/icons-material/TableChartOutlined'
import SlidesIcon from '@suid/icons-material/SlideshowOutlined'
import CodeIcon from '@suid/icons-material/CodeOutlined'
import FileIcon from '@suid/icons-material/InsertDriveFileOutlined'

// Extension -> { icon component, color } lookup used by FSListItem.
// Falls back to the generic file icon/color for anything unrecognized.

const IMAGE = { icon: ImageIcon, color: '#22c55e' }
const VIDEO = { icon: VideoIcon, color: '#f43f5e' }
const AUDIO = { icon: AudioIcon, color: '#a855f7' }
const ARCHIVE = { icon: ArchiveIcon, color: '#f59e0b' }
const PDF = { icon: PdfIcon, color: '#ef4444' }
const DOC = { icon: DocIcon, color: '#3b82f6' }
const SHEET = { icon: SheetIcon, color: '#10b981' }
const SLIDES = { icon: SlidesIcon, color: '#f97316' }
const CODE = { icon: CodeIcon, color: '#38bdf8' }
const DEFAULT = { icon: FileIcon, color: 'var(--accent-light)' }

const EXTENSION_MAP = {
    // images
    png: IMAGE, jpg: IMAGE, jpeg: IMAGE, gif: IMAGE, webp: IMAGE, svg: IMAGE, bmp: IMAGE, ico: IMAGE,
    // video
    mp4: VIDEO, mov: VIDEO, avi: VIDEO, mkv: VIDEO, webm: VIDEO, flv: VIDEO,
    // audio
    mp3: AUDIO, wav: AUDIO, flac: AUDIO, ogg: AUDIO, m4a: AUDIO,
    // archives
    zip: ARCHIVE, rar: ARCHIVE, tar: ARCHIVE, gz: ARCHIVE, '7z': ARCHIVE, bz2: ARCHIVE,
    // documents
    pdf: PDF,
    doc: DOC, docx: DOC, odt: DOC, rtf: DOC, txt: DOC, md: DOC,
    xls: SHEET, xlsx: SHEET, csv: SHEET, ods: SHEET,
    ppt: SLIDES, pptx: SLIDES, odp: SLIDES,
    // code
    js: CODE, jsx: CODE, ts: CODE, tsx: CODE, py: CODE, rs: CODE, go: CODE, java: CODE,
    c: CODE, cpp: CODE, h: CODE, css: CODE, html: CODE, json: CODE, yml: CODE, yaml: CODE,
    sh: CODE, toml: CODE, sql: CODE,
}

export const getFileTypeVisuals = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase()
    return EXTENSION_MAP[ext] || DEFAULT
}
