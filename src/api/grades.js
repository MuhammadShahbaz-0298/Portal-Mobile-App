import { ENDPOINTS } from '../constants/endpoints';
import { buildQuery } from '../utils/query';
import { apiRequest } from './client';

export async function getWeightedGrades(studentId, params = {}) {
  const { data } = await apiRequest(
    `${ENDPOINTS.grades.weighted(studentId)}${buildQuery(params)}`
  );
  return data;
}
