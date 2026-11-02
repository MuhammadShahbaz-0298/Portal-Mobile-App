// Authorized submission download to the cache, then the native share sheet.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { refreshAccessToken } from '../api/client';
import { ERRORS, FILES } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { API_URL } from '../config/env';
import { getAccessToken } from './session';

function safeName(name) {
  const clean = String(name || 'submission.zip').replace(/[^a-zA-Z0-9._-]/g, '_');
  return clean.toLowerCase().endsWith('.zip') ? clean : `${clean}.zip`;
}

async function downloadOnce(id, fileName, token) {
  const destination = `${FileSystem.cacheDirectory}${Date.now()}-${safeName(
    fileName
  )}`;
  return FileSystem.downloadAsync(
    `${API_URL}${ENDPOINTS.submissions.download(id)}`,
    destination,
    { headers: token ? { Authorization: `Bearer ${token}` } : {} }
  );
}

export async function downloadSubmission(submission) {
  if (!FileSystem.cacheDirectory) throw new Error(ERRORS.download);

  let result = await downloadOnce(
    submission._id || submission.id,
    submission.fileName,
    await getAccessToken()
  );

  if (result.status === 401) {
    const token = await refreshAccessToken();
    result = await downloadOnce(
      submission._id || submission.id,
      submission.fileName,
      token
    );
  }

  if (result.status < 200 || result.status >= 300) {
    throw new Error(ERRORS.download);
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/zip',
      dialogTitle: FILES.shareTitle,
      UTI: 'com.pkware.zip-archive',
    });
  }

  return result.uri;
}
