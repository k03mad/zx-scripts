#!/usr/bin/env zx

$.verbose = false;

const EXPORTER_CONFIG = '/root/procs-exporter.yml';

const COMMAND_COLUMN = 10;
const COMMAND_FILTER = /^\/?[@a-z-]/i;
const COMMAND_REMOVE_CHARS = /:$/;

const [ps, config] = await Promise.all([
    $`ps aux`,
    fs.readFile(EXPORTER_CONFIG, {encoding: 'utf8'}),
]);

const [, ...procSplit] = ps.stdout.split('\n');

const procExec = procSplit
    .map(elem => elem.split(/ +/).slice(COMMAND_COLUMN)[0])
    .filter(elem => elem && COMMAND_FILTER.test(elem))
    .map(elem => elem.split('/').at(-1).replace(COMMAND_REMOVE_CHARS, ''));

const configParsed = YAML.parse(config);

configParsed.process_names[0].exe = [
    ...new Set([
        ...configParsed.process_names[0].exe,
        ...procExec,
    ]),
].sort();

await fs.writeFile(EXPORTER_CONFIG, YAML.stringify(configParsed));
