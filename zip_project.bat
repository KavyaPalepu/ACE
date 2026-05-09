@echo off
echo =========================================
echo Zipping ACE College Platform...
echo =========================================

tar.exe -a -c -f ACE_Project.zip backend mobile start_project.bat

echo =========================================
echo Project successfully zipped into ACE_Project.zip!
echo =========================================
pause
