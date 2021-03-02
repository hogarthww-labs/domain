import { Tree } from '@nrwl/devkit';
import { DomainLibraryName } from '../model/domain-library-name.enum';
import { getLibraryTypes, isTwoLevelDomain } from '../utils/domain';
import { overwriteInTree, readInTree } from '../utils/tree';

export const updatePathInStorybookConfig = (
  tree: Tree,
  application: string,
  domain: string
): void => {
  const configJsFilePath = `libs/${application}/${domain}/.storybook/config.js`;
  const configJs = readInTree(tree, configJsFilePath);
  if (configJs) {
    const configJsString = configJs.toString();
    const importPaths = getImportPaths(application, domain, tree, true);
    const updatedConfigJs = configJsString.replace(
      /configure\(.*;/,
      `configure([${importPaths}], module);`
    );
    overwriteInTree(tree, configJsFilePath, updatedConfigJs);
  } else {
    const mainJsFilePath = `libs/${application}/${domain}/.storybook/main.js`;
    const mainJs = readInTree(tree, mainJsFilePath);
    const mainJsString = mainJs.toString();
    const importPaths = getImportPaths(application, domain, tree, false);
    let updatedMainJs = mainJsString.replace(
      /rootMain.stories.push\(.*\)/,
      `rootMain.stories.push(...[${importPaths}])`
    );
    if (!isTwoLevelDomain(domain)) {
      updatedMainJs = updatedMainJs.replace(
        '../../../../../.storybook/main',
        '../../../../.storybook/main'
      );
    }
    overwriteInTree(tree, mainJsFilePath, updatedMainJs);
  }
};

const getImportPaths = (
  application: string,
  domain: string,
  tree: Tree,
  isConfigJs: boolean
): string => {
  const libraryTypes = getLibraryTypes(application, domain, tree);
  const isHavingFeatureLibrary = libraryTypes.some(
    (type) => type === DomainLibraryName.Feature
  );
  const isHavingUiLibrary = libraryTypes.some(
    (type) => type === DomainLibraryName.Ui
  );
  let importPaths = '';
  if (isConfigJs) {
    if (isHavingFeatureLibrary) {
      importPaths += `require.context('../feature/src/lib', true, /.stories.ts$/)`;
    }
    if (isHavingFeatureLibrary && isHavingUiLibrary) {
      importPaths += `,`;
    }
    if (isHavingUiLibrary) {
      importPaths += `require.context('../ui/src/lib', true, /.stories.ts$/)`;
    }
  } else {
    if (isHavingFeatureLibrary) {
      importPaths += `'../feature/src/lib/**/*.stories.*'`;
    }
    if (isHavingFeatureLibrary && isHavingUiLibrary) {
      importPaths += `,`;
    }
    if (isHavingUiLibrary) {
      importPaths += `'../ui/src/lib/**/*.stories.*'`;
    }
  }

  return importPaths;
};
