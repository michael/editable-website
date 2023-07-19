/** 
 * Adapted from svelte-easy-crop
 * https://github.com/ValentinH/svelte-easy-crop 
 */

/**
 * Compute the dimension of the crop area based on image size and aspect ratio
 * @param imgWidth width of the src image in pixels
 * @param imgHeight height of the src image in pixels
 * @param aspect aspect ratio of the crop
 */
export function getCropSize(imgWidth, imgHeight, aspect) {
  if (imgWidth >= imgHeight * aspect) {
    return {
      width: imgHeight * aspect,
      height: imgHeight
    };
  }
  return {
    width: imgWidth,
    height: imgWidth / aspect
  };
}

/**
 * Ensure a new image position stays in the crop area.
 * @param position new x/y position requested for the image
 * @param imageSize width/height of the src image
 * @param cropSize width/height of the crop area
 * @param  zoom zoom value
 * @returns
 */
export function restrictPosition(position, imageSize, cropSize, zoom) {
  return {
    x: restrictPositionCoord(position.x, imageSize.width, cropSize.width, zoom),
    y: restrictPositionCoord(position.y, imageSize.height, cropSize.height, zoom)
  };
}

function restrictPositionCoord(position, imageSize, cropSize, zoom) {
  const maxPosition = (imageSize * zoom) / 2 - cropSize / 2;
  return Math.min(maxPosition, Math.max(position, -maxPosition));
}

export function getDistanceBetweenPoints(pointA, pointB) {
  return Math.sqrt(Math.pow(pointA.y - pointB.y, 2) + Math.pow(pointA.x - pointB.x, 2));
}

/**
 * Compute the output cropped area of the image in percentages and pixels.
 * x/y are the top-left coordinates on the src image
 * @param  crop x/y position of the current center of the image
 * @param  imageSize width/height of the src image (default is size on the screen, natural is the original size)
 * @param  cropSize width/height of the crop area
 * @param aspect aspect value
 * @param zoom zoom value
 * @param restrictPosition whether we should limit or not the cropped area
 */
export function computeCroppedArea(crop, imgSize, cropSize, aspect, zoom, restrictPosition = true) {
  const limitAreaFn = restrictPosition ? limitArea : noOp;
  const croppedAreaPercentages = {
    x: limitAreaFn(
      100,
      (((imgSize.width - cropSize.width / zoom) / 2 - crop.x / zoom) / imgSize.width) * 100
    ),
    y: limitAreaFn(
      100,
      (((imgSize.height - cropSize.height / zoom) / 2 - crop.y / zoom) / imgSize.height) * 100
    ),
    width: limitAreaFn(100, ((cropSize.width / imgSize.width) * 100) / zoom),
    height: limitAreaFn(100, ((cropSize.height / imgSize.height) * 100) / zoom)
  };

  // we compute the pixels size naively
  const widthInPixels = limitAreaFn(
    imgSize.naturalWidth,
    (croppedAreaPercentages.width * imgSize.naturalWidth) / 100,
    true
  );
  const heightInPixels = limitAreaFn(
    imgSize.naturalHeight,
    (croppedAreaPercentages.height * imgSize.naturalHeight) / 100,
    true
  );
  const isImgWiderThanHigh = imgSize.naturalWidth >= imgSize.naturalHeight * aspect;

  // then we ensure the width and height exactly match the aspect (to avoid rounding approximations)
  // if the image is wider than high, when zoom is 0, the crop height will be equals to iamge height
  // thus we want to compute the width from the height and aspect for accuracy.
  // Otherwise, we compute the height from width and aspect.
  const sizePixels = isImgWiderThanHigh
    ? {
        width: Math.round(heightInPixels * aspect),
        height: heightInPixels
      }
    : {
        width: widthInPixels,
        height: Math.round(widthInPixels / aspect)
      };
  const croppedAreaPixels = {
    ...sizePixels,
    x: limitAreaFn(
      imgSize.naturalWidth - sizePixels.width,
      (croppedAreaPercentages.x * imgSize.naturalWidth) / 100,
      true
    ),
    y: limitAreaFn(
      imgSize.naturalHeight - sizePixels.height,
      (croppedAreaPercentages.y * imgSize.naturalHeight) / 100,
      true
    )
  };
  return { croppedAreaPercentages, croppedAreaPixels };
}

/**
 * Ensure the returned value is between 0 and max
 * @param max
 * @param value
 * @param shouldRound
 */
function limitArea(max, value, shouldRound = false) {
  const v = shouldRound ? Math.round(value) : value;
  return Math.min(max, Math.max(0, v));
}

function noOp(max, value) {
  return value;
}

/**
 * Return the point that is the center of point a and b
 * @param a
 * @param b
 */
export function getCenter(a, b) {
  return {
    x: (b.x + a.x) / 2,
    y: (b.y + a.y) / 2
  };
}

export const createImage = url =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', error => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(file => {
      resolve(file);
      // resolve(URL.createObjectURL(file));
    }, 'image/png'); // PNG to preserve transparency
  });
}
