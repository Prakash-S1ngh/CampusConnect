import React, { useState } from 'react';
import axios from 'axios';
import { url } from '../../lib/PostUrl';
import { toast } from 'react-hot-toast';

const DirectorTest = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const testDirectorLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);

        try {
            const response = await axios.post(`${url}/director/v2/login`, { 
                email, 
                password 
            }, {
                withCredentials: true,
            });

            console.log('Director login response:', response.data);
            setResult({
                success: true,
                data: response.data
            });
            toast.success('Director login test successful!');
        } catch (error) {
            console.error('Director login test error:', error);
            setResult({
                success: false,
                error: error.response?.data || error.message
            });
            toast.error('Director login test failed');
        } finally {
            setLoading(false);
        }
    };

    const testDirectorSignup = async () => {
        setLoading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('name', 'Test Director');
            formData.append('email', 'testdirector@test.com');
            formData.append('password', 'test123');
            formData.append('college', 'Test University');
            formData.append('directorRole', 'Campus Director');

            const response = await axios.post(`${url}/director/v2/signup`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" },
            });

            console.log('Director signup response:', response.data);
            setResult({
                success: true,
                data: response.data
            });
            toast.success('Director signup test successful!');
        } catch (error) {
            console.error('Director signup test error:', error);
            setResult({
                success: false,
                error: error.response?.data || error.message
            });
            toast.error('Director signup test failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Director Authentication Test</h1>
                
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Director Login</h2>
                    <form onSubmit={testDirectorLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="director@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Login'}
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Director Signup</h2>
                    <button
                        onClick={testDirectorSignup}
                        disabled={loading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                        {loading ? 'Testing...' : 'Test Signup'}
                    </button>
                </div>

                {result && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
                        <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                                {result.success ? 'Success' : 'Error'}
                            </h3>
                            <pre className="mt-2 text-sm overflow-auto">
                                {JSON.stringify(result.data || result.error, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DirectorTest; 