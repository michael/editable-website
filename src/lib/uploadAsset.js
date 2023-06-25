function upload(file, path, progressCallback) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);

  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr);
        } else {
          reject(xhr);
        }
      }
    };

    if (progressCallback) {
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / file.size) * 100;
          progressCallback(parseInt(percentComplete, 10));
        }
      };
    }
    xhr.open('PUT', '/api/upload-asset');
    xhr.send(formData);
  });
}

export default async function uploadAsset(file, path, onProgress) {
  await upload(file, path, onProgress);
  return path;
}