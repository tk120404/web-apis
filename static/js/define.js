/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

(function() {
  var modules = {};
  var urlRE = /^(([A-Za-z0-9_-]+):\/\/)?([^/]*)(\/[^/#?]+)*(\?([^#]*))?(#(.*))?$/;

  window.require = function(name) {
    if ( ! modules.hasOwnProperty(name) )
      throw new Error('Unknown module "' + name + '"');
    return modules[name];
  };

  function getPath() {
    var pathParts = document.currentScript.getAttribute('src').match(urlRE);
    var path;
    if ( pathParts[1] ) {
      // Form: [scheme]://[uname,pw,host,port]/[path]?[query]#[hash].
      // Includes leading "/" and file extension.
      path = pathParts[4].split('/').slice(1);
    } else {
      // Form: [maybe-first-path-part]/[rest-of-path]?[query]#[hash].
      path = (pathParts[3] ? [pathParts[3]] : []).concat(
        pathParts[4].split('/').slice(1));
    }
    var lastPart = path[path.length - 1];
    if ( lastPart.match(/\.js$/) ) {
      path[path.length - 1] = lastPart.substr(
        0, lastPart.length - '.js'.length);
    }

    return path;
  }

  function getDeps(deps) {
    var depModules = new Array(deps.length);
    for ( var i = 0; i < deps.length; i++ ) {
      if ( modules[deps[i]] ) depModules[i] = modules[deps[i]];
    }
    deps = deps.map(window.require);
    return deps;
  }

  window.define = function(a, b, c) {
    if ( arguments.length !== 3 &&
        document.currentScript === undefined ) {
      throw new Error('Unknown module name');
    }

    var path;
    var deps;
    var factory;
    switch (arguments.length) {
      case 1: {
        path = getPath();
        deps = [];
        factory = a;
        break;
      }
      case 2: {
        path = getPath();
        deps = getDeps(a);
        factory = b;
        break;
      }
      default: {
        path = a.split('.');
        deps = getDeps(b);
        factory = c;
        break;
      }
    }
    factory = factory.bind.apply(factory, [window].concat(deps));
    var module = factory();


    var name = '';
    for ( var i = path.length - 1; i >= 0; i-- ) {
      if ( i !== path.length - 1 ) name = '.' + name;
      name = path[i] + name;
      modules[name] = module;
    }

    return module;
  };
  window.define.amd = true;
})();
