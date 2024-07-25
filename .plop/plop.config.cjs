const DEFAULT_HOOKS_PATH = 'src/hooks';
const DEFAULT_VARIANT = 'hook';

const getConfig = (variant, path) => {
  switch (variant) {
    case 'storeHook':
      return [
        {
          type: 'add',
          path: `../${path}/{{ name }}/index.ts`,
          templateFile: './storeHook/index.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}.hook.ts`,
          templateFile: './storeHook/hookName.hook.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}.types.ts`,
          templateFile: './storeHook/hookName.types.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}.test.ts`,
          templateFile: './storeHook/hookName.test.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/README.md`,
          templateFile: './storeHook/README.md.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}Store.ts`,
          templateFile: './storeHook/hookNameStore.ts.hbs',
          abortOnFail: true,
        },
      ];
    case DEFAULT_VARIANT:
    default:
      return [
        {
          type: 'add',
          path: `../${path}/{{ name }}/index.ts`,
          templateFile: './hook/index.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}.hook.ts`,
          templateFile: './hook/hookName.hook.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}.types.ts`,
          templateFile: './hook/hookName.types.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/{{ name }}.test.ts`,
          templateFile: './hook/hookName.test.ts.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/README.md`,
          templateFile: './hook/README.md.hbs',
          abortOnFail: true,
        },
        {
          type: 'add',
          path: `../${path}/{{ name }}/data.ts`,
          templateFile: './hook/data.ts.hbs',
          abortOnFail: true,
        },
      ];
  }
};

const hookGenerator = {
    description: 'Creating a new hook',
    prompts: [
      {
        type: 'list',
        name: 'variant',
        message: 'Hook dir variant',
        default: DEFAULT_VARIANT,
        choices: [DEFAULT_VARIANT, 'storeHook'],
      },
      {
        type: 'input',
        name: 'name',
        message: 'Hook name',
        default: 'loader',
      },
      {
        type: 'input',
        name: 'prefix',
        message: 'Hook prefix',
        default: 'use',
      },
      {
        type: 'input',
        name: 'path',
        message: 'The path by which the hook will be created',
        default: DEFAULT_HOOKS_PATH,
      }
    ],
    actions: ({variant = DEFAULT_VARIANT, path = DEFAULT_HOOKS_PATH}) => {
        // Слэш в конце всегда убирается что бы избежать ошибок
        path = path.replace(/(.*)(\/)$/, (_, pathWithoutEndSlash) => pathWithoutEndSlash);

        return [
          // copy files
          ...getConfig(variant, path),
          // add imports
          {
            type: 'append',
            path: `../${path}/index.ts`,
            template: `export * from './{{ name }}';\n`,
            abortOnFail: false,
            unique: true,
          },
        ];
    },
};

module.exports = plop => {
  plop.setHelper('fullName', (prefix, name) => `${prefix}${name.charAt(0).toUpperCase() + name.slice(1)}`);
  plop.setGenerator('hook', hookGenerator);
};
