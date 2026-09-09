const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
} = require('@expo/config-plugins');
const fs = require('node:fs/promises');
const path = require('node:path');
const names = ['Suraksha', 'Calculator', 'Notes', 'Weather'];
function updateManifest(manifest) {
  const app = manifest.manifest.application[0];
  const main = app.activity.find((a) => a.$['android:name'] === '.MainActivity');
  if (!main) throw new Error('Suraksha disguise plugin requires .MainActivity');
  main['intent-filter'] = (main['intent-filter'] || []).filter(
    (f) => !f.category?.some((c) => c.$['android:name'] === 'android.intent.category.LAUNCHER'),
  );
  app['activity-alias'] = (app['activity-alias'] || []).filter(
    (a) => !names.some((n) => a.$['android:name'] === `.${n}Alias`),
  );
  for (const name of names)
    app['activity-alias'].push({
      $: {
        'android:name': `.${name}Alias`,
        'android:targetActivity': '.MainActivity',
        'android:enabled': name === 'Suraksha' ? 'true' : 'false',
        'android:exported': 'true',
        'android:label': name,
        'android:icon':
          name === 'Suraksha' ? '@mipmap/ic_launcher' : `@drawable/disguise_${name.toLowerCase()}`,
      },
      'intent-filter': [
        {
          action: [{ $: { 'android:name': 'android.intent.action.MAIN' } }],
          category: [{ $: { 'android:name': 'android.intent.category.LAUNCHER' } }],
        },
      ],
    });
  return manifest;
}
module.exports = function withDisguise(config) {
  config = withAndroidManifest(config, (c) => {
    c.modResults = updateManifest(c.modResults);
    return c;
  });
  config = withMainApplication(config, (c) => {
    if (c.modResults.language !== 'kt') throw new Error('Expected Kotlin MainApplication');
    if (!c.modResults.contents.includes('add(SurakshaDisguisePackage())')) {
      if (!c.modResults.contents.includes('PackageList(this).packages.apply {'))
        throw new Error('Unexpected MainApplication package registration; inspect before building');
      c.modResults.contents = c.modResults.contents.replace(
        'PackageList(this).packages.apply {',
        'PackageList(this).packages.apply {\n              add(SurakshaDisguisePackage())',
      );
    }
    return c;
  });
  return withDangerousMod(config, [
    'android',
    async (c) => {
      const packageName = config.android.package;
      const folder = path.join(
        c.modRequest.platformProjectRoot,
        'app/src/main/java',
        ...packageName.split('.'),
      );
      await fs.mkdir(folder, { recursive: true });
      await fs.writeFile(
        path.join(folder, 'SurakshaDisguisePackage.kt'),
        `package ${packageName}
import android.content.ComponentName
import android.content.pm.PackageManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager
class SurakshaDisguisePackage : ReactPackage {
 override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(SurakshaDisguiseModule(context))
 override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
class SurakshaDisguiseModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
 override fun getName() = "SurakshaDisguise"
 @ReactMethod fun setDisguise(value: String, promise: Promise) {
  val choices = mapOf("suraksha" to "Suraksha", "calculator" to "Calculator", "notes" to "Notes", "weather" to "Weather")
  val selected = choices[value] ?: run { promise.reject("INVALID_DISGUISE", "Unknown disguise"); return }
  try {
   // Enable the new launcher before removing the prior one, avoiding an unlaunchable app.
   val manager = context.packageManager
   manager.setComponentEnabledSetting(ComponentName(context.packageName, context.packageName + "." + selected + "Alias"), PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
   choices.values.filter { it != selected }.forEach { name ->
    manager.setComponentEnabledSetting(ComponentName(context.packageName, context.packageName + "." + name + "Alias"), PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)
   }
   promise.resolve(true)
  } catch (error: Exception) { promise.reject("DISGUISE_FAILED", "Launcher could not be updated", error) }
 }
}
`,
      );
      const resources = path.join(c.modRequest.platformProjectRoot, 'app/src/main/res/drawable');
      await fs.mkdir(resources, { recursive: true });
      const paths = {
        calculator:
          'M5,2 L19,2 L19,22 L5,22 Z M8,5 L16,5 L16,9 L8,9 Z M8,12 L10,12 M14,12 L16,12 M8,16 L10,16 M14,16 L16,16',
        notes: 'M5,2 L19,2 L19,22 L5,22 Z M8,7 L16,7 M8,11 L16,11 M8,15 L14,15',
        weather: 'M6,17 C0,17 0,9 6,9 C6,1 18,1 18,9 C25,9 25,17 18,17 Z',
      };
      for (const [name, data] of Object.entries(paths))
        await fs.writeFile(
          path.join(resources, `disguise_${name}.xml`),
          `<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="48dp" android:height="48dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#F4F8FB" android:pathData="M0,0h24v24h-24z"/><path android:fillColor="#00000000" android:strokeColor="#153D7A" android:strokeWidth="1.6" android:pathData="${data}"/></vector>`,
        );
      return c;
    },
  ]);
};
module.exports.updateManifest = updateManifest;
