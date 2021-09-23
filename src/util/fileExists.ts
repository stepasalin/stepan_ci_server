import fs from 'fs';

export async function fileExists(filePath: string): Promise<boolean>{
    return new Promise((resolve) => {
        fs.access(filePath, fs.constants.F_OK, (err) => {
            err ? resolve(false) : resolve(true)
        });
    })
}