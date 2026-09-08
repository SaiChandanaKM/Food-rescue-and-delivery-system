pipeline {
    agent any

    tools {
        nodejs 'NodeJS-18'   // Configure this name under Manage Jenkins > Tools
    }

    environment {
        BACKEND_IMAGE  = 'foodbridge-backend'
        FRONTEND_IMAGE = 'foodbridge-frontend'
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
                    sh 'npm install'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                dir('frontend') {
                    sh 'npx eslint src || true'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} ./backend"
                sh "docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} ./frontend --build-arg VITE_API_URL=http://localhost:5001/api --build-arg VITE_SOCKET_URL=http://localhost:5001"
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose up -d --build'
            }
        }
    }

    post {
        success {
            echo 'FoodBridge build and deployment succeeded.'
        }
        failure {
            echo 'FoodBridge build failed — check the stage logs above.'
        }
    }
}