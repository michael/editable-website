export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(dateString, withTime) {
  const date = new Date(dateString);
  if (withTime) {
    if (date.toDateString() === new Date().toDateString()) {
      // on same day, only show the time
      return date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    } else {
      const opts = {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      };
      if (date.getFullYear() !== new Date().getFullYear()) {
        opts.year = 'numeric';
      }
      return date.toLocaleDateString('en-US', opts);
    }
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}

export function debounce(node, params) {
  let timer;

  return {
    update() {
      clearTimeout(timer);
      timer = setTimeout(params.func, params.duration);
    },
    destroy() {
      clearTimeout(timer);
    }
  };
}

export function extractTeaser(body) {
  const teaser = [...body.querySelectorAll('p')].map(n => n.textContent).join(' ');
  if (teaser.length > 512) {
    return teaser.slice(0, 512).concat('…');
  } else {
    return teaser;
  }
}

export function resizeImage(file, maxWidth, maxHeight, quality) {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  return new Promise((resolve, reject) => {
    reader.onload = event => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        let width = image.width;
        let height = image.height;
        let newWidth = width;
        let newHeight = height;
        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = (height * maxWidth) / width;
        }
        if (newHeight > maxHeight) {
          newWidth = (newWidth * maxHeight) / newHeight;
          newHeight = maxHeight;
        }
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          blob => {
            resolve(blob);
          },
          file.type,
          quality
        );
      };
      image.onerror = error => {
        reject(error);
      };
    };
    reader.onerror = error => {
      reject(error);
    };
  });
}
/**
 * Get image dimensions from a file
 */
export async function getDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = function () {
      resolve({ width: this.width, height: this.height });
    };
    img.onerror = function () {
      reject(img.error);
    };
    img.src = URL.createObjectURL(file);
  });
}

export async function fetchJSON(method, url, data = undefined) {
  const response = await fetch(url, {
    method: method,
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    }
  });
  if (!response.ok) throw new Error(response.statusText);
  const result = await response.json();
  return result;
}
