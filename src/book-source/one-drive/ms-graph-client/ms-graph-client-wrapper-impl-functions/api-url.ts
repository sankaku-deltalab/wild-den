// https://docs.microsoft.com/en-us/onedrive/developer/rest-api/concepts/special-folders-appfolder?view=odsp-graph-online
export const appFolderItemByPathApi = (
  folders: string[],
  fileName: string
): string => {
  const folderPath = folders.join("/");
  return `/drive/special/approot:/${folderPath}/${fileName}:/content`;
};
