#!/bin/bash

function ex_pid(){
    echo `ps -ef | grep -i ex.out | grep -v "grep" | awk '{print $2}'`
}

function ex_gopath(){
    cd ..
    local_go_path=`pwd | grep -i ex | awk '{print $0}'`
    export GOPATH=$GOPATH:${local_go_path}
    cd ./FiveInARow
}

function ex_close(){
    expid=`ex_pid`
    if [ x$expid != x""  ];then
        kill -9 ${expid}
        echo kill ex : ${expid}
    fi
}

function ex_build(){
    go build -o ex.out main.go

    if [ $? != "0" ];then
        exit $?
    fi
    chmod 755 ex.out
}

function ex_start(){
    nohup ./ex.out > ex.log 2>&1  &
}

function ex_log(){
    tail -f ex.log
}

function ex_help(){
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

function ex_run(){
    ex_gopath
    ex_build
    ex_close
    ex_start
    ex_log
}

case $1 in

    "log")          ex_log
    ;;
    "close")        ex_close
    ;;
    "run")          ex_run
    ;;
    "help")         ex_help
    ;;
    *)
        if [ x$1 != x ];then
            echo unknown command : $1
        fi
        ex_help
    ;;
esac
