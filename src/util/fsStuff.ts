import fs from 'fs';
const fsPromises = fs.promises;

export async function fileExists(path: string): Promise<boolean> {
  return await fsPromises
    .access(path)
    .then(() => true)
    .catch(() => false);
}
export async function readFile(path: string): Promise<string> {
  return (await fsPromises.readFile(path)).toString();
}
