pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'
    }

    environment {
        BACKEND_IMAGE  = 'rescuemeal-backend'
        FRONTEND_IMAGE = 'rescuemeal-frontend'
        DOCKER_HOST    = 'tcp://localhost:2375'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    bat 'npx eslint . || exit 0'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat "docker build -t %BACKEND_IMAGE%:%BUILD_NUMBER% ./backend"
                bat "docker build -t %FRONTEND_IMAGE%:%BUILD_NUMBER% ./frontend --build-arg VITE_API_URL=http://localhost:5000/api"
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker-compose down'
                bat 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo 'RescueMeal build and deployment succeeded.'
        }
        failure {
            echo 'RescueMeal build failed — check the stage logs above.'
        }
    }
}