// gradleProperties.js
module.exports = {
  android: {
    // Debug build settings
    debug: {
      keystore: 'debug.keystore',
      storePassword: 'android',
      alias: 'androiddebugkey',
      password: 'android',
      keystoreType: 'jks',
    },
    // Release build settings (you'll need to update these with your actual values)
    release: {
      keystore: 'release.keystore',
      storePassword: process.env.KEYSTORE_PASSWORD,
      alias: 'key0',
      password: process.env.KEY_PASSWORD,
      keystoreType: 'jks',
    },
    // Build settings
    buildTypes: {
      debug: {
        signingConfig: 'debug',
      },
      release: {
        signingConfig: 'release',
        minifyEnabled: true,
        proguardFiles: ['proguard-rules.pro'],
      },
    },
  },
};