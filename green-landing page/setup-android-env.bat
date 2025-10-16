@echo off
setlocal

REM Set ANDROID_SDK_ROOT
set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
setx ANDROID_SDK_ROOT "%ANDROID_SDK_ROOT%"

REM Add platform-tools to PATH
set "PATH=%PATH%;%ANDROID_SDK_ROOT%\platform-tools"
setx PATH "%PATH%"

REM Accept Android SDK licenses
call sdkmanager --licenses

echo Android environment variables have been set:
echo ANDROID_SDK_ROOT=%ANDROID_SDK_ROOT%
echo.
echo Please restart your terminal after running this script.
pause