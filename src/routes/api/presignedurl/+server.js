const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT;
const S3_ACCESS_KEY = import.meta.env.VITE_S3_ACCESS_KEY;
const S3_SECRET_ACCESS_KEY = import.meta.env.VITE_S3_SECRET_ACCESS_KEY;
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET;

import aws from 'aws-sdk';
import { json } from '@sveltejs/kit';

// Create a new S3 instance for interacting with our MinIO space. We use S3 because
// the API is the same between MinIO and AWS S3.
const spaces = new aws.S3({
  endpoint: new aws.Endpoint(S3_ENDPOINT),
  accessKeyId: S3_ACCESS_KEY,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  // the two lines below need to be enabled to make it work with MinIO on Northflank
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

export function GET({ url, locals }) {
  const currentUser = locals.user;
  const path = url.searchParams.get('path'); // e.g. 'nachmachen/test/meh.jpg'
  const type = url.searchParams.get('type'); // e.g. 'image/jpeg'
  if (!currentUser) throw new Error('Not authorized');

  const params = {
    Bucket: S3_BUCKET,
    Key: path,
    Expires: 60 * 20, // Expires in 20 minutes
    ContentType: type,
    ACL: 'public-read' // Remove this to make the file private
  };

  let signedUrl = spaces.getSignedUrl('putObject', params);
  // console.log('signedUrl', signedUrl);
  // console.log('S3_ACCESS_KEY', S3_ACCESS_KEY);
  // console.log('S3_SECRET_ACCESS_KEY', S3_SECRET_ACCESS_KEY);
  // console.log('S3_ENDPOINT', S3_ENDPOINT);
  // console.log('S3_BUCKET', S3_BUCKET);
  // Returns https://nachmachen.minio.nachmachen-assets--8j8fmgtqfmwp.addon.code.run/nachmachen/...
  return json({ signedUrl });
}
