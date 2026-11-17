// Authorized submission download to the cache, then the native share sheet.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { refreshAccessToken } from '../api/refresh';
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

// Download problems carry code 'download' so the screens can show this exact
// message instead of the generic API error.
function downloadFailure(message, status = 0) {
  const error = new Error(message);
  error.code = 'download';
  error.status = status;
  return error;
}

// __DEV__ only: read the server's JSON body saved into the cache file by the
// downloader and return its `error` text. Small files only; never logs tokens,
// cookies, or the full URL.
async function readServerError(uri) {
  if (!uri) return undefined;
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    if (!info.exists || !info.size || info.size > 64 * 1024) return undefined;
    const text = await FileSystem.readAsStringAsync(uri);
    const parsed = JSON.parse(text);
    return typeof parsed.error === 'string' ? parsed.error : undefined;
  } catch {
    return undefined;
  } finally {
    if (uri) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch {
        // Ignore deletion errors; the file is no longer needed.
      }
    }
  }
}

export async function downloadSubmission(submission) {
  if (!FileSystem.cacheDirectory) throw downloadFailure(ERRORS.download);

  const id = submission._id || submission.id;
  let result;

  try {
    result = await downloadOnce(id, submission.fileName, await getAccessToken());

    if (result.status === 401) {
      const token = await refreshAccessToken();
      result = await downloadOnce(id, submission.fileName, token);
    }
  } catch (error) {
    // A refresh rejected as 401/403 means the session itself is gone.
    if (error?.status === 401 || error?.status === 403) {
      throw downloadFailure(ERRORS.downloadNoAccess, error.status);
    }
    throw downloadFailure(ERRORS.download);
  }

  let serverErrorText;
  if (__DEV__ && result.status) {
    serverErrorText = await readServerError(result.uri);
    console.warn('Download failed', {
      host: new URL(API_URL).host,
      id,
      status: result.status,
      error: serverErrorText,
    });
  }

  if (result.status === 404) {
    if (!serverErrorText) {
      serverErrorText = await readServerError(result.uri);
    }
    throw downloadFailure(serverErrorText || ERRORS.downloadNotFound, 404);
  }

  if (result.status === 401 || result.status === 403) {
    throw downloadFailure(ERRORS.downloadNoAccess, result.status);
  }

  if (result.status < 200 || result.status >= 300) {
    throw downloadFailure(ERRORS.download, result.status);
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw downloadFailure(ERRORS.shareUnavailable);
  }

  try {
    await Sharing.shareAsync(result.uri, {
      mimeType: 'application/zip',
      dialogTitle: FILES.shareTitle,
      UTI: 'com.pkware.zip-archive',
    });
  } catch {
    throw downloadFailure(ERRORS.download);
  }

  return result.uri;
}
