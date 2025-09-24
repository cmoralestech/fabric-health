@echo off
echo Initializing MongoDB replica set...
timeout /t 3 /nobreak > nul
"C:\Program Files\MongoDB\Server\8.2\bin\mongosh.exe" --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
