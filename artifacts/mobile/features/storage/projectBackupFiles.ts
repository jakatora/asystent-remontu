import { Directory, File, Paths } from 'expo-file-system';
import { getDocumentAsync } from 'expo-document-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { BACKUP_MAX_BYTES, checkBackupSize, portablePhoto, type ProjectBackup } from './projectBackup';

// Image picker URIs are still used for the local gallery. Export embeds the
// bytes so the receiving device can restore the photo independently.
export async function makePortableProjectPhoto(uri: string): Promise<string> {
  return uri;
}

function removeTemporaryFile(file: File) {
  try {
    if (file.exists) file.delete();
  } catch {
    // The system can reclaim the cache if a temporary file cannot be removed.
  }
}

async function embedPhoto(uri: string): Promise<string> {
  if (portablePhoto(uri)) return uri;
  if (!uri.startsWith('file://')) throw Error('backup_photo_unreadable');

  try {
    const file = new File(uri);
    if (!file.exists || file.size === 0) throw Error('backup_photo_unreadable');
    if (file.size > BACKUP_MAX_BYTES * 3 / 4) throw Error('backup_too_large');

    const encoded = await file.base64();
    if (encoded.startsWith('/9j/')) return 'data:image/jpeg;base64,' + encoded;
    if (encoded.startsWith('iVBORw0KGgo')) return 'data:image/png;base64,' + encoded;
    if (encoded.startsWith('R0lGOD')) return 'data:image/gif;base64,' + encoded;
    if (encoded.startsWith('UklGR') && encoded.slice(12, 16) === 'RUJQ') return 'data:image/webp;base64,' + encoded;

    // Older local photos may use a format such as HEIC. The device decoder
    // converts those photos to a format supported by the existing archive.
    const image = await ImageManipulator.manipulate(uri).renderAsync();
    const converted = await image.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
    const temporary = new File(converted.uri);
    try {
      if (temporary.size > BACKUP_MAX_BYTES * 3 / 4) throw Error('backup_too_large');
      return 'data:image/jpeg;base64,' + await temporary.base64();
    } finally {
      removeTemporaryFile(temporary);
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'backup_too_large') throw error;
    throw Error('backup_photo_unreadable');
  }
}

export async function embedBackupPhotos(backup: ProjectBackup): Promise<ProjectBackup> {
  const photos: ProjectBackup['tables']['project_photos'] = [];
  let encodedLength = 0;
  for (const row of backup.tables.project_photos) {
    const uri = await embedPhoto(String(row.uri));
    encodedLength += uri.length;
    if (encodedLength > BACKUP_MAX_BYTES) throw Error('backup_too_large');
    photos.push({ ...row, uri });
  }
  return { ...backup, tables: { ...backup.tables, project_photos: photos } };
}

export async function downloadProjectBackup(raw: string): Promise<void> {
  checkBackupSize(raw);
  if (!await isAvailableAsync()) throw Error('backup_share_unavailable');
  const directory = new Directory(Paths.cache, 'renovation-backup');
  directory.create({ idempotent: true });
  // A recipient may read the file after the share sheet closes. Each export
  // gets its own URI so a later export cannot change the shared contents.
  const file = new File(directory, `asystent-remontu-projekty-${Date.now()}.json`);
  file.write(raw);
  await shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json' });
}

export async function chooseProjectBackup(): Promise<string | null> {
  const result = await getDocumentAsync({ type: '*/*', copyToCacheDirectory: true, multiple: false });
  if (result.canceled) return null;
  const file = new File(result.assets[0].uri);
  try {
    if (file.size > BACKUP_MAX_BYTES) throw Error('backup_too_large');
    return await file.text();
  } finally {
    if (file.uri.startsWith(Paths.cache.uri.replace(/\/$/, '') + '/')) removeTemporaryFile(file);
  }
}
