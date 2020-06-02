import { apply, applyTemplates, chain, mergeWith, move, Rule, url } from '@angular-devkit/schematics';
import {
  addProjectToNxJsonInTree,
  names,
  offsetFromRoot,
  projectRootDir,
  ProjectType,
  toFileName,
  updateWorkspaceInTree
} from '@nrwl/workspace';
import * as path from 'path';
import init from '../init/init';
import { GatsbyPluginSchematicSchema } from './schema';

const projectType = ProjectType.Application;

interface NormalizedSchema extends GatsbyPluginSchematicSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  options: GatsbyPluginSchematicSchema
): NormalizedSchema {
  const name = toFileName(options.name);
  const projectDirectory = options.directory
    ? `${toFileName(options.directory)}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${projectRootDir(projectType)}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map(s => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags
  };
}

function createApplicationFiles(options: NormalizedSchema): Rule {
  return mergeWith(
    apply(url(`./files`), [
      applyTemplates({
        ...options,
        ...names(options.name),
        offsetFromRoot: offsetFromRoot(options.projectRoot)
      }),
      move(options.projectRoot)
    ])
  );
}

export default function(options: GatsbyPluginSchematicSchema): Rule {
  const normalizedOptions = normalizeOptions(options);
  return chain([
    init({
      ...options,
      skipFormat: true
    }),
    addProject(normalizedOptions),
    addProjectToNxJsonInTree(normalizedOptions.projectName, {
      tags: normalizedOptions.parsedTags
    }),
    createApplicationFiles(normalizedOptions),
    addPrettierIgnoreEntry(normalizedOptions)
  ]);
}

function addProject(options: NormalizedSchema): Rule {
  return updateWorkspaceInTree(json => {
    const architect: { [key: string]: any } = {};

    architect.build = {
      builder: '@nrwl/gatsby:build'
    };

    architect.serve = {
      builder: '@nrwl/gatsby:develop'
    };

    json.projects[options.projectName] = {
      root: options.projectRoot,
      sourceRoot: `${options.projectRoot}/src`,
      projectType,
      schematics: {},
      architect
    };

    json.defaultProject = json.defaultProject || options.projectName;

    return json;
  });
}

// function addPrettierIgnoreEntry(options: MyAppSchema) {
//  return (tree: Tree, context: SchematicContext) => {

function addPrettierIgnoreEntry(options) {
  return (tree, context) => {
    let prettierIgnoreFile = tree.read('.prettierignore')?.toString('utf-8');
    if (prettierIgnoreFile) {
      prettierIgnoreFile = prettierIgnoreFile + `\n/apps/${options.projectName}/.cache\n/apps/${options.projectName}/public\n`;
      tree.overwrite('.prettierignore', prettierIgnoreFile);
    } else {
      context.logger.warn(`Couldn't find .prettierignore file to update`);
    }
  };
}
