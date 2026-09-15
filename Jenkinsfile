pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    stages {
        stage('Deploy to EC2') {
            steps {
                sh 'sudo -n -u ubuntu /usr/local/bin/deploy-partyspace.sh'
            }
        }
    }

    post {
        success {
            echo 'Deployed successfully'
        }
        failure {
            echo 'Deploy failed - read the log above'
        }
    }
}
