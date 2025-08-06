import React, { useState, useContext } from 'react';
import axios from 'axios';
import { url } from '../../lib/PostUrl';
import { StudentContext } from '../Student/StudentContextProvider';
import { toast } from 'react-hot-toast';

const DirectorTest = () => {
    const { user } = useContext(StudentContext);
    const [testResults, setTestResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const addResult = (test, success, message, data = null) => {
        setTestResults(prev => [...prev, {
            test,
            success,
            message,
            data,
            timestamp: new Date().toLocaleTimeString()
        }]);
    };

    const testDirectorLogin = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${url}/director/v2/login`, {
                email: 'director@test.com',
                password: 'password123'
            }, {
                withCredentials: true
            });
            addResult('Director Login', true, 'Login successful', response.data);
        } catch (error) {
            addResult('Director Login', false, error.response?.data?.message || 'Login failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testDirectorInfo = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/director/v2/info`, {
                withCredentials: true
            });
            addResult('Director Info', true, 'Info fetched successfully', response.data);
        } catch (error) {
            addResult('Director Info', false, error.response?.data?.message || 'Info fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testDirectorConnections = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/director/v2/connections`, {
                withCredentials: true
            });
            addResult('Director Connections', true, 'Connections fetched successfully', response.data);
        } catch (error) {
            addResult('Director Connections', false, error.response?.data?.message || 'Connections fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testCampusStudents = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/director/v2/campus-students`, {
                withCredentials: true
            });
            addResult('Campus Students', true, 'Students fetched successfully', response.data);
        } catch (error) {
            addResult('Campus Students', false, error.response?.data?.message || 'Students fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testCampusFaculty = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/director/v2/campus-faculty`, {
                withCredentials: true
            });
            addResult('Campus Faculty', true, 'Faculty fetched successfully', response.data);
        } catch (error) {
            addResult('Campus Faculty', false, error.response?.data?.message || 'Faculty fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testCampusAlumni = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/director/v2/campus-alumni`, {
                withCredentials: true
            });
            addResult('Campus Alumni', true, 'Alumni fetched successfully', response.data);
        } catch (error) {
            addResult('Campus Alumni', false, error.response?.data?.message || 'Alumni fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testAnalytics = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/director/v2/analytics`, {
                withCredentials: true
            });
            addResult('Analytics', true, 'Analytics fetched successfully', response.data);
        } catch (error) {
            addResult('Analytics', false, error.response?.data?.message || 'Analytics fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const testFeed = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/feed/v2/getPost`, {
                withCredentials: true
            });
            addResult('Feed Posts', true, 'Feed fetched successfully', response.data);
        } catch (error) {
            addResult('Feed Posts', false, error.response?.data?.message || 'Feed fetch failed', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    const runAllTests = async () => {
        setTestResults([]);
        await testDirectorInfo();
        await testDirectorConnections();
        await testCampusStudents();
        await testCampusFaculty();
        await testCampusAlumni();
        await testAnalytics();
        await testFeed();
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold mb-4">Director API Test Panel</h1>
                    
                    <div className="mb-4">
                        <p className="text-gray-600">Current User: {user?.name || 'Not logged in'}</p>
                        <p className="text-gray-600">Role: {user?.role || 'Unknown'}</p>
                        <p className="text-gray-600">College: {user?.college?.name || 'Unknown'}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <button
                            onClick={testDirectorInfo}
                            disabled={isLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            Test Info
                        </button>
                        <button
                            onClick={testDirectorConnections}
                            disabled={isLoading}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            Test Connections
                        </button>
                        <button
                            onClick={testCampusStudents}
                            disabled={isLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                        >
                            Test Students
                        </button>
                        <button
                            onClick={testCampusFaculty}
                            disabled={isLoading}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
                        >
                            Test Faculty
                        </button>
                        <button
                            onClick={testCampusAlumni}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                        >
                            Test Alumni
                        </button>
                        <button
                            onClick={testAnalytics}
                            disabled={isLoading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                        >
                            Test Analytics
                        </button>
                        <button
                            onClick={testFeed}
                            disabled={isLoading}
                            className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50"
                        >
                            Test Feed
                        </button>
                        <button
                            onClick={runAllTests}
                            disabled={isLoading}
                            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50"
                        >
                            Run All Tests
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">Test Results</h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {testResults.map((result, index) => (
                            <div key={index} className={`p-3 rounded border ${
                                result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                            }`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{result.test}</h3>
                                        <p className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                            {result.message}
                                        </p>
                                        <p className="text-xs text-gray-500">{result.timestamp}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        {result.success ? 'SUCCESS' : 'FAILED'}
                                    </span>
                                </div>
                                {result.data && (
                                    <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-gray-600">View Data</summary>
                                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        ))}
                        {testResults.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No test results yet. Run some tests to see results.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectorTest; 