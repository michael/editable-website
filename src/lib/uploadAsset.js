async function getSignedUrl(path, type) {
  const response = await fetch(`/api/presignedurl?path=${path}&type=${type}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  });
  const { signedUrl } = await response.json();
  return signedUrl;
}

function uploadS3(url, file, progressCallback) {
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

    xhr.open('put', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.send(file);
  });
}

export default async function uploadAsset(file, path, onProgress) {
  const signedUrl = await getSignedUrl(path, file.type);
  await uploadS3(signedUrl, file, onProgress);
  return path;
}
