import {
  S3_ENDPOINT,
  S3_ACCESS_KEY,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET
} from '$env/static/private';

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
  return json({ signedUrl });
}
