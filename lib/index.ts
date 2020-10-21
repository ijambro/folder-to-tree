import * as _loash from 'lodash';
import * as fs from 'fs';
import * as path from 'path';
import { IMap, IFolder2TreeOptions } from './types';

const defaultOption: IFolder2TreeOptions = {
    isIgnoreHiddenFolderOrFile: true,
    ignoreFilePattern: /node_modules/,
    reachLeafNodeCallback: (leafPath: string) => leafPath,
};
const buildTreeModel = async (linkNodeRef: IMap<Object>,
                        currentDirName: string,
                        options: IFolder2TreeOptions): Promise<IMap<Object>> => {
    const listStrNode: string[] = (fs.readdirSync(currentDirName, {encoding: 'utf8'}) || [])
            .filter((subFileName: string) => {
                const isIgnorePattern: boolean = options.ignoreFilePattern.test(subFileName);
                const hiddenFileRegPattern: RegExp = /^\..*/;
                if (options.isIgnoreHiddenFolderOrFile) {
                    return !hiddenFileRegPattern.test(subFileName) && !isIgnorePattern;
                } else {
                    return !isIgnorePattern;
                }
            });
    for (let index = 0; index < listStrNode.length; index++) {
        const currentFileName: string = listStrNode[index];
        const currentFileAbsPath = path.resolve(currentDirName, currentFileName);
        const isFileFolder: boolean = fs.statSync(currentFileAbsPath).isDirectory();
        if (isFileFolder) {
            const subTreeNode: IMap<Object> = {};
            linkNodeRef[currentFileName] = subTreeNode;
            buildTreeModel(subTreeNode, currentFileAbsPath, options);
        } else {
            linkNodeRef[currentFileName] = await options.reachLeafNodeCallback(currentFileAbsPath);
        }
    }
    return linkNodeRef;
};

export async function folderToTree (dirName: string, options: IFolder2TreeOptions = defaultOption): undefined|Promise<IMap<Object>> {
    const isDirNameValid: boolean = fs.existsSync(dirName);
    if (!isDirNameValid) {
        return undefined;
    } else {
        const RootNode = {};
        return await buildTreeModel(RootNode, dirName, options);
    }
}
