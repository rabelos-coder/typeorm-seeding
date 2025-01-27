///<reference path="node_modules/@types/node/index.d.ts"/>

import { Gulpclass, Task, SequenceTask, MergedTask } from 'gulpclass'

const fs = require('fs')
const gulp = require('gulp')
const del = require('del')
const shell = require('gulp-shell')
const replace = require('gulp-replace')
const rename = require('gulp-rename')
const sourcemaps = require('gulp-sourcemaps')
const ts = require('gulp-typescript')

@Gulpclass()
export class Gulpfile {
  // -------------------------------------------------------------------------
  // General tasks
  // -------------------------------------------------------------------------

  /**
   * Creates a delay and resolves after 15 seconds.
   */
  @Task()
  wait(cb: Function) {
    setTimeout(() => cb(), 15000)
  }

  /**
   * Cleans build folder.
   */
  @Task()
  clean(cb: Function) {
    return del(['./build/**'], cb)
  }

  /**
   * Runs typescript files compilation.
   */
  @Task()
  compile() {
    return gulp.src('package.json', { read: false }).pipe(shell(['npm run build']))
  }

  // -------------------------------------------------------------------------
  // Main Packaging and Publishing tasks
  // -------------------------------------------------------------------------

  /**
   * Publishes a package to npm from ./build/package directory.
   */
  @Task()
  packagePublish() {
    return gulp.src('package.json', { read: false }).pipe(shell(['cd ./build/package && npm publish']))
  }

  /**
   * Packs a .tgz from ./build/package directory.
   */
  @Task()
  packagePack() {
    return gulp
      .src('package.json', { read: false })
      .pipe(shell(['cd ./build/package && npm pack && mv -f rabeloscoder-*.tgz ..']))
  }

  /**
   * Publishes a package to npm from ./build/package directory with @next tag.
   */
  @Task()
  packagePublishNext() {
    return gulp.src('package.json', { read: false }).pipe(shell(['cd ./build/package && npm publish --tag next']))
  }

  /**
   * Copies all sources to the package directory.
   */
  @MergedTask()
  packageCompile() {
    const tsProject = ts.createProject('tsconfig.json', {
      typescript: require('typescript'),
    })
    const tsResult = gulp.src(['./src/**/*.ts']).pipe(sourcemaps.init()).pipe(tsProject())

    return [
      tsResult.dts.pipe(gulp.dest('./build/package')),
      tsResult.js
        .pipe(sourcemaps.write('.', { sourceRoot: '', includeContent: true }))
        .pipe(gulp.dest('./build/package')),
    ]
  }

  /**
   * Moves all compiled files to the final package directory.
   */
  @Task()
  packageMoveCompiledFiles() {
    return gulp.src('./build/package/src/**/*').pipe(gulp.dest('./build/package'))
  }

  /**
   * Create ESM index file in the final package directory.
   */
  @Task()
  async packageCreateEsmIndex() {
    const buildDir = './build/package'
    const cjsIndex = require(`${buildDir}/index.js`)
    const cjsKeys = Object.keys(cjsIndex).filter((key) => key !== 'default' && !key.startsWith('__'))

    const indexMjsContent =
      'import TypeORMSeeding from "./index.js";\n' +
      `const {\n    ${cjsKeys.join(',\n    ')}\n} = TypeORMSeeding;\n` +
      `export {\n    ${cjsKeys.join(',\n    ')}\n};\n` +
      'export default TypeORMSeeding;\n'

    fs.writeFileSync(`${buildDir}/index.mjs`, indexMjsContent, 'utf8')
  }

  /**
   * Removes /// <reference from compiled sources.
   */
  @Task()
  packageReplaceReferences() {
    return gulp
      .src('./build/package/**/*.d.ts')
      .pipe(replace(`/// <reference types="node" />`, ''))
      .pipe(replace(`/// <reference types="chai" />`, ''))
      .pipe(gulp.dest('./build/package'))
  }

  /**
   * Moves all compiled files to the final package directory.
   */
  @Task()
  packageClearPackageDirectory(cb: Function) {
    return del(['build/package/src/**'], cb)
  }

  /**
   * Change the "private" state of the packaged package.json file to public.
   */
  @Task()
  packagePreparePackageFile() {
    return gulp
      .src('./package.json')
      .pipe(replace('"private": true,', '"private": false,'))
      .pipe(gulp.dest('./build/package'))
  }

  /**
   * Copies README.md into the package.
   */
  @Task()
  packageCopyReadme() {
    return gulp
      .src('./README.md')
      .pipe(replace(/```typescript([\s\S]*?)```/g, '```javascript$1```'))
      .pipe(gulp.dest('./build/package'))
  }

  /**
   * Creates a package that can be published to npm.
   */
  @SequenceTask()
  package() {
    return [
      'clean',
      ['packageCompile'],
      'packageMoveCompiledFiles',
      'packageCreateEsmIndex',
      ['packageClearPackageDirectory', 'packageReplaceReferences', 'packagePreparePackageFile', 'packageCopyReadme'],
    ]
  }

  /**
   * Creates a package .tgz
   */
  @SequenceTask()
  pack() {
    return ['package', 'packagePack']
  }

  /**
   * Creates a package and publishes it to npm.
   */
  @SequenceTask()
  publish() {
    return ['package', 'packagePublish']
  }

  /**
   * Creates a package and publishes it to npm with @next tag.
   */
  @SequenceTask('publish-next')
  publishNext() {
    return ['package', 'packagePublishNext']
  }
}
