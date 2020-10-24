import {
  chain,
  Rule,
  Tree,
  SchematicContext,
} from '@angular-devkit/schematics';
import { AddCypressProjectSchematicSchema } from './schema';
import { addE2EProjectRules } from './rule/add-e2e-project-rules';
import { getLibraryTypes, getProjects } from '../../utils/domain';
import { DomainLibraryName } from '../shared/model/domain-library-name.enum';
import { checkDomainExists } from '../shared/validation/check-domain-exists';
import { CypressProject } from '../shared/model/cypress-project.enum';
import { addStorybookProjectRules } from './rule/add-storybook-project-rules';
import { Linter } from '@nrwl/workspace';
import { sortProjects } from '../shared/rule/sort-projects';

export default function (options: AddCypressProjectSchematicSchema): Rule {
  return (tree: Tree, _context: SchematicContext): Rule => {
    const { application, domain, projectType, uiFramework } = options;
    const lint = Linter.EsLint;
    checkDomainExists(application, domain, tree);
    const existingProjectLibraryTypes = getLibraryTypes(
      application,
      domain,
      tree
    );
    let rules =
      projectType === CypressProject.E2E
        ? [
            ...addE2EProjectRules(
              application,
              domain,
              lint,
              existingProjectLibraryTypes
            ),
          ]
        : [
            ...addStorybookProjectRules(
              application,
              domain,
              lint,
              existingProjectLibraryTypes,
              uiFramework
            ),
          ];
    rules = rules.concat(sortProjects());
    return chain(rules);
  };
}
