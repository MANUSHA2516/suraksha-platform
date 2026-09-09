import { it, expect } from 'vitest';
const { updateManifest } = require('../apps/mobile/plugins/with-disguise.cjs');
it('configures one enabled launcher alias and preserves deep-link intents', () => {
  const manifest = {
    manifest: {
      application: [
        {
          activity: [
            {
              $: { 'android:name': '.MainActivity' },
              'intent-filter': [
                { category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }] },
                { category: [{ $: { 'android:name': 'android.intent.category.BROWSABLE' } }] },
              ],
            },
          ],
        },
      ],
    },
  };
  const result = updateManifest(manifest);
  const app = result.manifest.application[0];
  expect(app['activity-alias']).toHaveLength(4);
  expect(app['activity-alias'].filter((x: any) => x.$['android:enabled'] === 'true')).toHaveLength(
    1,
  );
  expect(app.activity[0]['intent-filter']).toHaveLength(1);
  expect(updateManifest(result).manifest.application[0]['activity-alias']).toHaveLength(4);
});
