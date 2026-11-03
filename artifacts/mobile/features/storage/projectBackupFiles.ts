import { Directory, File, Paths } from 'expo-file-system';
import { getDocumentAsync } from 'expo-document-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import { generateId } from '@/shared/lib/id';
import { BACKUP_MAX_BYTES, checkBackupSize, portablePhoto, type ProjectBackup } from './projectBackup';

const photoPrefix = 'project-photo:';
const photoDirectory = () => new Directory(Paths.document, 'project-photos');

function storedPhoto(uri: string): File | undefined {
  const name = uri.startsWith(photoPrefix) ? uri.slice(photoPrefix.length) : '';
  if (/^photo_[a-z0-9]+\.[a-z0-9]{1,10}$/.test(name)) return new File(photoDirectory(), name);
}

export function resolveProjectPhotoUri(uri: string): string {
  return storedPhoto(uri)?.uri ?? uri;
}

export function removeStoredProjectPhoto(uri: string): void {
  try {
    const file = storedPhoto(uri);
    if (file?.exists) file.delete();
  } catch {
    // An unavailable file must not undo a confirmed database deletion.
  }
}

export function clearManagedProjectFiles(): void {
  // These two app-owned directories contain only managed photos and share copies.
  for (const directory of [photoDirectory(), new Directory(Paths.cache, 'renovation-backup')]) {
    if (directory.exists) directory.delete();
    if (directory.exists) throw Error('local_reset_files_unconfirmed');
  }
}

export async function makePortableProjectPhoto(uri: string): Promise<string> {
  if (portablePhoto(uri)) return uri;
  if (!uri.startsWith('file://')) throw Error('backup_photo_unreadable');
  const source = new File(uri);
  if (!source.exists || source.size === 0) throw Error('backup_photo_unreadable');

  // source: https://docs.expo.dev/versions/v54.0.0/sdk/filesystem/
  // Keep only a relative reference so the file survives a sandbox path change.
  const directory = photoDirectory();
  directory.create({ idempotent: true, intermediates: true });
  const extension = source.extension.toLowerCase();
  const name = generateId('photo') + (/^\.[a-z0-9]{1,10}$/.test(extension) ? extension : '.img');
  const target = new File(directory, name);
  if (target.exists) throw Error('backup_photo_unreadable');
  try {
    source.copy(target);
    if (!target.exists || target.size !== source.size) throw Error('backup_photo_unreadable');
    return photoPrefix + name;
  } catch (error) {
    removeTemporaryFile(target);
    throw error;
  }
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
  uri = resolveProjectPhotoUri(uri);
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

export async function downloadProjectBackup(raw: string, scope: 'renovation' | 'house' = 'renovation'): Promise<void> {
  checkBackupSize(raw);
  if (!await isAvailableAsync()) throw Error('backup_share_unavailable');
  const directory = new Directory(Paths.cache, 'renovation-backup');
  directory.create({ idempotent: true });
  // A recipient may read the file after the share sheet closes. Each export
  // gets its own URI so a later export cannot change the shared contents.
  const kind = scope === 'house' ? 'budowa-domu' : 'projekty';
  const file = new File(directory, `asystent-remontu-${kind}-${Date.now()}.json`);
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
