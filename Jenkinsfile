pipeline {
    agent any

    tools {
        dockerTool "Dockertool"
    }

    environment {
        APP_IMAGE = "hola-mundo-node:latest"
        APP_CONTAINER = "hola-mundo-node"
        NODE_IMAGE = "node:20-bullseye"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Instalar dependencias') {
            steps {
                script {
                    // Verificamos si 'package.json' existe antes de correr npm
                    def fileExists = fileExists 'package.json'
                    if (fileExists) {
                        sh '''
                            docker run --rm \
                                -v "$PWD:/app" \
                                -w /app \
                                ${NODE_IMAGE} \
                                bash -lc "npm install"
                        '''
                    } else {
                        error 'No se encuentra el archivo package.json en el repositorio'
                    }
                }
            }
        }

        stage('Ejecutar tests') {
            steps {
                sh '''
                    docker run --rm \
                      -v "$PWD:/app" \
                      -w /app \
                      ${NODE_IMAGE} \
                      bash -lc "npm test"
                '''
            }
        }

        stage('Construir Imagen Docker') {
            steps {
                sh 'docker build -t ${APP_IMAGE} .'
            }
        }

        stage('Ejecutar Contenedor Node.js') {
            steps {
                sh '''
                    docker stop ${APP_CONTAINER} || true
                    docker rm ${APP_CONTAINER} || true
                    docker run -d --name ${APP_CONTAINER} -p 3000:3000 ${APP_IMAGE}
                '''
            }
        }
    }

    post {
        always {
            echo "Pipeline finalizado con estado: ${currentBuild.currentResult}"
        }
    }
}
