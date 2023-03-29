# 1、将静态文件包拷贝到docker目录中
# 2、构建镜像

#!/bin/bash

version="v2.0"

function build_image()
{
    work_path=$(pwd)
    echo "当前目录："$work_path

    cd ../
    project_path=$(pwd)
    echo "当前项目目录："$project_path

    latest_commit_id=$(git rev-parse --short HEAD)
    branch=$(git symbolic-ref --short -q HEAD)

    rm -rf docker/web/*

    cp -rP ./Code docker/web/
    cp -rP ./CSS docker/web/
    cp -rP ./Images docker/web/
    cp -rP ./JScript docker/web/
    cp index.html docker/web/

    cd docker
    time=$(date "+%Y%m%d_%H%M%S")
    tag=$version"_"$branch"_"$time"_"$latest_commit_id
    docker_name=$1":"$tag

    sudo docker build -t $docker_name .
}

# 根据各个项目修改
project_name="webphotoshop-web"

# 入口
build_image $project_name
