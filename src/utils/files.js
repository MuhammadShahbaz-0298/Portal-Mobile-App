// Device-side file checks. The backend still performs the authoritative validation.
import * as DocumentPicker from 'expo-document-picker';
import { FILES, VALIDATION } from '../constants/strings';
import { MAX_FILE_MB } from '../constants/options';

const zipMimeTypes = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
];

// Shared picker for ZIP submissions and ordinary assignment resources.
export async function pickFile({ types = '*/*', maxMb = MAX_FILE_MB } = {}) {
  const picked = await DocumentPicker.getDocumentAsync({
    type: types,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (picked.canceled || !picked.assets?.length) return null;
  const asset = picked.assets[0];

  if (asset.size && asset.size > maxMb * 1024 * 1024) {
    throw new Error(VALIDATION.fileSize(maxMb));
  }

  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || 'application/octet-stream',
    size: asset.size || 0,
  };
}

export async function pickZipFile() {
  const file = await pickFile({ types: zipMimeTypes });
  if (!file) return null;
  if (!file.name?.toLowerCase().endsWith('.zip')) {
    throw new Error(FILES.zipOnly);
  }
  return file;
}

export function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
