@echo off
setlocal

REM Check for build type argument
if "%1"=="" (
    echo Please specify build type: debug or release
    exit /b 1
)

REM Build the web app
call npm run build

REM Sync with Android
call npx cap sync android

cd android

REM Perform the build based on type
if "%1"=="debug" (
    call gradlew assembleDebug
    echo Debug APK created at: app\build\outputs\apk\debug\app-debug.apk
) else if "%1"=="release" (
    if "%KEYSTORE_PASSWORD%"=="" (
        echo Please set KEYSTORE_PASSWORD environment variable
        exit /b 1
    )
    if "%KEY_PASSWORD%"=="" (
        echo Please set KEY_PASSWORD environment variable
        exit /b 1
    )
    call gradlew assembleRelease
    echo Release APK created at: app\build\outputs\apk\release\app-release.apk
) else (
    echo Invalid build type. Use debug or release
    exit /b 1
)

cd ..