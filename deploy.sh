#!/bin/bash

function gobang_pid(){
    echo `ps -ef | grep -i gobang.out | grep -v "grep" | awk '{print $2}'`
}

function gobang_gopath(){
    cd ..
    local_go_path=`pwd | grep -i gobang | awk '{print $0}'`
    export GOPATH=$GOPATH:${local_go_path}
    cd ./FiveInARow
}

function gobang_close(){
    gobangpid=`gobang_pid`
    if [ x$gobangpid != x""  ];then
        kill -9 ${gobangpid}
        echo kill gobang : ${gobangpid}
    fi
}

function gobang_build(){
    go build -o gobang.out main.go

    if [ $? != "0" ];then
        exit $?
    fi
    chmod 755 gobang.out
}

function gobang_start(){
    nohup ./gobang.out > gobang.log 2>&1  &
}

function gobang_log(){
    tail -f gobang.log
}

function gobang_help(){
    echo "usage: $0 [<command>] [<args>]"
    echo ""
    echo "These are common $0 commands used in various situations:"
    echo "      run         Close the old instance (if exist), build and run a new one."
    echo "      close       Close the running instance (if exist)."
    echo "      log         Show logs."
    echo "      help        Show help information."
    echo ""
    echo "See '$0 help' to read about this infomation."
}

function gobang_run(){
    # gobang_gopath
    gobang_build
    gobang_close
    gobang_start
    gobang_log
}

case $1 in

    "log")          gobang_log
    ;;
    "close")        gobang_close
    ;;
    "run")          gobang_run
    ;;
    "help")         gobang_help
    ;;
    *)
        if [ x$1 != x ];then
            echo unknown command : $1
        fi
        gobang_help
    ;;
esac
