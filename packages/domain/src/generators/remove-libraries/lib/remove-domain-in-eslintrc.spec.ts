import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { readJson, Tree } from '@nrwl/devkit';
import { removeDomainInEslintrc } from './remove-domain-in-eslintrc';

describe('removeDomainInEslintrc', () => {
  let appTree: Tree;
  const application = 'bank-application';
  const domain = 'cash-account/account-details';
  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });
  it('should remove domain in eslintrc.json', () => {
    const originalEslintRcJson = {
      overrides: [
        {
          rules: {
            '@nrwl/nx/enforce-module-boundaries': [
              'error',
              {
                depConstraints: [
                  {
                    sourceTag:
                      'scope:bank-application-cash-account-account-details',
                    onlyDependOnLibsWithTags: [
                      'scope:bank-application-cash-account-shared',
                    ],
                  },
                  {
                    sourceTag: 'scope:bank-application-cash-account-dashboard',
                    onlyDependOnLibsWithTags: [
                      'scope:bank-application-cash-account-account-details',
                      'scope:bank-application-cash-account-shared',
                    ],
                  },
                ],
              },
            ],
          },
        },
      ],
    };

    appTree.write('.eslintrc.json', JSON.stringify(originalEslintRcJson));
    removeDomainInEslintrc(appTree, application, domain);
    const eslintRcJson = readJson(appTree, '.eslintrc.json');
    expect(
      eslintRcJson.overrides[0].rules['@nrwl/nx/enforce-module-boundaries'][1]
        .depConstraints
    ).toEqual([
      {
        onlyDependOnLibsWithTags: [
          'scope:bank-application-cash-account-shared',
        ],
        sourceTag: 'scope:bank-application-cash-account-dashboard',
      },
    ]);
  });
  it('should remove domain in tslint.json', () => {
    const originalTslintJson = {
      rules: {
        'nx-enforce-module-boundaries': [
          true,
          {
            allow: [],
            depConstraints: [
              {
                sourceTag:
                  'scope:bank-application-cash-account-account-details',
                onlyDependOnLibsWithTags: [
                  'scope:bank-application-cash-account-shared',
                ],
              },
              {
                sourceTag: 'scope:bank-application-cash-account-dashboard',
                onlyDependOnLibsWithTags: [
                  'scope:bank-application-cash-account-account-details',
                  'scope:bank-application-cash-account-shared',
                ],
              },
            ],
            enforceBuildableLibDependency: true,
          },
        ],
      },
    };
    appTree.write('tslint.json', JSON.stringify(originalTslintJson));
    removeDomainInEslintrc(appTree, application, domain);
    const tslintJson = readJson(appTree, 'tslint.json');
    expect(
      tslintJson.rules['nx-enforce-module-boundaries'][1].depConstraints
    ).toEqual([
      {
        onlyDependOnLibsWithTags: [
          'scope:bank-application-cash-account-shared',
        ],
        sourceTag: 'scope:bank-application-cash-account-dashboard',
      },
    ]);
  });
});
