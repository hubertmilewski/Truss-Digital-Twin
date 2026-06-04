import { get, set, del } from 'idb-keyval';

export async function saveModelFiles(filesArray) {
  await set('pb_custom_3d_model', filesArray);
}

export async function getModelFiles() {
  return await get('pb_custom_3d_model');
}

export async function clearModelFiles() {
  await del('pb_custom_3d_model');
}
