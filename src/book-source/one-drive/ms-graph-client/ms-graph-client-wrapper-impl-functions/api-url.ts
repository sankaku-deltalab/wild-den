// https://docs.microsoft.com/en-us/onedrive/developer/rest-api/concepts/special-folders-appfolder?view=odsp-graph-online
export const appFolderItemByPathApi = (
  parentPath: string[],
  itemName: string
): string => {
  const folderPath = parentPath.length > 0 ? parentPath.join("/") + "/" : ""; // `path/of/folders` or ``
  return `/drive/special/approot:/${folderPath}${itemName}`;
};

export const appFolderItemChildrenByPathApi = (
  parentPath: string[],
  folderName: string
): string => {
  return appFolderItemByPathApi(parentPath, folderName) + ":/children";
};

export const appFolderItemContentByPathApi = (
  parentPath: string[],
  fileName: string
): string => {
  return appFolderItemByPathApi(parentPath, fileName) + ":/content";
};
