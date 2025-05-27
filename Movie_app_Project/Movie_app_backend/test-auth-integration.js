import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const MOVIE_BACKEND_URL = process.env.MOVIE_BACKEND_URL || 'http://localhost:3002';

console.log('🧪 Testing Movie App Backend Integration with Authentication Service');
console.log('='.repeat(70));

async function testAuthServiceConnection() {
    console.log('\n1. Testing Authentication Service Connection...');
    try {
        const response = await axios.get(`${AUTH_SERVICE_URL}/api/auth/me`, {
            headers: {
                Authorization: 'Bearer invalid_token'
            },
            timeout: 5000
        });
        console.log('❌ Expected 401 but got:', response.status);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Authentication service is responding correctly (401 for invalid token)');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Authentication service is not running on', AUTH_SERVICE_URL);
            console.log('   Please start the Authentication backend first:');
            console.log('   cd Authentication_Backend && npm start');
            return false;
        } else {
            console.log('❌ Unexpected error:', error.message);
            return false;
        }
    }
    return true;
}

async function testMovieBackendAuth() {
    console.log('\n2. Testing Movie Backend Auth Middleware...');
    try {
        const response = await axios.get(`${MOVIE_BACKEND_URL}/api/watched`, {
            timeout: 5000
        });
        console.log('❌ Expected 401 but got:', response.status);
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log('✅ Movie backend auth middleware is working (401 for missing token)');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('❌ Movie backend is not running on', MOVIE_BACKEND_URL);
            console.log('   Please start the Movie backend:');
            console.log('   npm start');
            return false;
        } else {
            console.log('❌ Unexpected error:', error.message);
            return false;
        }
    }
    return true;
}

async function testPublicEndpoints() {
    console.log('\n3. Testing Public Endpoints...');
    try {
        const response = await axios.get(`${MOVIE_BACKEND_URL}/api/movies/trending`, {
            timeout: 5000
        });
        console.log('✅ Public endpoint /api/movies/trending is accessible (status:', response.status, ')');
        return true;
    } catch (error) {
        console.log('❌ Error accessing public endpoint:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('Configuration:');
    console.log('  Auth Service URL:', AUTH_SERVICE_URL);
    console.log('  Movie Backend URL:', MOVIE_BACKEND_URL);
    
    const authServiceOk = await testAuthServiceConnection();
    const movieBackendOk = await testMovieBackendAuth();
    const publicEndpointsOk = await testPublicEndpoints();
    
    console.log('\n' + '='.repeat(70));
    console.log('📊 Test Results:');
    console.log('  Authentication Service:', authServiceOk ? '✅ OK' : '❌ FAIL');
    console.log('  Movie Backend Auth:', movieBackendOk ? '✅ OK' : '❌ FAIL');
    console.log('  Public Endpoints:', publicEndpointsOk ? '✅ OK' : '❌ FAIL');
    
    if (authServiceOk && movieBackendOk && publicEndpointsOk) {
        console.log('\n🎉 All tests passed! The integration is working correctly.');
        console.log('\nNext steps:');
        console.log('  1. Register a user via Authentication service: POST /api/auth/register');
        console.log('  2. Login to get a token: POST /api/auth/login');
        console.log('  3. Use the token to access protected Movie backend endpoints');
    } else {
        console.log('\n❌ Some tests failed. Please check the services and try again.');
        process.exit(1);
    }
}

runTests().catch(error => {
    console.error('❌ Test runner error:', error.message);
    process.exit(1);
}); 