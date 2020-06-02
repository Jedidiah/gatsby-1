import { JsonObject } from '@angular-devkit/core';
import { chain, Rule } from '@angular-devkit/schematics';
import { addDepsToPackageJson, updateWorkspace } from '@nrwl/workspace';
import { setDefaultCollection } from '@nrwl/workspace/src/utils/rules/workspace';
import {
  babelPluginModuleResolver,
  gatsbyImageVersion,
  gatsbyPluginManifestVersion,
  gatsbyPluginOfflineVersion,
  gatsbyPluginReactHelmetVersion,
  gatsbyPluginSharpVersion,
  gatsbyPluginTypescript,
  gatsbySourceFilesystemVersion,
  gatsbyTransformerSharpVersion,
  gatsbyVersion,
  nxVersion,
  prettierVersion,
  propTypesVersion,
  reactDomVersion,
  reactHelmetVersion,
  reactVersion
} from '../../utils/versions';
import { Schema } from './schema';

function jsonIdentity(x: any): JsonObject {
  return x as JsonObject;
}

function setDefault(): Rule {
  const updateProjectWorkspace = updateWorkspace(workspace => {
    workspace.extensions.schematics =
      jsonIdentity(workspace.extensions.schematics) || {};

    const gatsbySchematics =
      jsonIdentity(workspace.extensions.schematics['@nrwl/gatsby']) || {};

    workspace.extensions.schematics = {
      ...workspace.extensions.schematics,
      '@nrwl/gatsby': {
        application: {
          ...jsonIdentity(gatsbySchematics.application)
        }
      }
    };
  });
  return chain([setDefaultCollection('@nrwl/gatsby'), updateProjectWorkspace]);
}

export default function(schema: Schema) {
  return chain([
    setDefault(),
    addDepsToPackageJson(
      {
        'gatsby': gatsbyVersion,
        'gatsby-image': gatsbyImageVersion,
        'gatsby-plugin-manifest': gatsbyPluginManifestVersion,
        'gatsby-plugin-offline': gatsbyPluginOfflineVersion,
        'gatsby-plugin-react-helmet': gatsbyPluginReactHelmetVersion,
        'gatsby-plugin-sharp': gatsbyPluginSharpVersion,
        'gatsby-source-filesystem': gatsbySourceFilesystemVersion,
        'gatsby-transformer-sharp': gatsbyTransformerSharpVersion,
        'prop-types': propTypesVersion,
        'react': reactVersion,
        'react-dom': reactDomVersion,
        'react-helmet': reactHelmetVersion,
        'gatsby-plugin-typescript': gatsbyPluginTypescript
      },
      {
        '@angular-devkit/schematics': nxVersion,
        '@nrwl/react': nxVersion,
        'prettier': prettierVersion,
        'babel-plugin-module-resolver': babelPluginModuleResolver
      }
    )
  ]);
}
