import { runTypeorm } from './typeorm-runner';

(() => {
  runTypeorm(['migration:run']);
})();
