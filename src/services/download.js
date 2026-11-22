// Authorized file download to the cache, then the native share sheet.
// One helper serves submissions, resources, report cards, and calendar feeds.
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { refreshAccessToken } from '../api/refresh';
import { ERRORS, FILES } from '../constants/strings';
import { ENDPOINTS } from '../constants/endpoints';
import { DOWNLOAD_FILE_TYPES } from '../constants/options';
import { API_URL } from '../config/env';
import { getAccessToken } from './session';

function safeName(name, fileType) {
  const clean = String(name || 'download')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '');
  const hasExtension = /\.[a-zA-Z0-9]+$/.test(clean);
  return hasExtension ? clean : `${clean}.${fileType.extension}`;
}

async function downloadOnce(path, fileName, token, fileType) {
  const destination = `${FileSystem.cacheDirectory}${Date.now()}-${safeName(
    fileName,
    fileType
  )}`;
  return FileSystem.downloadAsync(`${API_URL}${path}`, destination, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// Download problems carry code 'download' so screens can show a clear message.
function downloadFailure(message, status = 0) {
  const error = new Error(message);
  error.code = 'download';
  error.status = status;
  return error;
}

// __DEV__ only: read the server's JSON body saved into the cache file and
// return its `error` text. Never logs tokens, cookies, or full file contents.
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

function shareOptions(fileType, dialogTitle) {
  const options = { mimeType: fileType.mimeType, dialogTitle };
  if (fileType.UTI) options.UTI = fileType.UTI;
  return options;
}

export async function downloadFile({
  path,
  fileName = 'download',
  fileType = DOWNLOAD_FILE_TYPES.binary,
  dialogTitle = FILES.shareTitle,
}) {
  if (!FileSystem.cacheDirectory) throw downloadFailure(ERRORS.download);

  let result;
  try {
    result = await downloadOnce(path, fileName, await getAccessToken(), fileType);
    if (result.status === 401) {
      const token = await refreshAccessToken();
      result = await downloadOnce(path, fileName, token, fileType);
    }
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      throw downloadFailure(ERRORS.downloadNoAccess, error.status);
    }
    throw downloadFailure(ERRORS.download);
  }

  let serverErrorText;
  if (result.status && (result.status < 200 || result.status >= 300)) {
    serverErrorText = await readServerError(result.uri);
    if (__DEV__) {
      console.warn('Download failed', {
        host: new URL(API_URL).host,
        status: result.status,
        error: serverErrorText,
      });
    }
  }

  if (result.status === 404) {
    throw downloadFailure(serverErrorText || ERRORS.downloadNotFound, 404);
  }

  if (result.status === 401 || result.status === 403) {
    throw downloadFailure(ERRORS.downloadNoAccess, result.status);
  }

  if (result.status < 200 || result.status >= 300) {
    throw downloadFailure(serverErrorText || ERRORS.download, result.status);
  }

  if (!(await Sharing.isAvailableAsync())) {
    throw downloadFailure(ERRORS.shareUnavailable);
  }

  try {
    await Sharing.shareAsync(result.uri, shareOptions(fileType, dialogTitle));
  } catch {
    throw downloadFailure(ERRORS.download);
  }

  return result.uri;
}

export async function downloadSubmission(submission) {
  const id = submission._id || submission.id;
  return downloadFile({
    path: ENDPOINTS.submissions.download(id),
    fileName: submission.fileName,
    fileType: DOWNLOAD_FILE_TYPES.zip,
    dialogTitle: FILES.shareTitle,
  });
}

export async function downloadResource(assignmentId, resource, dialogTitle = FILES.shareTitle) {
  const resourceId = resource._id || resource.id;
  return downloadFile({
    path: ENDPOINTS.assignments.resources.download(assignmentId, resourceId),
    fileName: resource.fileName,
    fileType: DOWNLOAD_FILE_TYPES.binary,
    dialogTitle,
  });
}

export async function downloadReportCard(userId, dialogTitle = FILES.shareTitle) {
  return downloadFile({
    path: ENDPOINTS.users.reportCard(userId),
    fileName: `report-card-${userId}`,
    fileType: DOWNLOAD_FILE_TYPES.pdf,
    dialogTitle,
  });
}

export async function downloadCalendar(dialogTitle = FILES.shareTitle) {
  return downloadFile({
    path: ENDPOINTS.calendar.feed,
    fileName: 'calendar',
    fileType: DOWNLOAD_FILE_TYPES.calendar,
    dialogTitle,
  });
}
