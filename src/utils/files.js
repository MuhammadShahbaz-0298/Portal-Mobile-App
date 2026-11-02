// Device-side file checks. The backend still performs the authoritative validation.
import * as DocumentPicker from 'expo-document-picker';
import { ERRORS, FILES, VALIDATION } from '../constants/strings';
import { MAX_FILE_MB } from '../constants/options';

const zipMimeTypes = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-zip',
];

export async function pickZipFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: zipMimeTypes,
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];

  if (!asset.name?.toLowerCase().endsWith('.zip')) {
    throw new Error(FILES.zipOnly);
  }

  if (asset.size && asset.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(VALIDATION.fileSize(MAX_FILE_MB));
  }

  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType || 'application/zip',
    size: asset.size || 0,
  };
}

export function formatFileSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function fileError(error) {
  return error?.message || ERRORS.upload || FILES.tooLarge;
}
