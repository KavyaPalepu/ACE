@echo off
echo Starting ACE College Platform...

echo =========================================
echo Installing Backend Dependencies...
echo =========================================
cd backend
call npm install
start cmd /k "echo Starting Backend Server... && npm start"

echo =========================================
echo Installing Mobile Dependencies...
echo =========================================
cd ../mobile
call npm install
start cmd /k "echo Starting Mobile Server... && npm start"

echo =========================================
echo Both servers are starting in new windows!
echo Make sure your MongoDB URI is set in backend/.env
echo =========================================
pause
