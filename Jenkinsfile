pipeline {
    agent any

    tools {
        nodejs "Node20"
        dockerTool "Dockertool"
    }

    stages {
        stage('Instalar dependencias') {
            steps {
                sh 'chmod +x -R node_modules/.bin/'
                sh 'npm install'
            }
        }
        stage('Ejecutar tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Construir Imagen Docker') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh 'docker build -t hola-mundo-node:latest .'
            }
        }

        stage('Ejecutar Contenedor Node.js') {
            when {
                expression { currentBuild.result == null || currentBuild.result == 'SUCCESS' }
            }
            steps {
                sh '''
                    # Detener y eliminar contenedor anterior si existe
                    docker stop hola-mundo-node || true
                    docker rm hola-mundo-node || true
                    
                    # Ejecutar el contenedor en el puerto 8087 de la máquina local
                    docker run -d --name hola-mundo-node -p 8087:3000 hola-mundo-node:latest
                '''
            }
        }
    }
}
