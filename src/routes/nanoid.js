import { customAlphabet } from "nanoid";

const _nanoid = customAlphabet(
  "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz",
  23
);

// A custom nanoid of length 23 with no numbers and no "_" or "-" to be used as HTML ids
export default function nanoid() {
  return _nanoid();
}
