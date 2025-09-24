@echo off
echo Starting MongoDB as replica set...
"C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db" --replSet rs0 --port 27017

