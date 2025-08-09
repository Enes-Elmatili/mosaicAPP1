import { describe, it, expect } from 'vitest';
import YAML from 'yamljs';
import path from 'path';

describe('OpenAPI contract sanity', () => {
  const spec = YAML.load(path.join(process.cwd(), 'openapi.yaml'));

  it('has requests paths and schemas', () => {
    expect(spec.paths['/requests']).toBeTruthy();
    expect(spec.paths['/requests/{id}']).toBeTruthy();
    expect(spec.components.schemas.MaintenanceRequest).toBeTruthy();
    expect(spec.components.schemas.MaintenanceRequestCreate).toBeTruthy();
  });

  it('has uploads endpoint', () => {
    expect(spec.paths['/uploads']).toBeTruthy();
  });
});

