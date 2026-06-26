import gameface from 'eslint-plugin-gameface';

export default [
  { ignores: ['**/node_modules/**', 'dist/**'] },
  ...gameface.configs['flat/recommended'],
  {
    settings: {
      gameface: {
        modelsDir: 'gameface-models',
      },
    },
  },
];
