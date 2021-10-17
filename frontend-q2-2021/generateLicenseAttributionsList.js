/* eslint-disable ts-immutable/no-reject */

//This file extracts all packages used in webpack (plus hardcoded ones) into a file to be used on the third-party
//attribution page!+

//Note: This file logs to stderr, as the stdin output is piped into a file.

console.error('generateLicenseAttributionsList started');

const axios = require('axios');
const { exec } = require('child_process');

const possibleLicenseFileNames = ['LICENSE', 'license'];
const possibleLicenseFileExtensions = ['', '.txt', '.md'];

//DO NOT EDIT THE SECTION BELOW WITHOUT READING AND UNDERSTANDING WHICH LICENSES WE CAN USE (bundling = distributing code!!)
// see https://medium.com/@vovabilonenko/licenses-of-npm-dependencies-bacaa00c8c65 for a good intro to the topic.
const allowedLicenses = [
  'Creative Commons Attribution 2.0',
  'Apache-2.0',
  'MIT',
  'ISC',
  'Apache License',
];
// DO NOT EDIT THE SECTION ABOVE WITHOUT READING AND UNDERSTANDING WHICH LICENSES WE CAN USE (bundling = distributing code!!)

let list = [
  {
    name: 'Animation by Bhargav Savaliya on LottieFiles',
    link: 'https://lottiefiles.com/70806-checkmark',
    license: 'Creative Commons Attribution 2.0',
    licenseLink: 'https://creativecommons.org/licenses/by/2.0/legalcode',
  },
  {
    name: 'cordova',
    link: 'https://cordova.apache.org',
    license: 'Apache-2.0',
    licenseLink:
      'https://raw.githubusercontent.com/apache/cordova-cli/master/LICENSE',
  },
  {
    name: 'webpack',
    link: 'https://webpack.js.org',
    license: 'MIT',
    licenseLink:
      'https://raw.githubusercontent.com/webpack/webpack/main/LICENSE',
  },
  {
    name: 'babel',
    link: 'https://babeljs.io/',
    license: 'MIT',
    licenseLink: 'https://raw.githubusercontent.com/babel/babel/main/LICENSE',
  },
];

let handled = [];

const execPromise = (command) =>
  new Promise((resolve) =>
    exec(command, (error, stdout, stderr) => resolve({ error, stdout, stderr }))
  );

//git remote show command requires you to be inside a git repo...
let emptyGitRepoCreated = execPromise(
  'mkdir -p /tmp/git && cd /tmp/git && git init'
).then(({ error, stdout, stderr }) => {
  if (error !== null) {
    console.error('Could not create empty git repo', { error, stdout, stderr });
    process.exit(1);
  }
});

const addNodeModule = (basePath, package) => {
  if (package.length > 0 && !handled.includes(package)) {
    console.error('generating entry for', basePath, package);

    handled = [...handled, package];

    const packageJson = require(`${basePath}/${package}/package.json`);

    const packageData = {
      name: package,
      link: packageJson.homepage,
      license: packageJson.license,
    };

    let gitUrl =
      typeof packageJson.repository === 'string'
        ? packageJson.repository
        : packageJson.repository.url;
    if (!gitUrl) {
      console.error(basePath, package, 'does not contain a git url');
      process.exit(1);
    }
    if (gitUrl.startsWith('git+')) {
      gitUrl = gitUrl.substr('git+'.length);
    }

    if (
      gitUrl.startsWith('https://github.com/') ||
      gitUrl.startsWith('github:')
    ) {
      let gitIdentifier;
      if (gitUrl.startsWith('https://github.com/')) {
        gitIdentifier = gitUrl.substr('https://github.com/'.length);
        if (gitIdentifier.endsWith('.git')) {
          gitIdentifier = gitIdentifier.substr(
            0,
            gitIdentifier.length - '.git'.length
          );
        }
      } else {
        gitIdentifier = gitUrl.substr('github:'.length);
      }

      const promise = emptyGitRepoCreated
        .then(() =>
          execPromise(
            `cd /tmp/git && git remote show "https://github.com/${gitIdentifier}.git"`
          )
        )
        .then(({ error, stdout, stderr }) => {
          if (error !== null) {
            console.error(
              basePath,
              package,
              'could not fetch git HEAD branch:',
              { error, stdout, stderr }
            );
            process.exit(1);
          }
          console.error(
            'fetched git head branch name',
            basePath,
            gitIdentifier
          );
          const headBranch = stdout
            .trim()
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s.startsWith('HEAD branch: '))
            .map((s) => s.substr('HEAD branch: '.length));
          if (headBranch.length !== 1) {
            console.error(
              basePath,
              package,
              'could not read git HEAD branch:',
              { stdout }
            );
            process.exit(1);
          }

          return headBranch;
        })
        .then((headBranch) => {
          let dataPromise = Promise.reject();
          for (let name of possibleLicenseFileNames) {
            for (let extension of possibleLicenseFileExtensions) {
              dataPromise = dataPromise.catch(() => {
                const url = `https://raw.githubusercontent.com/${gitIdentifier}/${headBranch[0]}/${name}${extension}`;
                console.error('Attempting to fetch license', url);
                return axios
                  .get(url)
                  .catch((error) => {
                    console.error(
                      error.config.url,
                      'failed. Response status:',
                      error.response.status
                    );
                    return Promise.reject(error);
                  })
                  .then((response) => {
                    console.error(
                      'Successfully fetched license under',
                      response.config.url
                    );
                    return {
                      ...packageData,
                      licenseLink: response.config.url,
                    };
                  });
              });
            }
          }

          return dataPromise.catch((e) => {
            console.error(
              'Failed generating license url for',
              basePath,
              package,
              e
            );
            process.exit(1);
          });
        });

      list = [...list, promise];
    } else {
      console.error(
        'Could not convert git url to license url for package',
        basePath,
        package
      );
      process.exit(1);
    }
  }
};

//include data from webpack
const collectGroupInfoFromWebpack = (data) => {
  if (data.path && data.path.startsWith('./node_modules/')) {
    //ignore local components
    let package = data.path.substr('./node_mdoules/'.length);
    if (package.startsWith('@quasar/extras/')) {
      package = package.substr('@quasar/extras/'.length);
      package = package.substring(0, package.indexOf('/'));

      if (package.length > 0 && !handled.includes(package)) {
        console.error('Adding entry for quasar extra', package);
        handled = [...handled, package];

        const packageData = {
          name: `${package} (via @quasar/extras)`,
          link: 'https://github.com/quasarframework/quasar/blob/dev/extras/README.md',
        };

        let promise = Promise.reject();
        for (const name of possibleLicenseFileNames) {
          for (const extension of possibleLicenseFileExtensions) {
            promise = promise.catch(() =>
              axios
                .get(
                  `https://raw.githubusercontent.com/quasarframework/quasar/dev/extras/${package}/${name}${extension}`
                )
                .then((response) => ({
                  ...packageData,
                  license: response.data.trim().split('\n')[0].trim(),
                  licenseLink: response.config.url,
                }))
            );
          }
        }
        list = [
          ...list,
          promise.catch((e) => {
            console.error('Failed fetching license for', packageData, e);
            process.exit(1);
          }),
        ];
      }
    } else {
      if (package[0] === '@') {
        package = package.split('/');
        if (package.length > 1) {
          package = package[0] + '/' + package[1];
        } else {
          package = '';
        }
      } else {
        package = package.substring(0, package.indexOf('/'));
      }
      addNodeModule('../node_modules', package);
    }
  }

  if (data.groups) {
    data.groups.forEach(collectGroupInfoFromWebpack);
  }
};
require('../dist/spa/report.json').forEach(collectGroupInfoFromWebpack);

//include data from mobile version:
const cordovaPackageJson = require('../src-cordova/package.json');
Object.keys(cordovaPackageJson.devDependencies || {})
  .concat(Object.keys(cordovaPackageJson.dependencies || {}))
  .forEach((package) => {
    console.error('Adding entry for cordova', package);
    addNodeModule('../src-cordova/node_modules', package);
  });

//output list
Promise.all(list)
  .then((list) => {
    let notAllowed = [];
    list.forEach((i) => {
      if (!allowedLicenses.includes(i.license)) {
        notAllowed = [...notAllowed, i];
      }
    });
    if (notAllowed.length !== 0) {
      console.error('Licenses not part of allow-list:', i);
      process.exit(2);
    }
    return list;
  })
  .then(
    (list) =>
      (list = [...list].sort((a, b) => {
        const aName = a.name;
        const bName = b.name;

        return aName === bName ? 0 : aName < bName ? -1 : 1;
      }))
  )
  .then((l) => JSON.stringify(l))
  .then(console.log)
  .then(() =>
    console.error('generateLicenseAttributionsList finished successfully')
  )
  .catch((e) => {
    console.log(e);
    process.exit(1);
  });
