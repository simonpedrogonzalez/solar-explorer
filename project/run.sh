# get PID on port 8081 if there is one and kill it
pid=$(lsof -t -i:8081)
if [ -n "$pid" ]; then
    kill -9 $pid
fi
python -m http.server 8081 | google-chrome http://localhost:8081/ &


            