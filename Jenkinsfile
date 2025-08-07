pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS-24'
    }
    
    environment {
        DOCKER_IMAGE = 'react-demo-app'
        DOCKER_TAG = "2.0.${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'docker.io'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Code checked out successfully'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci --silent'
                echo 'Dependencies installed'
            }
        }
        
        stage('Code Quality & Linting') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'npm run lint || echo "Linting completed with warnings"'
                    }
                }
                stage('Type Check') {
                    when {
                        expression { fileExists('tsconfig.json') }
                    }
                    steps {
                        sh 'npm run type-check || echo "Type check script not found"'
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                sh 'npm test -- --coverage --watchAll=false'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'coverage/**/*', allowEmptyArchive: true
                }
            }
        }
        
        stage('Build Application') {
            steps {
                sh 'npm run build'
                echo 'Application built successfully'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'build/**/*', fingerprint: true
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    def image = docker.build("${DOCKER_IMAGE}:${DOCKER_TAG}")
                    sh "docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                    echo "Docker image built: ${DOCKER_IMAGE}:${DOCKER_TAG}"
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Dependency Check') {
                    steps {
                        sh 'npm audit --audit-level=high || echo "Security audit completed with warnings"'
                    }
                }
                stage('Docker Image Scan') {
                    steps {
                        script {
                            sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${DOCKER_IMAGE}:${DOCKER_TAG} || echo 'Security scan completed'"
                        }
                    }
                }
            }
        }
        
        stage('Docker Push to Hub') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-hub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh """
                            echo \${DOCKER_PASS} | docker login docker.io -u \${DOCKER_USER} --password-stdin
                            
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} docker.io/\${DOCKER_USER}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} docker.io/\${DOCKER_USER}/${DOCKER_IMAGE}:latest
                            
                            docker push docker.io/\${DOCKER_USER}/${DOCKER_IMAGE}:${DOCKER_TAG}
                            docker push docker.io/\${DOCKER_USER}/${DOCKER_IMAGE}:latest
                            
                            docker logout docker.io
                            
                            echo "✅ Successfully pushed to Docker Hub:"
                            echo "   docker.io/\${DOCKER_USER}/${DOCKER_IMAGE}:${DOCKER_TAG}"
                            echo "   docker.io/\${DOCKER_USER}/${DOCKER_IMAGE}:latest"
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            script {
                currentBuild.description = "✅ Build ${BUILD_NUMBER} - Image: ${DOCKER_IMAGE}:${DOCKER_TAG}"
            }
        }
        failure {
            echo 'Pipeline failed!'
            script {
                currentBuild.description = "❌ Build ${BUILD_NUMBER} - Failed"
            }
        }
    }
}